import { NextRequest, NextResponse } from "next/server";
import { createAccessToken, sendConfirmationEmail } from "@/lib/course-access";
import { logFunnelEvent } from "@/lib/funnel";
import { verifySignupForm } from "@/lib/form-guard";
import { clientIp, createRateLimiter } from "@/lib/request-guards";

// Only allow same-site course destinations to avoid open-redirect issues.
function sanitizeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/course")) return null;
  if (next.includes("//") || next.includes("\\")) return null;
  return next;
}

// Caps on confirmation-email sends (issue #203 layer 3): even a bot that
// defeats the form guard cannot use this endpoint as a mail cannon. Per-IP
// keeps one source from burning the budget; the global ceiling bounds a
// distributed campaign's blast radius per instance per day. In-memory and
// per-instance (see the note on createRateLimiter) — a soft brake behind the
// form guard, not the primary defence.
const ipSendLimiter = createRateLimiter({ max: 5, windowMs: 24 * 60 * 60 * 1000 });
const globalSendLimiter = createRateLimiter({ max: 150, windowMs: 24 * 60 * 60 * 1000 });

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = (formData.get("email") as string | null)?.trim() || "";
  const next = sanitizeNext(formData.get("next") as string | null);

  const accessUrl = (params: Record<string, string>) => {
    const url = new URL("/course/access", request.url);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    if (next) url.searchParams.set("next", next);
    return url;
  };

  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.redirect(accessUrl({ error: "invalid_email" }));
  }

  // source distinguishes wall submits from the /course inline forms.
  const referer = request.headers.get("referer");
  let source: string | null = null;
  try {
    source = referer ? new URL(referer).pathname : null;
  } catch {
    // Malformed referer — leave source null.
  }

  // Anti-spam gate (issue #203): the form token proves the submitter fetched a
  // page; the honeypot catches form-fillers. Rejected submits are logged as
  // their own funnel event so the campaign stays observable, and the redirect
  // is deliberately generic — no hint about which check failed.
  const guard = verifySignupForm(formData);
  if (!guard.ok) {
    await logFunnelEvent("wall_reject", { email, module: next, source });
    return NextResponse.redirect(accessUrl({ error: "invalid_submission" }));
  }

  await logFunnelEvent("wall_submit", { email, module: next, source });

  try {
    // NOTE (issue #203 layer 2): the waitlist/subscriber inserts that used to
    // live here moved to /api/course/confirm — an address joins the list only
    // once its owner clicks the double-opt-in link.

    const ip = clientIp(
      request.headers.get("x-forwarded-for"),
      request.headers.get("x-real-ip")
    );
    if (ipSendLimiter.isRateLimited(ip) || globalSendLimiter.isRateLimited("global")) {
      console.error(
        `[COURSE ACCESS] confirmation-email cap tripped (ip=${ip}) — possible abuse, see issue #203`
      );
      return NextResponse.redirect(accessUrl({ error: "rate_limited" }));
    }

    const token = await createAccessToken(email, next);
    const sent = await sendConfirmationEmail(email, token);
    if (!sent.success) {
      return NextResponse.redirect(accessUrl({ error: "send_failed" }));
    }
    return NextResponse.redirect(accessUrl({ sent: "1" }));
  } catch (error) {
    console.error("[COURSE ACCESS] request error:", error);
    return NextResponse.redirect(accessUrl({ error: "server_error" }));
  }
}
