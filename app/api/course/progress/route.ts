import { NextRequest, NextResponse } from "next/server";
import { recordProgress, getAnalytics } from "@/lib/progress-db";
import { getSession } from "@/lib/session";
import {
  sameOriginAllowed,
  clientIp,
  createRateLimiter,
} from "@/lib/request-guards";

// This POST is unauthenticated by design — course progress is tracked per
// anonymous sessionId — so the client-supplied moduleId/sessionId land in a
// table the admin analytics view reads. Without a guard, a scripted POST loop
// can poison those numbers. Same guards as the sibling /api/analytics/track:
// same-origin (real beacons come from our own course pages) plus a light
// per-IP rate limit. A reader fires a handful of events per module, so the
// ceiling is generous for humans and useless for a flood. (Issue #154 item 1.)
export { sameOriginAllowed, clientIp } from "@/lib/request-guards";

export const RATE_MAX = 60; // progress events per window per IP
export const RATE_WINDOW_MS = 10_000;
export const MAX_TRACKED_KEYS = 10_000;
const limiter = createRateLimiter({
  max: RATE_MAX,
  windowMs: RATE_WINDOW_MS,
  maxTrackedKeys: MAX_TRACKED_KEYS,
});
export function isRateLimited(key: string): boolean {
  return limiter.isRateLimited(key);
}
// Test-only: clear the module-level counters so tests don't leak state.
export function resetRateLimiterForTest(): void {
  limiter.reset();
}

function isSameOrigin(request: NextRequest): boolean {
  // Prefer the Host header (the public host in production); fall back to the
  // request URL's host (Host is a forbidden header the platform sets, and it's
  // absent on synthetic requests).
  return sameOriginAllowed(
    request.headers.get("host") || request.nextUrl.host,
    request.headers.get("origin"),
    request.headers.get("referer")
  );
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ip = clientIp(
      request.headers.get("x-forwarded-for"),
      request.headers.get("x-real-ip")
    );
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { moduleId, timeSpent, sessionId } = body;

    if (!moduleId || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof moduleId !== "number" || moduleId < 1 || moduleId > 10) {
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
