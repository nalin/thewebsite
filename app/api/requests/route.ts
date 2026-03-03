export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requests, votes, users } from "@/lib/schema";
import { eq, sql, desc } from "drizzle-orm";
import { getSession } from "@/lib/session";

export async function GET() {
  const result = await db
    .select({
      id: requests.id,
      title: requests.title,
      description: requests.description,
      type: requests.type,
      status: requests.status,
      createdAt: requests.createdAt,
      userId: requests.userId,
      authorName: users.name,
      authorImage: users.image,
      score: sql<number>`coalesce(sum(${votes.value}), 0)`.as("score"),
    })
    .from(requests)
    .leftJoin(votes, eq(requests.id, votes.requestId))
    .leftJoin(users, eq(requests.userId, users.id))
    .groupBy(requests.id)
    .orderBy(desc(sql`score`));

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, type } = body;

  if (!title || !description || !["feature", "bug"].includes(type)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [created] = await db
    .insert(requests)
    .values({
      title,
      description,
      type,
      userId: session.user.id,
    })
    .returning();

  return NextResponse.json(created, { status: 201 });
}
