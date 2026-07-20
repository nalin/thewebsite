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

// Same-origin + rate-limit guards live in lib/request-guards.ts (shared with
// /api/testimonials and /api/course/progress). Re-exported from here so this
// route's existing tests and call sites keep their import path.
export { sameOriginAllowed, clientIp } from "@/lib/request-guards";
import { sameOriginAllowed, clientIp, createRateLimiter } from "@/lib/request-guards";

export const RATE_MAX = 60; // events per window per IP
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
  return sameOriginAllowed(
    request.headers.get("host") || request.nextUrl.host,
    request.headers.get("origin"),
    request.headers.get("referer")
  );
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
