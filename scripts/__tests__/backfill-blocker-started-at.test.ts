import { describe, it, expect } from "vitest";
import {
  planBackfill,
  BACKFILL,
  type BackfillEntry,
  type ExistingRow,
} from "../backfill-blocker-started-at";

// Issue #175: /activity rendered "open since {created_at}", but created_at is
// when the CEO logged the blocker, not when it began — the fleet outage was
// logged two days late, so the honesty page halved an ongoing outage. These
// cover the planning half; the SQL half is a thin executor over this plan.

function row(
  id: number,
  title: string,
  createdAt: string,
  blockerStartedAt: string | null = null
): ExistingRow {
  return {
    id,
    title,
    created_at: createdAt,
    blocker_started_at: blockerStartedAt,
  };
}

const entry: BackfillEntry = {
  id: 94,
  title: "Agent fleet offline since 2026-07-21 — owner restart needed",
  blockerStartedAt: "2026-07-21 05:15:04",
  source: "#174",
};

describe("planBackfill", () => {
  it("plans an update when the row matches and the column is empty", () => {
    const plan = planBackfill(
      [entry],
      [row(94, entry.title, "2026-07-23 06:27:16")]
    );
    expect(plan).toHaveLength(1);
    expect(plan[0].kind).toBe("update");
  });

  it("reports how far the page understated the blocker", () => {
    const plan = planBackfill(
      [entry],
      [row(94, entry.title, "2026-07-23 06:27:16")]
    );
    // logged 07-23 06:27, actually open since 07-21 05:15 — just over 2 days (2.1 after rounding).
    expect(plan[0]).toMatchObject({ kind: "update", daysUnderstated: 2.1 });
  });

  it("refuses to write when the stored title does not match the id", () => {
    const plan = planBackfill(
      [entry],
      [row(94, "Some entirely different blocker", "2026-07-23 06:27:16")]
    );
    expect(plan[0]).toMatchObject({ kind: "skip" });
    expect((plan[0] as { reason: string }).reason).toMatch(/title mismatch/);
  });

  it("skips ids that are not in the table", () => {
    const plan = planBackfill([entry], []);
    expect(plan[0]).toMatchObject({ kind: "skip", reason: "row id not found" });
  });

  it("is idempotent — never overwrites an existing value", () => {
    const plan = planBackfill(
      [entry],
      [row(94, entry.title, "2026-07-23 06:27:16", "2026-07-21 05:15:04")]
    );
    expect(plan[0]).toMatchObject({ kind: "skip", reason: "already set" });
  });

  it("handles ISO-suffixed timestamps as UTC too", () => {
    const plan = planBackfill(
      [entry],
      [row(94, entry.title, "2026-07-23T06:27:16Z")]
    );
    expect(plan[0]).toMatchObject({ kind: "update", daysUnderstated: 2.1 });
  });
});

describe("BACKFILL table", () => {
  it("has no duplicate ids", () => {
    const ids = BACKFILL.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("cites a GitHub issue for every timestamp", () => {
    for (const e of BACKFILL) expect(e.source).toMatch(/^#\d+$/);
  });

  it("uses the SQLite UTC timestamp format throughout", () => {
    for (const e of BACKFILL)
      expect(e.blockerStartedAt).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
  });
});
