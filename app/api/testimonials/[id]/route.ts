import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { testimonialsDb, initTestimonialsTable } from "@/lib/testimonials-db";
import { testimonials } from "@/lib/testimonials-schema";
import { getSession } from "@/lib/session";

// PATCH /api/testimonials/:id (admin only)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initTestimonialsTable();

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const { name, role, company, testimonial, avatarUrl, featured } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role || null;
    if (company !== undefined) updateData.company = company || null;
    if (testimonial !== undefined) updateData.testimonial = testimonial;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null;
    if (featured !== undefined) updateData.featured = featured;

    const [updated] = await testimonialsDb
      .update(testimonials)
      .set(updateData)
      .where(eq(testimonials.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json(
        { error: "Testimonial not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH /api/testimonials/:id error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// DELETE /api/testimonials/:id (admin only)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await initTestimonialsTable();

    const { id: idStr } = await params;
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await testimonialsDb
      .delete(testimonials)
      .where(eq(testimonials.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/testimonials/:id error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
