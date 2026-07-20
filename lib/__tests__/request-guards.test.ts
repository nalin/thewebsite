import { describe, it, expect, vi, afterEach } from "vitest";
import {
  sameOriginAllowed,
  clientIp,
  createRateLimiter,
} from "../request-guards";

// The three public write endpoints (analytics/track, testimonials,
// course/progress) each kept their own copy of these guards. They share this
// module now, so the behaviour is pinned here once.

describe("sameOriginAllowed", () => {
  it("accepts an Origin whose host matches", () => {
    expect(
      sameOriginAllowed("thewebsite.app", "https://thewebsite.app", null)
    ).toBe(true);
  });

  it("accepts a Referer whose host matches when Origin is absent", () => {
    expect(
      sameOriginAllowed("thewebsite.app", null, "https://thewebsite.app/course")
    ).toBe(true);
  });

  it("rejects a request with neither header (a scripted POST)", () => {
    expect(sameOriginAllowed("thewebsite.app", null, null)).toBe(false);
  });

  it("rejects another origin", () => {
    expect(
      sameOriginAllowed("thewebsite.app", "https://evil.example", null)
    ).toBe(false);
  });

  it("rejects when the host is unknown", () => {
    expect(sameOriginAllowed(null, "https://thewebsite.app", null)).toBe(false);
  });

  it("ignores a malformed header and keeps checking the next", () => {
    expect(
      sameOriginAllowed("thewebsite.app", "not a url", "https://thewebsite.app")
    ).toBe(true);
  });
});

describe("clientIp", () => {
  it("prefers x-real-ip", () => {
    expect(clientIp("1.1.1.1", "2.2.2.2")).toBe("2.2.2.2");
  });

  it("falls back to the rightmost x-forwarded-for entry", () => {
    expect(clientIp("1.1.1.1, 3.3.3.3", null)).toBe("3.3.3.3");
  });

  it("returns a stable key when neither header is present", () => {
    expect(clientIp(null, null)).toBe("unknown");
    expect(clientIp(null, "   ")).toBe("unknown");
  });
});

describe("createRateLimiter", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows up to max hits per window, then limits", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 10_000 });
    expect(limiter.isRateLimited("ip")).toBe(false); // 1
    expect(limiter.isRateLimited("ip")).toBe(false); // 2
    expect(limiter.isRateLimited("ip")).toBe(false); // 3
    expect(limiter.isRateLimited("ip")).toBe(true); // 4 — over
  });

  it("keys are independent", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 10_000 });
    expect(limiter.isRateLimited("a")).toBe(false);
    expect(limiter.isRateLimited("a")).toBe(true);
    expect(limiter.isRateLimited("b")).toBe(false);
  });

  // The whole point of the factory: each route gets its own counters, so a
  // flood of page-view beacons can't exhaust the testimonial submission budget.
  it("two limiters do not share state", () => {
    const one = createRateLimiter({ max: 1, windowMs: 10_000 });
    const two = createRateLimiter({ max: 1, windowMs: 10_000 });
    expect(one.isRateLimited("ip")).toBe(false);
    expect(one.isRateLimited("ip")).toBe(true);
    expect(two.isRateLimited("ip")).toBe(false);
  });

  it("resets after the window elapses", () => {
    vi.useFakeTimers();
    const limiter = createRateLimiter({ max: 1, windowMs: 10_000 });
    expect(limiter.isRateLimited("ip")).toBe(false);
    expect(limiter.isRateLimited("ip")).toBe(true);
    vi.advanceTimersByTime(10_001);
    expect(limiter.isRateLimited("ip")).toBe(false);
  });

  it("reset() drops all counters", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 10_000 });
    limiter.isRateLimited("ip");
    limiter.reset();
    expect(limiter.isRateLimited("ip")).toBe(false);
  });

  it("bounds memory under a flood of unique keys", () => {
    const limiter = createRateLimiter({
      max: 5,
      windowMs: 60_000,
      maxTrackedKeys: 50,
    });
    for (let i = 0; i < 500; i++) limiter.isRateLimited(`ip-${i}`);
    // Evicted keys start over rather than being stuck limited — the ceiling
    // trades a little accuracy for a hard memory bound, by design.
    expect(limiter.isRateLimited("ip-0")).toBe(false);
  });
});
