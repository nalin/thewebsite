import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

function getDbClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

// One-time table init, memoized for the life of the server instance: the DDL
// runs at most once per cold start, never on every request. If it fails, the
// guard resets so a later request can retry. (page_views is a runtime table —
// the protected lib/schema.ts is not touched.)
let pageViewsReady: Promise<void> | null = null;
function ensurePageViewsTable(
  client: ReturnType<typeof createClient>
): Promise<void> {
  if (!pageViewsReady) {
    pageViewsReady = client
      .execute(`
        CREATE TABLE IF NOT EXISTS page_views (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          path TEXT NOT NULL,
          referrer TEXT,
          utm_source TEXT,
          utm_medium TEXT,
          utm_campaign TEXT,
          session_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `)
      .then(() => undefined)
      .catch((err) => {
        pageViewsReady = null; // allow a later request to retry the init
        throw err;
      });
  }
  return pageViewsReady;
}

// Light in-memory rate limit (per server instance). Not a hard cross-instance
// guarantee, but combined with the same-origin check it blunts metric-poisoning
// floods without adding a dependency. Real users fire ~1 event per page view.
export const RATE_MAX = 60; // events per window per IP
export const RATE_WINDOW_MS = 10_000;
const rateHits = new Map<string, { count: number; resetAt: number }>();
// Hard ceiling on distinct tracked keys. The expired-sweep alone can't bound a
// flood of unique keys within one window (none are expired yet), so past this
// size we also evict the oldest-inserted entries — memory stays bounded.
const MAX_TRACKED_KEYS = 10_000;
export function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateHits.get(key);
  if (!entry || now > entry.resetAt) {
    rateHits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    if (rateHits.size > MAX_TRACKED_KEYS) {
      // 1) drop expired entries
      for (const [k, v] of rateHits) if (now > v.resetAt) rateHits.delete(k);
      // 2) if still over the ceiling (a live flood of unique keys), evict the
      //    oldest-inserted entries until back under the cap. Map preserves
      //    insertion order and deleting during iteration is safe.
      if (rateHits.size > MAX_TRACKED_KEYS) {
        let toEvict = rateHits.size - MAX_TRACKED_KEYS;
        for (const k of rateHits.keys()) {
          rateHits.delete(k);
          if (--toEvict <= 0) break;
        }
      }
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

// Same-origin guard: real page-view beacons carry an Origin (POST) or a
// Referer whose host matches ours. Direct scripted POSTs (curl/bots aiming to
// poison metrics) carry neither, so they're rejected. Pure (header values in)
// so it can be unit-tested — the browser-set Origin/Host headers can't be
// forged by a script, which is also why they can't be injected into a
// synthetic test request, so the wrapper is not directly testable.
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

function isSameOrigin(request: NextRequest): boolean {
  return sameOriginAllowed(
    request.headers.get("host") || request.nextUrl.host,
    request.headers.get("origin"),
    request.headers.get("referer")
  );
}

// The trustworthy client IP on Vercel is the platform-set x-real-ip, or the
// RIGHTMOST x-forwarded-for entry (the platform appends the real client IP;
// leftmost entries are client-controlled and spoofable). Using the rightmost
// value stops an attacker rotating fake leftmost IPs to evade the cap.
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

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const ip = clientIp(
      request.headers.get("x-forwarded-for"),
      request.headers.get("x-real-ip")
    );
    if (isRateLimited(ip)) {
      return NextResponse.json({ ok: false }, { status: 429 });
    }

    const body = await request.json();
    const { path, referrer, utm_source, utm_medium, utm_campaign, session_id } =
      body;

    if (!path || typeof path !== "string" || !path.startsWith("/")) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const client = getDbClient();
    await ensurePageViewsTable(client);

    await client.execute({
      sql: `INSERT INTO page_views (path, referrer, utm_source, utm_medium, utm_campaign, session_id)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        path.slice(0, 500),
        referrer ? String(referrer).slice(0, 500) : null,
        utm_source ? String(utm_source).slice(0, 200) : null,
        utm_medium ? String(utm_medium).slice(0, 200) : null,
        utm_campaign ? String(utm_campaign).slice(0, 200) : null,
        session_id ? String(session_id).slice(0, 100) : null,
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    // Silently fail — tracking should never break the user experience.
    console.error("Analytics track error:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
