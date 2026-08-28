import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Email-gate funnel events. One row per event; aggregated in
// /api/analytics/data and /analytics.
//
//   wall_view   — /course/access rendered its form (module = ?next target)
//   wall_submit — valid email POSTed to /api/course/access
//   wall_reject — POST failed the anti-spam form guard (issue #203)
//   confirm     — confirmation link clicked, access cookie set
export type FunnelEvent = "wall_view" | "wall_submit" | "wall_reject" | "confirm";

async function ensureTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS funnel_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event TEXT NOT NULL,
      module TEXT,
      email TEXT,
      source TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// Fire-and-forget: tracking must never break the funnel itself.
export async function logFunnelEvent(
  event: FunnelEvent,
  data: { module?: string | null; email?: string | null; source?: string | null } = {}
): Promise<void> {
  try {
    await ensureTable();
    await db.run(sql`
      INSERT INTO funnel_events (event, module, email, source)
      VALUES (
        ${event},
        ${data.module?.slice(0, 200) ?? null},
        ${data.email?.toLowerCase().slice(0, 254) ?? null},
        ${data.source?.slice(0, 200) ?? null}
      )
    `);
  } catch (error) {
    console.error("[FUNNEL] log error:", error);
  }
}
