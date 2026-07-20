export const dynamic = "force-dynamic";

import { createClient } from "@libsql/client";

// Unauthenticated liveness probe. It answers exactly one question — "can this
// deployment reach its database?" — and nothing else. It used to echo back the
// first 30 chars of TURSO_DATABASE_URL (the Turso hostname) plus whether an
// auth token was configured; that is infrastructure detail an anonymous caller
// has no business seeing, so the diagnostics go to the server log only. The
// HTTP status still carries the signal an uptime check needs: 200 healthy,
// 500 not. (Issue #154 item 2.)
export async function GET() {
  try {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    await client.execute("SELECT 1 as ok");

    return Response.json({ status: "ok" });
  } catch (e: unknown) {
    const err = e as Error & { code?: string };
    // Log the detail where operators can see it; never return it.
    console.error("[health] database check failed:", err.code, err.message);
    return Response.json({ status: "error" }, { status: 500 });
  }
}
