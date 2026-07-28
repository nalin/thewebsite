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
  // When the blocker itself began, for decision_pending rows. Distinct from
  // created_at, which is only when the CEO got around to logging it — a
  // blocker is routinely discovered days after it starts. Null when unknown,
  // in which case callers fall back to created_at.
  blocker_started_at: string | null;
}

// The blocker's true start, falling back to the log time when unrecorded.
export function blockerOpenSince(event: ActivityEvent): string {
  return event.blocker_started_at ?? event.created_at;
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      blocker_started_at DATETIME
    )
  `);
  // Tables created before blocker_started_at existed need the column added.
  // SQLite has no ADD COLUMN IF NOT EXISTS; a duplicate-column error here is
  // the expected steady state, so it is swallowed rather than logged.
  try {
    await db.run(
      sql`ALTER TABLE activity_events ADD COLUMN blocker_started_at DATETIME`
    );
  } catch {
    // column already present
  }
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
    blocker_started_at: row.blocker_started_at
      ? String(row.blocker_started_at)
      : null,
  };
}

// All reads fail soft: the public page must render even if the table is
// missing or the database is unreachable.
export async function getRecentActivity(limit = 50): Promise<ActivityEvent[]> {
  try {
    await ensureTable();
    const result = await db.run(sql`
      SELECT id, kind, role, title, detail, commit_sha, created_at, blocker_started_at
      FROM activity_events
      ORDER BY datetime(created_at) DESC, id DESC
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
    // Latest = greatest (created_at, id) per role, NOT greatest id: a backfilled
    // row carries an earlier created_at than its id implies, so MAX(id) would
    // surface a backdated event as a seat's current state (issue #181). The
    // window function partitions the table once and ranks within each role —
    // exactly one row per role, no correlated per-role rescan.
    // datetime() normalizes the sort key so an ISO 'YYYY-MM-DDTHH:MM:SSZ' string
    // from an ad-hoc CEO write can't out-sort a same-day space-format row on
    // the 'T' > ' ' quirk (issue #183, item 1).
    const result = await db.run(sql`
      SELECT id, kind, role, title, detail, commit_sha, created_at, blocker_started_at
      FROM (
        SELECT id, kind, role, title, detail, commit_sha, created_at, blocker_started_at,
          ROW_NUMBER() OVER (
            PARTITION BY role ORDER BY datetime(created_at) DESC, id DESC
          ) AS rn
        FROM activity_events
      )
      WHERE rn = 1
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
    // The d.id > p.id supersession test is DELIBERATELY on id, not created_at
    // (issue #181, item 3): this is not a "when did it happen" ordering but a
    // "was this question answered after it was raised" test. id is AUTOINCREMENT
    // and never backdated, so it faithfully records the sequence in which the CEO
    // logged the raise and the resolution; created_at is exactly the field a
    // backfill shifts, so keying supersession off it would introduce the very
    // hazard #181 fixes elsewhere. Leave it alone.
    //
    // The trailing ORDER BY, by contrast, is a DISPLAY ordering — "what has the
    // owner been sitting on longest" — so it sorts by the exact value each row
    // renders as "open since": COALESCE(blocker_started_at, created_at), matching
    // blockerOpenSince() including its fallback. Oldest-blocker-first (ASC) puts
    // the longest-waiting item on top (issue #183, item 2). datetime() normalizes
    // the key against ISO-vs-space format drift, same as the other readers.
    const result = await db.run(sql`
      SELECT id, kind, role, title, detail, commit_sha, created_at, blocker_started_at
      FROM activity_events p
      WHERE kind = 'decision_pending'
        AND NOT EXISTS (
          SELECT 1 FROM activity_events d
          WHERE d.kind = 'decision_made'
            AND d.title = p.title
            AND d.id > p.id
        )
      ORDER BY datetime(COALESCE(blocker_started_at, created_at)) ASC, id ASC
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
      sql`SELECT COALESCE(SUM(amount_cents), 0) as count FROM pack_purchases WHERE status = 'completed'`
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
