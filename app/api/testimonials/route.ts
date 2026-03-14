export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testimonials, ensureTestimonialsTable } from "@/lib/testimonials-schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  await ensureTestimonialsTable();

  const published = await db
    .select({
      id: testimonials.id,
      name: testimonials.name,
      role: testimonials.role,
      company: testimonials.company,
      testimonialText: testimonials.testimonialText,
      rating: testimonials.rating,
      createdAt: testimonials.createdAt,
    })
    .from(testimonials)
    .where(eq(testimonials.status, "published"))
    .orderBy(desc(testimonials.createdAt))
    .all();

  return NextResponse.json(published);
}

export async function POST(req: Request) {
  await ensureTestimonialsTable();

  const body = await req.json();
  const { name, role, company, testimonialText, rating, consentPublic, submitterEmail } = body;

  if (!name || !testimonialText || !rating) {
    return NextResponse.json({ error: "name, testimonialText, and rating are required" }, { status: 400 });
  }

  const ratingNum = parseInt(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return NextResponse.json({ error: "rating must be 1-5" }, { status: 400 });
  }

  if (name.length > 100 || (role && role.length > 100) || (company && company.length > 100)) {
    return NextResponse.json({ error: "Name/role/company too long" }, { status: 400 });
  }

  if (testimonialText.length > 2000) {
    return NextResponse.json({ error: "Testimonial text too long (max 2000 chars)" }, { status: 400 });
  }

  const result = await db
    .insert(testimonials)
    .values({
      name: name.trim(),
      role: role?.trim() || null,
      company: company?.trim() || null,
      testimonialText: testimonialText.trim(),
      rating: ratingNum,
      consentPublic: !!consentPublic,
      submitterEmail: submitterEmail?.trim() || null,
      createdAt: new Date(),
    })
    .returning({ id: testimonials.id });

  return NextResponse.json({ id: result[0].id, message: "Testimonial submitted for review" }, { status: 201 });
}
