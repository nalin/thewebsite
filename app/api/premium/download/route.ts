import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { COURSE_PRODUCT_ID } from "@/lib/stripe";

const ALLOWED_FILES = new Set([
  "ai-agent-starter-kit.zip",
  "multi-agent-orchestration.zip",
  "prompt-engineering-playbook.md",
  "agent-eval-framework.zip",
  "production-checklist.md",
]);

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const purchase = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, session.user.id),
        eq(purchases.productId, COURSE_PRODUCT_ID),
        eq(purchases.status, "completed")
      )
    )
    .get();

  if (!purchase) {
    return NextResponse.json({ error: "Purchase required" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("file");

  if (!filename || !ALLOWED_FILES.has(filename)) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // In production, redirect to a signed S3/Cloudflare R2 URL or serve from public/templates.
  // For now, return a placeholder response indicating the file would be served.
  return NextResponse.json(
    { error: "Template files are being prepared. Check back soon or contact support." },
    { status: 503 }
  );
}
