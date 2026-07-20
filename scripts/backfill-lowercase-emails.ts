/**
 * backfill-lowercase-emails.ts — one-time normalization of legacy email rows.
 *
 * Context (issue #164, follow-up to #161/PR #162): the waitlist route now
 * trims + lowercases every NEW signup, but rows written before that keep their
 * original casing, and SQLite's UNIQUE(email) is case-sensitive. So a legacy
 * `Mixed@Case.com` re-signing up as `mixed@case.com` becomes a second row —
 * two rows, one human, and a double-send the day the digest runs again.
 *
 * This script lowercases + trims the stored addresses and merges the
 * case-insensitive duplicates that already exist.
 *
 * SAFETY
 *   - DRY RUN IS THE DEFAULT. It reads, plans, prints counts, and exits. You
 *     must pass --apply for a single byte to be written.
 *   - It NEVER prints, logs or writes an email address. The repo and its logs
 *     are public; only counts leave this process. Even database errors are
 *     scrubbed before printing, in case a driver echoes a value back.
 *   - It is idempotent: a second --apply run over the same data plans zero
 *     changes.
 *
 * USAGE
 *   # dry run against production (safe, read-only, counts only)
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/backfill-lowercase-emails.ts
 *
 *   # after reviewing the counts AND taking a backup, write:
 *   TURSO_DATABASE_URL=... TURSO_AUTH_TOKEN=... npx tsx scripts/backfill-lowercase-emails.ts --apply
 *
 *   # also merge duplicates in the token-bearing tables (see the warning below)
 *   ... npx tsx scripts/backfill-lowercase-emails.ts --apply --merge-token-tables
 *
 *   # point at ./local.db instead of Turso (for rehearsing the run)
 *   ... npx tsx scripts/backfill-lowercase-emails.ts --local
 */

import { createClient, type Client } from "@libsql/client";

// --- Planning (pure — no DB, no I/O — so it is unit-tested) ----------------

export interface EmailRow {
  id: number;
  email: string;
  /** Sortable creation timestamp. Null = unknown age, treated as newest. */
  createdAt: string | null;
  /** Remaining columns this table wants merged when rows collapse. */
  flags: Record<string, unknown>;
}

/** How a column is combined when duplicate rows merge into the keeper. */
export type MergeRule =
  /** 1 if ANY row has it — used for opt-out flags: unsubscribing must stick. */
  | "orTrue"
  /** The earliest non-null value — used for "already sent" timestamps, so a
   *  merge can never cause an email to be sent to someone a second time. */
  | "earliestNonNull";

export interface GroupAction {
  keeperId: number;
  /** The lowercased/trimmed address. Internal only — never printed. */
  normalizedEmail: string;
  /** True when the keeper's stored address actually differs. */
  emailChanges: boolean;
  /** Rows collapsed into the keeper. */
  deleteIds: number[];
  /** Merged column values to write onto the keeper. */
  mergedFlags: Record<string, unknown>;
  /** Set when a collision exists but merging is not permitted for this table. */
  skipped?: "needs-merge";
}

export interface TablePlan {
  scanned: number;
  /** Rows whose stored address will be rewritten. */
  toNormalize: number;
  /** Groups holding more than one row for the same normalized address. */
  duplicateGroups: number;
  /** Rows deleted by merging those groups. */
  toDelete: number;
  /** Colliding groups left untouched because merging wasn't permitted. */
  skippedGroups: number;
  actions: GroupAction[];
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Keeper = the EARLIEST row: oldest created_at wins, a null timestamp counts
 * as unknown-and-therefore-newest, and the lowest id breaks ties (it was
 * inserted first). The keeper's created_at is what survives, so the signup
 * date the subscriber actually has is preserved.
 */
function pickKeeper(rows: EmailRow[]): EmailRow {
  return [...rows].sort((a, b) => {
    if (a.createdAt !== b.createdAt) {
      if (a.createdAt === null) return 1;
      if (b.createdAt === null) return -1;
      return a.createdAt < b.createdAt ? -1 : 1;
    }
    return a.id - b.id;
  })[0];
}

function mergeFlags(
  rows: EmailRow[],
  keeper: EmailRow,
  rules: Record<string, MergeRule>
): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  for (const [column, rule] of Object.entries(rules)) {
    if (rule === "orTrue") {
      const anyTruthy = rows.some((row) => {
        const value = row.flags[column];
        return value !== null && value !== undefined && Number(value) === 1;
      });
      if (anyTruthy) merged[column] = 1;
      else if (keeper.flags[column] !== undefined) merged[column] = 0;
      continue;
    }

    // earliestNonNull
    const values = rows
      .map((row) => row.flags[column])
      .filter((v): v is string => typeof v === "string" && v !== "")
      .sort();
    if (values.length > 0) merged[column] = values[0];
  }

  return merged;
}

/**
 * Build the change plan for one table.
 *
 * `allowMerge = false` (the token-bearing tables' default) means colliding
 * groups are reported and left completely alone — including their casing,
 * since normalizing them would just trip the UNIQUE constraint.
 */
export function planTable(
  rows: EmailRow[],
  options: { mergeRules?: Record<string, MergeRule>; allowMerge?: boolean } = {}
): TablePlan {
  const { mergeRules = {}, allowMerge = true } = options;

  const groups = new Map<string, EmailRow[]>();
  for (const row of rows) {
    const key = normalizeEmail(row.email);
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }

  const plan: TablePlan = {
    scanned: rows.length,
    toNormalize: 0,
    duplicateGroups: 0,
    toDelete: 0,
    skippedGroups: 0,
    actions: [],
  };

  for (const [normalizedEmail, group] of groups) {
    const isDuplicate = group.length > 1;
    if (isDuplicate) plan.duplicateGroups += 1;

    if (isDuplicate && !allowMerge) {
      plan.skippedGroups += 1;
      plan.actions.push({
        keeperId: pickKeeper(group).id,
        normalizedEmail,
        emailChanges: false,
        deleteIds: [],
        mergedFlags: {},
        skipped: "needs-merge",
      });
      continue;
    }

    const keeper = pickKeeper(group);
    const deleteIds = group.filter((r) => r.id !== keeper.id).map((r) => r.id);
    const emailChanges = keeper.email !== normalizedEmail;
    const mergedFlags = isDuplicate
      ? mergeFlags(group, keeper, mergeRules)
      : {};

    // Nothing to do: the address is already normalized and stands alone.
    if (!emailChanges && deleteIds.length === 0) continue;

    if (emailChanges) plan.toNormalize += 1;
    plan.toDelete += deleteIds.length;
    plan.actions.push({
      keeperId: keeper.id,
      normalizedEmail,
      emailChanges,
      deleteIds,
      mergedFlags,
    });
  }

  return plan;
}

/** Strip anything shaped like an email from text headed for stdout/stderr. */
export function scrub(text: string): string {
  return text.replace(/[^\s"'`<>()]+@[^\s"'`<>()]+/g, "[email redacted]");
}

// --- Table configuration ---------------------------------------------------

interface TableConfig {
  table: string;
  emailColumn: string;
  createdAtColumn: string;
  mergeRules: Record<string, MergeRule>;
  /**
   * Token-bearing tables are merge-gated. Deleting a duplicate there destroys
   * an unsubscribe_token that may already be sitting in somebody's inbox, so
   * their old unsubscribe link would 404. That's a deliberate decision for a
   * human to make, not a default. Casing-only fixes still apply to every
   * non-colliding row.
   */
  mergeNeedsFlag: boolean;
}

const TABLES: TableConfig[] = [
  {
    table: "waitlist",
    emailColumn: "email",
    createdAtColumn: "created_at",
    // Opt-out wins: if any twin unsubscribed, the survivor stays unsubscribed.
    mergeRules: { unsubscribed: "orTrue" },
    mergeNeedsFlag: false,
  },
  {
    table: "email_subscribers",
    emailColumn: "email",
    createdAtColumn: "subscribed_at",
    mergeRules: {
      unsubscribed: "orTrue",
      // Earliest send timestamp survives, so merging can never re-trigger a
      // nurture email the person already received.
      welcome_sent_at: "earliestNonNull",
      day3_sent_at: "earliestNonNull",
      day7_sent_at: "earliestNonNull",
    },
    mergeNeedsFlag: true,
  },
  {
    table: "email_preferences",
    emailColumn: "user_email",
    createdAtColumn: "created_at",
    mergeRules: { unsubscribed_at: "earliestNonNull" },
    mergeNeedsFlag: true,
  },
];

// --- Database I/O ----------------------------------------------------------

async function tableExists(client: Client, table: string): Promise<boolean> {
  const result = await client.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [table],
  });
  return result.rows.length > 0;
}

async function readRows(
  client: Client,
  config: TableConfig
): Promise<EmailRow[]> {
  const flagColumns = Object.keys(config.mergeRules);
  const columns = [
    "id",
    `${config.emailColumn} AS email`,
    `${config.createdAtColumn} AS created_at`,
    ...flagColumns,
  ].join(", ");

  const result = await client.execute(
    `SELECT ${columns} FROM ${config.table}`
  );

  return result.rows.map((row) => {
    const record = row as unknown as Record<string, unknown>;
    const flags: Record<string, unknown> = {};
    for (const column of flagColumns) flags[column] = record[column] ?? null;
    return {
      id: Number(record.id),
      email: String(record.email ?? ""),
      createdAt:
        record.created_at === null || record.created_at === undefined
          ? null
          : String(record.created_at),
      flags,
    };
  });
}

async function applyPlan(
  client: Client,
  config: TableConfig,
  plan: TablePlan
): Promise<void> {
  const tx = await client.transaction("write");
  try {
    for (const action of plan.actions) {
      if (action.skipped) continue;

      // Delete the duplicates FIRST: the keeper's UPDATE to the lowercase
      // address would otherwise collide with a twin that already holds it.
      if (action.deleteIds.length > 0) {
        const placeholders = action.deleteIds.map(() => "?").join(", ");
        await tx.execute({
          sql: `DELETE FROM ${config.table} WHERE id IN (${placeholders})`,
          args: action.deleteIds,
        });
      }

      const assignments: string[] = [];
      const args: unknown[] = [];
      if (action.emailChanges) {
        assignments.push(`${config.emailColumn} = ?`);
        args.push(action.normalizedEmail);
      }
      for (const [column, value] of Object.entries(action.mergedFlags)) {
        assignments.push(`${column} = ?`);
        args.push(value);
      }
      if (assignments.length > 0) {
        args.push(action.keeperId);
        await tx.execute({
          sql: `UPDATE ${config.table} SET ${assignments.join(", ")} WHERE id = ?`,
          args: args as never[],
        });
      }
    }
    await tx.commit();
  } catch (error) {
    await tx.rollback();
    throw error;
  }
}

// --- CLI -------------------------------------------------------------------

function report(config: TableConfig, plan: TablePlan, apply: boolean): void {
  const line = (label: string, value: number) =>
    console.log(`    ${label.padEnd(40)}${value}`);

  console.log(`\n  ${config.table}`);
  line("rows scanned", plan.scanned);
  line(apply ? "normalized" : "would normalize", plan.toNormalize);
  line("duplicate groups", plan.duplicateGroups);
  line(apply ? "duplicates deleted" : "would delete", plan.toDelete);
  if (plan.skippedGroups > 0) {
    line("skipped (needs --merge-token-tables)", plan.skippedGroups);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const mergeTokenTables = args.includes("--merge-token-tables");
  const local = args.includes("--local");

  const unknownArgs = args.filter(
    (a) => !["--apply", "--merge-token-tables", "--local", "--dry-run"].includes(a)
  );
  if (unknownArgs.length > 0) {
    console.error(`unknown argument(s): ${unknownArgs.join(", ")}`);
    console.error(
      "usage: backfill-lowercase-emails.ts [--apply] [--merge-token-tables] [--local]"
    );
    process.exit(2);
  }

  const url = local
    ? "file:local.db"
    : process.env.TURSO_DATABASE_URL;
  if (!url) {
    console.error(
      "TURSO_DATABASE_URL is not set. Set it (with TURSO_AUTH_TOKEN) to target\n" +
        "the real database, or pass --local to rehearse against ./local.db."
    );
    process.exit(1);
  }

  // Deliberately does not print the URL — infrastructure detail stays out of
  // any log this produces.
  console.log(
    `Target: ${local || url.startsWith("file:") ? "local file" : "remote database"}`
  );
  console.log(
    apply
      ? "Mode:   APPLY — changes will be written"
      : "Mode:   DRY RUN (default) — nothing will be written. Pass --apply to write."
  );
  console.log("No email addresses are printed by this script, by design.");

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  let totalNormalize = 0;
  let totalDelete = 0;
  let totalSkipped = 0;

  try {
    for (const config of TABLES) {
      if (!(await tableExists(client, config.table))) {
        console.log(`\n  ${config.table}\n    (table not present — skipped)`);
        continue;
      }

      const rows = await readRows(client, config);
      const plan = planTable(rows, {
        mergeRules: config.mergeRules,
        allowMerge: !config.mergeNeedsFlag || mergeTokenTables,
      });

      if (apply) await applyPlan(client, config, plan);

      report(config, plan, apply);
      totalNormalize += plan.toNormalize;
      totalDelete += plan.toDelete;
      totalSkipped += plan.skippedGroups;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`\nFailed: ${scrub(message)}`);
    process.exit(1);
  } finally {
    client.close();
  }

  console.log(
    `\nTotal: ${totalNormalize} row(s) ${apply ? "normalized" : "to normalize"}, ` +
      `${totalDelete} duplicate row(s) ${apply ? "deleted" : "to delete"}` +
      (totalSkipped > 0 ? `, ${totalSkipped} group(s) skipped` : "")
  );
  if (!apply && (totalNormalize > 0 || totalDelete > 0)) {
    console.log("Re-run with --apply to write these changes (back up first).");
  }
  if (totalSkipped > 0) {
    console.log(
      "Skipped groups are duplicates in a token-bearing table. Merging one\n" +
        "destroys an unsubscribe token that may already be in a subscriber's\n" +
        "inbox; pass --merge-token-tables only if you accept that."
    );
  }
}

// Only run when executed directly, so the planner can be imported by tests.
if (process.argv[1] && process.argv[1].includes("backfill-lowercase-emails")) {
  main();
}
