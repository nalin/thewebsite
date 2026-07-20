// Shared request guards for public write endpoints.
//
// These were written for /api/analytics/track, then copy-pasted into
// /api/testimonials; /api/course/progress needed them too (issue #154 item 1).
// Three hand-maintained copies of a rate limiter is how they drift, so the
// logic lives here once and each route supplies its own limits and its own
// counter map via createRateLimiter().

// Same-origin guard: real browser writes carry an Origin (POST) or a Referer
// whose host matches ours. Direct scripted POSTs (curl/bots aiming to poison
// metrics) carry neither, so they're rejected.
//
// Pure (header values in) so it can be unit-tested — the browser-set
// Origin/Host headers can't be forged by a script, which is also why they
// can't be injected into a synthetic test request.
export function sameOriginAllowed(
  host: string | null,
  origin: string | null,
  referer: string | null
): boolean {
  if (!host) return false;
  for (const value of [origin, referer]) {
    if (!value) continue;
    try {
      if (new URL(value).host === host) return true;
    } catch {
      // malformed header — ignore and try the next
    }
  }
  return false;
}

// Client IP for rate-limit keying. On Vercel, x-real-ip is the platform-set
// client IP and is the primary, trustworthy source. The x-forwarded-for
// fallback takes the RIGHTMOST entry — but note WHY: on Vercel, XFF is
// effectively single-valued (the platform overwrites it and drops any
// client-supplied value), so leftmost vs rightmost is moot there; there is no
// "attacker rotating fake leftmost IPs" vector on Vercel. Rightmost is the
// correct choice only on a stack that APPENDS the real client IP to a
// client-supplied XFF via a trusted proxy. Do NOT over-trust XFF as
// unspoofable: without such a proxy it is fully client-controlled, and under a
// Vercel Enterprise trusted-proxy config XFF can carry multiple hops where the
// rightmost is your proxy, not the true client — revisit this if that's enabled.
export function clientIp(
  xForwardedFor: string | null,
  xRealIp: string | null
): string {
  if (xRealIp && xRealIp.trim()) return xRealIp.trim();
  if (xForwardedFor) {
    const parts = xForwardedFor.split(",");
    const rightmost = parts[parts.length - 1]?.trim();
    if (rightmost) return rightmost;
  }
  return "unknown";
}

export interface RateLimiter {
  /** True when this key has exceeded `max` hits in the current window. */
  isRateLimited(key: string): boolean;
  /** Test-only: drop all counters so tests don't leak state into one another. */
  reset(): void;
}

export interface RateLimiterOptions {
  /** Hits allowed per window per key. */
  max: number;
  /** Window length in ms. */
  windowMs: number;
  /** Hard ceiling on distinct tracked keys (memory bound). */
  maxTrackedKeys?: number;
}

// Light in-memory rate limit (per server instance). Not a hard cross-instance
// guarantee, but combined with the same-origin check it blunts floods without
// adding a dependency.
export function createRateLimiter({
  max,
  windowMs,
  maxTrackedKeys = 10_000,
}: RateLimiterOptions): RateLimiter {
  const rateHits = new Map<string, { count: number; resetAt: number }>();

  return {
    isRateLimited(key: string): boolean {
      const now = Date.now();
      const entry = rateHits.get(key);
      if (!entry || now > entry.resetAt) {
        rateHits.set(key, { count: 1, resetAt: now + windowMs });
        if (rateHits.size > maxTrackedKeys) {
          // Perf: entries share one fixed window, so the oldest-inserted entry
          // is the earliest to expire. If it's still fresh, no entry is
          // expired — skip the O(n) expired-sweep and go straight to eviction.
          // This is the common case under a sustained unique-key flood. (A key
          // refreshed in-place can sit older-in-order with a later expiry;
          // then we simply evict it as "oldest", which still bounds memory.)
          const oldest = rateHits.values().next().value;
          if (oldest && now > oldest.resetAt) {
            for (const [k, v] of rateHits) if (now > v.resetAt) rateHits.delete(k);
          }
          // If still over the ceiling (a live flood of unique keys), evict the
          // oldest-inserted entries until back under the cap. Map preserves
          // insertion order and deleting during iteration is safe.
          if (rateHits.size > maxTrackedKeys) {
            let toEvict = rateHits.size - maxTrackedKeys;
            for (const k of rateHits.keys()) {
              rateHits.delete(k);
              if (--toEvict <= 0) break;
            }
          }
        }
        return false;
      }
      entry.count += 1;
      return entry.count > max;
    },

    reset(): void {
      rateHits.clear();
    },
  };
}
