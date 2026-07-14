import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import {
  sameOriginAllowed,
  isRateLimited,
  clientIp,
  resetRateLimiterForTest,
  RATE_MAX,
  RATE_WINDOW_MS,
  MAX_TRACKED_KEYS,
} from "../route";

describe("analytics/track request guards", () => {
  // Reset the module-level map before each test so they don't leak state into
  // one another (and don't need to invent distinct keys per test).
  beforeEach(() => {
    resetRateLimiterForTest();
  });
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
    it("takes the RIGHTMOST (proxy-appended) x-forwarded-for entry", () => {
      // Rightmost is the hop a trusted appending proxy added (see clientIp docs).
      expect(clientIp("hop1, hop2, 203.0.113.7", null)).toBe("203.0.113.7");
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

    // #110 headline behavior: the bounded map evicts oldest-inserted entries
    // under a unique-key flood, so a formerly-blocked oldest key comes back
    // "fresh" once evicted.
    it("evicts the oldest-inserted key when flooded past MAX_TRACKED_KEYS", () => {
      const victim = "oldest-victim";
      // Push the victim over the limit — while its entry survives it stays blocked.
      for (let i = 0; i < RATE_MAX + 1; i++) isRateLimited(victim);
      expect(isRateLimited(victim)).toBe(true);

      // Flood > MAX_TRACKED_KEYS fresh unique keys in the same window. Eviction
      // removes oldest-inserted entries — the victim (inserted first) among them.
      for (let i = 0; i <= MAX_TRACKED_KEYS; i++) isRateLimited(`flood-${i}`);

      // Evicted → treated as a brand-new key again (allowed). If eviction had
      // NOT happened, the victim's entry would still be over the cap (blocked).
      expect(isRateLimited(victim)).toBe(false);
    });
  });
});
