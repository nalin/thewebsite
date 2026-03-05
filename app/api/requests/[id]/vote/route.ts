export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { votes, issueCache } from "@/lib/schema";
import { and, eq, sql } from "drizzle-orm";
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
  const issueNumber = parseInt(id);
  const body = await req.json();
  const value = body.value;

  if (value !== 1 && value !== -1) {
    return NextResponse.json({ error: "Value must be 1 or -1" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(votes)
    .where(
      and(eq(votes.issueNumber, issueNumber), eq(votes.userId, session.user.id))
    )
    .get();

  if (existing) {
    if (existing.value === value) {
      // Toggle off
      await db
        .delete(votes)
        .where(
          and(eq(votes.issueNumber, issueNumber), eq(votes.userId, session.user.id))
        );
      await updateCachedCounts(issueNumber);
      return NextResponse.json({ voted: null });
    } else {
      // Change direction
      await db
        .update(votes)
        .set({ value })
        .where(
          and(eq(votes.issueNumber, issueNumber), eq(votes.userId, session.user.id))
        );
      await updateCachedCounts(issueNumber);
      return NextResponse.json({ voted: value });
    }
  }

  // New vote
  await db.insert(votes).values({
    issueNumber,
    userId: session.user.id,
    value,
  });
  await updateCachedCounts(issueNumber);
  return NextResponse.json({ voted: value });
}

async function updateCachedCounts(issueNumber: number) {
  const counts = await db
    .select({
      thumbsUp: sql<number>`coalesce(sum(case when ${votes.value} = 1 then 1 else 0 end), 0)`,
      thumbsDown: sql<number>`coalesce(sum(case when ${votes.value} = -1 then 1 else 0 end), 0)`,
    })
    .from(votes)
    .where(eq(votes.issueNumber, issueNumber))
    .get();

  if (counts) {
    await db
      .update(issueCache)
      .set({ thumbsUp: counts.thumbsUp, thumbsDown: counts.thumbsDown })
      .where(eq(issueCache.issueNumber, issueNumber));
  }
}
