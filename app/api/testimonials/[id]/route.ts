export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { testimonials, ensureTestimonialsTable } from "@/lib/testimonials-schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await ensureTestimonialsTable();

  const { id } = await params;
  const testimonialId = parseInt(id);
  if (isNaN(testimonialId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = await req.json();
  const { status } = body;

  if (!["approved", "rejected", "published", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const updated = await db
    .update(testimonials)
    .set({ status, reviewedAt: new Date() })
    .where(eq(testimonials.id, testimonialId))
    .returning({ id: testimonials.id });

  if (updated.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
