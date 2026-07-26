/**
 * backfill-blocker-started-at.ts — one-time backfill of activity_events.blocker_started_at.
 *
 * Context (issue #175): the public /activity "Waiting on the Human" panel
 * rendered "open since {created_at}", but created_at is when the CEO logged
 * the row, not when the blocker began — routinely days apart, because a
 * blocker gets discovered and written up after it starts. The live example:
 * the fleet outage began 2026-07-21 and was logged 2026-07-23, so the honesty
 * page understated an ongoing outage by roughly half.
 *
 * lib/activity.ts now carries a blocker_started_at column and falls back to
 * created_at when it is null. New rows should set it at insert time; this
 * script fills in the rows that predate the column.
 *
 * PROVENANCE
 *   Every value below is the creation timestamp of the GitHub issue that
 *   documents the blocker — the earliest verifiable record that it was open.
 *   That is deliberately conservative: a blocker may have truly begun before
 *   its issue was filed, but the issue is the date we can prove. No estimated
 *   or inferred dates are backfilled.
 *
 * SAFETY
 *   - DRY RUN IS THE DEFAULT. It reads, plans, prints, and exits. You must
 *     pass --apply for a single byte to be written.
 *   - Each update is guarded on BOTH the row id and the exact stored title,
 *     so a mismatched id can never scribble the wrong row's history.
 *   - It only writes rows where blocker_started_at IS NULL, so it is
 *     idempotent and never overwrites a value set at insert time.
 *   - It touches no email or other PII columns; this table holds none.
 *
 * USAGE
 *   # dry run against production (safe, read-only)
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/backfill-blocker-started-at.ts
 *
 *   # after reviewing the plan:
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/backfill-blocker-started-at.ts --apply
 */

import { createClient, type Client } from "@libsql/client";

// --- The backfill table (pure data — unit-tested via planBackfill) ---------

export interface BackfillEntry {
  id: number;
  /** Exact stored title; the update is guarded on this. */
  title: string;
  /** UTC "YYYY-MM-DD HH:MM:SS", matching SQLite CURRENT_TIMESTAMP format. */
  blockerStartedAt: string;
  /** The GitHub issue the timestamp comes from. */
  source: string;
}

export const BACKFILL: BackfillEntry[] = [
  {
    id: 94,
    title: "Agent fleet offline since 2026-07-21 — owner restart needed",
    blockerStartedAt: "2026-07-21 05:15:04",
    source: "#174",
  },
  {
    id: 93,
    title:
      "Homepage revenue figure contradicts published canon — owner go needed",
    blockerStartedAt: "2026-07-21 01:29:18",
    source: "#173",
  },
  {
    id: 56,
    title:
      "Host machine disk nearly full — agent runs hit ENOSPC (owner action)",
    blockerStartedAt: "2026-07-15 19:17:52",
    source: "#129",
  },
  {
    id: 45,
    title: "Agent Operations Pack — product definition (owner decision)",
    blockerStartedAt: "2026-07-13 17:41:53",
    source: "#102",
  },
  {
    id: 35,
    title: "Durable multi-instance rate limiting — Redis/Upstash provisioning",
    blockerStartedAt: "2026-07-14 03:16:19",
    source: "#108",
  },
];

export interface ExistingRow {
  id: number;
  title: string;
  created_at: string;
  blocker_started_at: string | null;
}

export type PlanItem =
  | { kind: "update"; entry: BackfillEntry; daysUnderstated: number }
  | { kind: "skip"; entry: BackfillEntry; reason: string };

const MS_PER_DAY = 86_400_000;

function parseSqliteUtc(value: string): number {
  const iso =
    value.includes("T") || value.endsWith("Z")
      ? value
      : `${value.replace(" ", "T")}Z`;
  return new Date(iso).getTime();
}

/**
 * Pure planner: decides what would change, given the rows actually in the DB.
 * Skips anything whose id is missing, whose title does not match exactly, or
 * that already has a blocker_started_at.
 */
export function planBackfill(
  entries: BackfillEntry[],
  existing: ExistingRow[]
): PlanItem[] {
  const byId = new Map(existing.map((row) => [row.id, row]));
  return entries.map((entry): PlanItem => {
    const row = byId.get(entry.id);
    if (!row) return { kind: "skip", entry, reason: "row id not found" };
    if (row.title !== entry.title)
      return { kind: "skip", entry, reason: "title mismatch — refusing" };
    if (row.blocker_started_at !== null)
      return { kind: "skip", entry, reason: "already set" };

    const understatedMs =
      parseSqliteUtc(row.created_at) - parseSqliteUtc(entry.blockerStartedAt);
    return {
      kind: "update",
      entry,
      daysUnderstated: Math.round((understatedMs / MS_PER_DAY) * 10) / 10,
    };
  });
}

// --- Runner ---------------------------------------------------------------

async function readExisting(client: Client): Promise<ExistingRow[]> {
  const result = await client.execute(
    `SELECT id, title, created_at, blocker_started_at FROM activity_events WHERE kind = 'decision_pending'`
  );
  return result.rows.map((row) => ({
    id: Number(row.id),
    title: String(row.title),
    created_at: String(row.created_at),
    blocker_started_at:
      row.blocker_started_at === null || row.blocker_started_at === undefined
        ? null
        : String(row.blocker_started_at),
  }));
}

async function main() {
  const apply = process.argv.includes("--apply");
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) {
    console.error("TURSO_DATABASE_URL is required");
    process.exit(1);
  }

  const client = createClient({ url, authToken });

  // The column may not exist yet if the app has not booted since the schema
  // change; ensureTable() in lib/activity.ts adds it, and so does this.
  try {
    await client.execute(
      `ALTER TABLE activity_events ADD COLUMN blocker_started_at DATETIME`
    );
    console.log("added blocker_started_at column");
  } catch {
    // already present
  }

  const plan = planBackfill(BACKFILL, await readExisting(client));

  console.log(`\n${apply ? "APPLY" : "DRY RUN"} — plan:\n`);
  for (const item of plan) {
    if (item.kind === "skip") {
      console.log(`  SKIP   ${item.entry.id}  ${item.reason}`);
      continue;
    }
    console.log(
      `  UPDATE ${item.entry.id}  -> ${item.entry.blockerStartedAt}  (${item.entry.source}, page understated by ${item.daysUnderstated}d)`
    );
  }

  const updates = plan.filter((item) => item.kind === "update");
  console.log(
    `\n${updates.length} update(s), ${plan.length - updates.length} skip(s)`
  );

  if (!apply) {
    console.log("\nDry run — nothing written. Re-run with --apply to write.\n");
    return;
  }

  for (const item of updates) {
    await client.execute({
      sql: `UPDATE activity_events SET blocker_started_at = ? WHERE id = ? AND title = ? AND blocker_started_at IS NULL`,
      args: [item.entry.blockerStartedAt, item.entry.id, item.entry.title],
    });
  }
  console.log(`\nWrote ${updates.length} row(s).\n`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error("backfill failed:", error);
    process.exit(1);
  });
}
