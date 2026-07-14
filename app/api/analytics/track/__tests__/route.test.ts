import { describe, it, expect, vi, afterEach } from "vitest";
import {
  sameOriginAllowed,
  isRateLimited,
  clientIp,
  RATE_MAX,
  RATE_WINDOW_MS,
} from "../route";

describe("analytics/track request guards", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  describe("sameOriginAllowed", () => {
    it("accepts a matching same-origin request (Origin)", () => {
      expect(sameOriginAllowed("site.com", "https://site.com", null)).toBe(true);
    });
    it("accepts via Referer when Origin is absent", () => {
      expect(sameOriginAllowed("site.com", null, "https://site.com/page")).toBe(
        true
      );
    });
    it("rejects when neither Origin nor Referer is present (scripted POST)", () => {
      expect(sameOriginAllowed("site.com", null, null)).toBe(false);
    });
    it("rejects a cross-origin request", () => {
      expect(sameOriginAllowed("site.com", "https://evil.com", null)).toBe(
        false
      );
    });
    it("rejects when the host is unknown", () => {
      expect(sameOriginAllowed(null, "https://site.com", null)).toBe(false);
    });
  });

  describe("clientIp (rightmost / platform IP, not spoofable leftmost)", () => {
    it("prefers the platform-set x-real-ip header", () => {
      expect(clientIp("1.1.1.1, 2.2.2.2", "9.9.9.9")).toBe("9.9.9.9");
    });
    it("uses the RIGHTMOST x-forwarded-for entry, defeating leftmost spoofing", () => {
      // An attacker prepends fake entries; the platform appends the real IP last.
      expect(clientIp("fake1, fake2, 203.0.113.7", null)).toBe("203.0.113.7");
    });
    it("handles a single-value x-forwarded-for", () => {
      expect(clientIp("203.0.113.7", null)).toBe("203.0.113.7");
    });
    it('falls back to "unknown" when no IP headers are present', () => {
      expect(clientIp(null, null)).toBe("unknown");
    });
  });

  describe("isRateLimited", () => {
    it("allows up to RATE_MAX in a window and blocks the (N+1)th", () => {
      const key = "track-under-threshold";
      for (let i = 0; i < RATE_MAX; i++) {
        expect(isRateLimited(key)).toBe(false);
      }
      expect(isRateLimited(key)).toBe(true);
    });

    it("resets after the window elapses", () => {
      vi.useFakeTimers();
      const key = "track-reset-window";
      for (let i = 0; i < RATE_MAX; i++) isRateLimited(key);
      expect(isRateLimited(key)).toBe(true); // over the cap now
      vi.advanceTimersByTime(RATE_WINDOW_MS + 1);
      expect(isRateLimited(key)).toBe(false); // fresh window
    });
  });
});
