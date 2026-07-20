import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import {
  POST,
  sameOriginAllowed,
  clientIp,
  isRateLimited,
  resetRateLimiterForTest,
  RATE_MAX,
  RATE_WINDOW_MS,
} from "../route";

// Recording progress is the only DB touch on the happy path; mock it so this
// stays a unit test and importing the route opens no connection.
const recordProgress = vi.fn().mockResolvedValue(undefined);
vi.mock("@/lib/progress-db", () => ({
  recordProgress: (...args: unknown[]) => recordProgress(...args),
  getAnalytics: vi.fn().mockResolvedValue({}),
}));
vi.mock("@/lib/session", () => ({
  getSession: vi.fn().mockResolvedValue(null),
}));

function post(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost:3000/api/course/progress", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
}

const valid = { moduleId: 1, sessionId: "s-1", timeSpent: 30 };

// Issue #154 item 1: this POST is unauthenticated, so a scripted loop could
// write arbitrary moduleId/sessionId rows straight into the admin analytics
// numbers. It now carries the same origin + rate-limit guards as its sibling
// /api/analytics/track.
describe("POST /api/course/progress — same-origin guard", () => {
  beforeEach(() => {
    resetRateLimiterForTest();
    recordProgress.mockClear();
  });

  it("rejects a POST carrying neither Origin nor Referer", async () => {
    const response = await POST(post(valid));

    expect(response.status).toBe(403);
    // The metric-poisoning write never happens.
    expect(recordProgress).not.toHaveBeenCalled();
  });

  it("rejects a malformed payload the same way — the guard runs first", async () => {
    const response = await POST(post({ moduleId: 999, sessionId: 42 }));

    expect(response.status).toBe(403);
    expect(recordProgress).not.toHaveBeenCalled();
  });
});

// The pass path can't be exercised through POST: undici strips Origin/Referer
// (forbidden headers) from a synthetic Request, so a unit-test request can
// never look same-origin. That's the same reason the analytics/track and
// testimonials suites test the decision function directly.
describe("course/progress guard helpers", () => {
  beforeEach(() => {
    resetRateLimiterForTest();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts our own origin and rejects anything else", () => {
    expect(
      sameOriginAllowed("thewebsite.app", "https://thewebsite.app", null)
    ).toBe(true);
    expect(
      sameOriginAllowed(
        "thewebsite.app",
        null,
        "https://thewebsite.app/course/module-1"
      )
    ).toBe(true);
    expect(
      sameOriginAllowed("thewebsite.app", "https://evil.example", null)
    ).toBe(false);
    expect(sameOriginAllowed("thewebsite.app", null, null)).toBe(false);
  });

  it("keys the limit on the platform-set client IP", () => {
    expect(clientIp("1.1.1.1", "2.2.2.2")).toBe("2.2.2.2");
    expect(clientIp("1.1.1.1, 3.3.3.3", null)).toBe("3.3.3.3");
    expect(clientIp(null, null)).toBe("unknown");
  });

  it("allows a reader's normal event volume, then limits a flood", () => {
    for (let i = 0; i < RATE_MAX; i++) {
      expect(isRateLimited("ip")).toBe(false);
    }
    expect(isRateLimited("ip")).toBe(true);
  });

  it("does not penalise a different IP", () => {
    for (let i = 0; i <= RATE_MAX; i++) isRateLimited("flooder");
    expect(isRateLimited("someone-else")).toBe(false);
  });

  it("forgets the flood after the window", () => {
    vi.useFakeTimers();
    for (let i = 0; i <= RATE_MAX; i++) isRateLimited("ip");
    expect(isRateLimited("ip")).toBe(true);

    vi.advanceTimersByTime(RATE_WINDOW_MS + 1);

    expect(isRateLimited("ip")).toBe(false);
  });

  // Each route owns its counters — a page-view flood must not exhaust the
  // course-progress budget (they were separate maps before the extraction).
  it("has its own counters, separate from the sibling routes", async () => {
    const track = await import("@/app/api/analytics/track/route");
    for (let i = 0; i <= RATE_MAX; i++) isRateLimited("shared-ip");

    expect(isRateLimited("shared-ip")).toBe(true);
    expect(track.isRateLimited("shared-ip")).toBe(false);

    track.resetRateLimiterForTest();
  });
});
