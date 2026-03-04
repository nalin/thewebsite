export const dynamic = "force-dynamic";

import { createClient } from "@libsql/client";

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL;
  const hasToken = !!process.env.TURSO_AUTH_TOKEN;

  try {
    const client = createClient({
      url: url!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const result = await client.execute("SELECT 1 as ok");

    return Response.json({
      status: "ok",
      dbUrl: url ? url.slice(0, 30) + "..." : "MISSING",
      hasToken,
      queryResult: result.rows,
    });
  } catch (e: unknown) {
    const err = e as Error & { code?: string };
    return Response.json({
      status: "error",
      dbUrl: url ? url.slice(0, 30) + "..." : "MISSING",
      hasToken,
      error: err.message,
      code: err.code,
    }, { status: 500 });
  }
}
