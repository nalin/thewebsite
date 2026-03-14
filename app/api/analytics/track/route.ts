import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@libsql/client";

function getDbClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

async function ensurePageViewsTable(client: ReturnType<typeof createClient>) {
  await client.execute(`
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
  `);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, utm_source, utm_medium, utm_campaign, session_id } = body;

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
    // Silently fail — tracking should never break the user experience
    console.error("Analytics track error:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
