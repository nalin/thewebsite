export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { votes } from "@/lib/schema";
import { and, eq } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const requestId = parseInt(id);
  const body = await req.json();
  const value = body.value;

  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: "Value must be 1 or -1" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(votes)
    .where(
      and(eq(votes.requestId, requestId), eq(votes.userId, session.user.id))
    )
    .get();

  if (existing) {
    if (existing.value === value) {
      // Remove vote (toggle off)
      await db
        .delete(votes)
        .where(
          and(
            eq(votes.requestId, requestId),
            eq(votes.userId, session.user.id)
          )
        );
      return NextResponse.json({ voted: null });
    } else {
      // Change vote direction
      await db
        .update(votes)
        .set({ value })
        .where(
          and(
            eq(votes.requestId, requestId),
            eq(votes.userId, session.user.id)
          )
        );
      return NextResponse.json({ voted: value });
    }
  }

  // New vote
  await db.insert(votes).values({
    requestId,
    userId: session.user.id,
    value,
  });

  return NextResponse.json({ voted: value });
}
