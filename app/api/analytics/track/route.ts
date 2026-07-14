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
const RATE_MAX = 60; // events per window per IP
const RATE_WINDOW_MS = 10_000;
const rateHits = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateHits.get(key);
  if (!entry || now > entry.resetAt) {
    rateHits.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS });
    // Opportunistic cleanup so the map can't grow unbounded.
    if (rateHits.size > 5000) {
      for (const [k, v] of rateHits) if (now > v.resetAt) rateHits.delete(k);
    }
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_MAX;
}

// Same-origin guard: real page-view beacons carry an Origin (POST) or a
// Referer whose host matches ours. Direct scripted POSTs (curl/bots aiming to
// poison metrics) carry neither, so they're rejected.
function isSameOrigin(request: NextRequest): boolean {
  const host = request.headers.get("host");
  if (!host) return false;
  for (const header of ["origin", "referer"] as const) {
    const value = request.headers.get(header);
    if (!value) continue;
    try {
      if (new URL(value).host === host) return true;
    } catch {
      // malformed header — ignore and try the next
    }
  }
  return false;
}

export async function POST(request: NextRequest) {
  try {
    if (!isSameOrigin(request)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
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
