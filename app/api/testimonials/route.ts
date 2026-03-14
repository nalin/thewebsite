import { NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import {
  testimonialsDb,
  seedTestimonialsIfEmpty,
} from "@/lib/testimonials-db";
import { testimonials } from "@/lib/testimonials-schema";
import { getSession } from "@/lib/session";

// GET /api/testimonials?featured=true
export async function GET(request: Request) {
  try {
    await seedTestimonialsIfEmpty();

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

// POST /api/testimonials (admin only)
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await seedTestimonialsIfEmpty();

    const body = await request.json();
    const { name, role, company, testimonial, avatarUrl, featured } = body;

    if (!name || !testimonial) {
      return NextResponse.json(
        { error: "name and testimonial are required" },
        { status: 400 }
      );
    }

    const [created] = await testimonialsDb
      .insert(testimonials)
      .values({
        name,
        role: role || null,
        company: company || null,
        testimonial,
        avatarUrl: avatarUrl || null,
        featured: featured ?? false,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/testimonials error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
