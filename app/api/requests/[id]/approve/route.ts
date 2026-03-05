export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { addLabel, addComment } from "@/lib/github";
import { db } from "@/lib/db";
import { issueCache } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const issueNumber = parseInt(id);

  // Add accepted label via bot
  await addLabel(issueNumber, "accepted");
  await addComment(
    issueNumber,
    "This request has been approved and will be implemented by the AI agent."
  );

  // Update cache
  await db
    .update(issueCache)
    .set({ status: "accepted" })
    .where(eq(issueCache.issueNumber, issueNumber));

  // Trigger GitHub Actions workflow
  const triggerRes = await fetch(
    `https://api.github.com/repos/nalin/thewebsite/actions/workflows/agent.yml/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_WORKFLOW_TOKEN}`,
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({
        ref: "main",
        inputs: {
          issue_number: String(issueNumber),
        },
      }),
    }
  );

  if (!triggerRes.ok) {
    const text = await triggerRes.text();
    console.error("Failed to trigger workflow:", text);
    return NextResponse.json(
      { error: "Approved but failed to trigger agent" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
