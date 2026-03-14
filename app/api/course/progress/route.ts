import { NextRequest, NextResponse } from "next/server";
import { recordProgress, getAnalytics } from "@/lib/progress-db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { moduleId, timeSpent, sessionId } = body;

    if (!moduleId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof moduleId !== "number" || moduleId < 1 || moduleId > 20) {
      return NextResponse.json({ error: "Invalid moduleId" }, { status: 400 });
    }

    if (typeof sessionId !== "string" || sessionId.length > 100) {
      return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
    }

    await recordProgress(
      sessionId,
      moduleId,
      typeof timeSpent === "number" ? Math.min(timeSpent, 86400) : 0
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to record progress" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const analytics = await getAnalytics();
    return NextResponse.json(analytics);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
