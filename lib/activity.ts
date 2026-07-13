import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Public build-in-public operations log, rendered on /activity.
//
// Rows are written ONLY by the CEO via direct DB access — there is no
// public write endpoint and the site only reads. Only CEO-verified events
// belong here: "shipped" means merged, deployed, and verified; an agent
// saying "done" does not count. decision_pending items are phrased
// generically (no deliberation detail) and are considered resolved when a
// later decision_made event with the exact same title exists.
export type ActivityKind =
  | "dispatched"
  | "shipped"
  | "decision_pending"
  | "decision_made"
  | "note";

// Expected values for activity_events.role.
export const ACTIVITY_ROLES = [
  "ceo",
  "product-manager",
  "engineer",
  "course-content",
  "seo-growth",
] as const;

export type ActivityRole = (typeof ACTIVITY_ROLES)[number];

export interface ActivityEvent {
  id: number;
  kind: ActivityKind;
  role: string;
  title: string;
  detail: string | null;
  commit_sha: string | null;
  created_at: string;
}

async function ensureTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS activity_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      role TEXT NOT NULL,
      title TEXT NOT NULL,
      detail TEXT,
      commit_sha TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

type RawRows = { rows?: Array<Record<string, unknown>> };

function mapRow(row: Record<string, unknown>): ActivityEvent {
  return {
    id: Number(row.id),
    kind: String(row.kind) as ActivityKind,
    role: String(row.role),
    title: String(row.title),
    detail: row.detail ? String(row.detail) : null,
    commit_sha: row.commit_sha ? String(row.commit_sha) : null,
    created_at: String(row.created_at),
  };
}

// All reads fail soft: the public page must render even if the table is
// missing or the database is unreachable.
export async function getRecentActivity(limit = 50): Promise<ActivityEvent[]> {
  try {
    await ensureTable();
    const result = await db.run(sql`
      SELECT id, kind, role, title, detail, commit_sha, created_at
      FROM activity_events
      ORDER BY id DESC
      LIMIT ${limit}
    `);
    return ((result as unknown as RawRows).rows ?? []).map(mapRow);
  } catch (error) {
    console.error("[ACTIVITY] read error:", error);
    return [];
  }
}

// Latest event per role, for the team roster.
export async function getLatestByRole(): Promise<
  Record<string, ActivityEvent | null>
> {
  const latest: Record<string, ActivityEvent | null> = {};
  for (const role of ACTIVITY_ROLES) latest[role] = null;
  try {
    await ensureTable();
    const result = await db.run(sql`
      SELECT id, kind, role, title, detail, commit_sha, created_at
      FROM activity_events
      WHERE id IN (SELECT MAX(id) FROM activity_events GROUP BY role)
    `);
    for (const row of (result as unknown as RawRows).rows ?? []) {
      const event = mapRow(row);
      latest[event.role] = event;
    }
  } catch (error) {
    console.error("[ACTIVITY] roster read error:", error);
  }
  return latest;
}

// Open "Waiting on the human" items: decision_pending events with no later
// decision_made event carrying the exact same title.
export async function getPendingDecisions(): Promise<ActivityEvent[]> {
  try {
    await ensureTable();
    const result = await db.run(sql`
      SELECT id, kind, role, title, detail, commit_sha, created_at
      FROM activity_events p
      WHERE kind = 'decision_pending'
        AND NOT EXISTS (
          SELECT 1 FROM activity_events d
          WHERE d.kind = 'decision_made'
            AND d.title = p.title
            AND d.id > p.id
        )
      ORDER BY id DESC
    `);
    return ((result as unknown as RawRows).rows ?? []).map(mapRow);
  } catch (error) {
    console.error("[ACTIVITY] pending read error:", error);
    return [];
  }
}

export interface PublicStats {
  waitlistSignups: number;
  waitlistThisWeek: number;
  activeSubscribers: number;
  courseUnlocks: number;
  revenueCents: number;
}

// Public-safe aggregates for the numbers strip — the same queries the
// admin analytics endpoint (/api/analytics/data) runs, restricted to
// aggregate totals with no emails or other PII. Each fails soft to 0.
export async function getPublicStats(): Promise<PublicStats> {
  async function count(query: ReturnType<typeof sql>): Promise<number> {
    try {
      const result = await db.run(query);
      const row = (result as unknown as RawRows).rows?.[0];
      return Number(row?.count ?? 0);
    } catch {
      return 0;
    }
  }

  const [
    waitlistSignups,
    waitlistThisWeek,
    activeSubscribers,
    courseUnlocks,
    revenueCents,
  ] = await Promise.all([
    count(sql`SELECT COUNT(*) as count FROM waitlist WHERE unsubscribed = 0`),
    count(
      sql`SELECT COUNT(*) as count FROM waitlist WHERE unsubscribed = 0 AND created_at >= datetime('now', '-7 days')`
    ),
    count(
      sql`SELECT COUNT(*) as count FROM email_subscribers WHERE unsubscribed = 0`
    ),
    count(
      sql`SELECT COUNT(DISTINCT email) as count FROM funnel_events WHERE event = 'confirm'`
    ),
    count(
      sql`SELECT COALESCE(SUM(amount_cents), 0) as count FROM purchases WHERE status = 'completed'`
    ),
  ]);

  return {
    waitlistSignups,
    waitlistThisWeek,
    activeSubscribers,
    courseUnlocks,
    revenueCents,
  };
}
