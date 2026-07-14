import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import {
  testimonialsDb,
  initTestimonialsTable,
  recordSubmitterEmail,
} from "@/lib/testimonials-db";
import { testimonials } from "@/lib/testimonials-schema";
import { getSession } from "@/lib/session";

// Same-origin guard + light in-memory rate limit, mirroring /api/analytics/track:
// real submissions come from our own /testimonials page (Origin/Referer host
// matches Host); scripted spam POSTs don't. The limit is per server instance —
// not a hard cross-instance guarantee, but it blunts submission floods with no
// dependency.
const RATE_MAX = 10; // submissions per window per IP
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const rateHits = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateHits.get(key);
  if (!entry || now > entry.resetAt) {
    rateHits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (rateHits.size > 5000) {
      for (const [k, v] of rateHits) if (now > v.resetAt) rateHits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

export interface TestimonialValues {
  name: string;
  role: string | null;
  company: string | null;
  testimonial: string;
  avatarUrl: string | null;
  rating: number | null;
  consent: boolean;
  featured: boolean;
}
export type SubmissionResult =
  | { ok: true; values: TestimonialValues }
  | { ok: false; error: string };

// Pure validation + normalization of a testimonial submission — no DB, no
// headers — so it's fully unit-testable. Aligns the form's field names
// (testimonialText/consentPublic) with the admin client's (testimonial/featured).
export function validateTestimonialSubmission(
  body: Record<string, unknown>,
  isAdmin: boolean
): SubmissionResult {
  const rawText =
    typeof body.testimonial === "string" && body.testimonial.trim()
      ? body.testimonial
      : (body.testimonialText as unknown);
  const text = typeof rawText === "string" ? rawText : undefined;
  const consent = Boolean(body.consent ?? body.consentPublic);

  if (
    !body.name ||
    typeof body.name !== "string" ||
    !text ||
    typeof text !== "string"
  ) {
    return { ok: false, error: "name and testimonial are required" };
  }

  let rating: number | null = null;
  const rawRating = body.rating;
  if (rawRating !== undefined && rawRating !== null && rawRating !== 0) {
    const r = Number(rawRating);
    if (!Number.isInteger(r) || r < 1 || r > 5) {
      return { ok: false, error: "rating must be an integer 1-5" };
    }
    rating = r;
  }

  // Public submitters must consent to public display; admins are curating.
  if (!isAdmin && !consent) {
    return {
      ok: false,
      error: "Please consent to public display of your testimonial.",
    };
  }

  return {
    ok: true,
    values: {
      name: body.name.slice(0, 100),
      role: body.role ? String(body.role).slice(0, 100) : null,
      company: body.company ? String(body.company).slice(0, 100) : null,
      testimonial: text.slice(0, 2000),
      avatarUrl: body.avatarUrl ? String(body.avatarUrl).slice(0, 500) : null,
      rating,
      consent: isAdmin ? true : consent,
      featured: isAdmin ? Boolean(body.featured) : false,
    },
  };
}

function isSameOrigin(request: NextRequest): boolean {
  // Prefer the Host header (the public host in production); fall back to the
  // request URL's host (the Host header is a forbidden header the platform
  // sets, and it's absent on synthetic requests).
  const host = request.headers.get("host") || request.nextUrl.host;
  if (!host) return false;
  for (const header of ["origin", "referer"] as const) {
    const value = request.headers.get(header);
    if (!value) continue;
    try {
      if (new URL(value).host === host) return true;
    } catch {
      // malformed header — ignore
    }
  }
  return false;
}

// GET /api/testimonials?featured=true
// Safe to select all columns: PII (submitter email) is NOT in this table.
export async function GET(request: Request) {
  try {
    await initTestimonialsTable();

    const { searchParams } = new URL(request.url);
    const featuredOnly = searchParams.get("featured") === "true";

    const query = featuredOnly
      ? testimonialsDb
          .select()
          .from(testimonials)
          .where(eq(testimonials.featured, true))
          .orderBy(desc(testimonials.createdAt))
      : testimonialsDb
          .select()
          .from(testimonials)
          .orderBy(desc(testimonials.createdAt));

    const rows = await query;
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/testimonials error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// POST /api/testimonials
// Public path: an unauthenticated visitor submits a testimonial. It is created
// unpublished (featured=0), pending admin review. Admins may create featured
// rows directly. Submitter email (if given) is stored PII-isolated and never
// echoed back.
export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many submissions. Please try again later." },
        { status: 429 }
      );
    }

    await initTestimonialsTable();

    const session = await getSession();
    const isAdmin = Boolean(session?.user?.isAdmin);

    const body = await request.json();

    const result = validateTestimonialSubmission(body, isAdmin);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const [created] = await testimonialsDb
      .insert(testimonials)
      .values(result.values)
      .returning();

    // Store the submitter email PII-isolated (separate table). Never echoed.
    const submitterEmail = body.submitterEmail;
    if (typeof submitterEmail === "string" && submitterEmail.trim()) {
      await recordSubmitterEmail(created.id, submitterEmail);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json({ error: "Failed to submit" }, { status: 500 });
  }
}
