export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { issueCache } from "@/lib/schema";
import { desc, sql } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { createIssue, getInstallationToken, listIssues } from "@/lib/github";

export async function GET() {
  // Try to serve from cache first
  let cached = await db
    .select()
    .from(issueCache)
    .orderBy(desc(sql`${issueCache.thumbsUp} - ${issueCache.thumbsDown}`))
    .all();

  // If cache is empty or stale (>5 min), sync from GitHub
  const now = Date.now();
  const isStale =
    cached.length === 0 ||
    cached.some((c) => now - new Date(c.cachedAt).getTime() > 5 * 60 * 1000);

  if (isStale) {
    try {
      const issues = await listIssues();
      // Upsert into cache
      for (const issue of issues) {
        const type = issue.labels.some((l) => l.name === "bug")
          ? "bug"
          : "feature";

        const statusLabel = issue.labels.find((l) =>
          ["accepted", "rejected", "in_progress", "deployed"].includes(l.name)
        );
        const status = statusLabel
          ? (statusLabel.name as "accepted" | "rejected" | "in_progress" | "deployed")
          : "open";

        await db
          .insert(issueCache)
          .values({
            issueNumber: issue.number,
            title: issue.title,
            body: issue.body,
            type,
            status,
            authorGithub: issue.user.login,
            authorAvatar: issue.user.avatar_url,
            thumbsUp: issue.reactions["+1"],
            thumbsDown: issue.reactions["-1"],
            htmlUrl: issue.html_url,
            createdAt: issue.created_at,
            cachedAt: new Date(),
          })
          .onConflictDoUpdate({
            target: issueCache.issueNumber,
            set: {
              title: issue.title,
              body: issue.body,
              type,
              status,
              thumbsUp: issue.reactions["+1"],
              thumbsDown: issue.reactions["-1"],
              cachedAt: new Date(),
            },
          });
      }

      cached = await db
        .select()
        .from(issueCache)
        .orderBy(desc(sql`${issueCache.thumbsUp} - ${issueCache.thumbsDown}`))
        .all();
    } catch (e) {
      console.error("Failed to sync from GitHub:", e);
      // Fall through with whatever cache we have
    }
  }

  return NextResponse.json(cached);
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

  // Use installation token (bot) to create issue, attributed to the user
  const installationToken = await getInstallationToken();

  const githubUser = session.user.githubUsername ?? session.user.name ?? "unknown";
  const issueBody = `${description}\n\n---\n_Submitted by @${githubUser} via [The Website](${process.env.NEXTAUTH_URL || "https://thewebsite.vercel.app"})_`;
  const labels = [type];

  const issue = await createIssue(installationToken, title, issueBody, labels);

  // Add to cache
  await db.insert(issueCache).values({
    issueNumber: issue.number,
    title,
    body: description,
    type: type as "feature" | "bug",
    status: "open",
    authorGithub: githubUser,
    authorAvatar: session.user.image,
    thumbsUp: 0,
    thumbsDown: 0,
    htmlUrl: issue.html_url,
    createdAt: new Date().toISOString(),
    cachedAt: new Date(),
  });

  return NextResponse.json({ issueNumber: issue.number, htmlUrl: issue.html_url }, { status: 201 });
}
