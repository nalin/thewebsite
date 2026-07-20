import { describe, it, expect } from "vitest";
import {
  planTable,
  normalizeEmail,
  scrub,
  type EmailRow,
} from "../backfill-lowercase-emails";

// Issue #164: legacy waitlist rows kept their original casing while
// UNIQUE(email) is case-sensitive, so `Mixed@Case.com` and `mixed@case.com`
// could both exist — one human, two rows, a double-send waiting to happen.
// These cover the planning half of the migration; the SQL half is a thin
// executor over this plan.

function row(
  id: number,
  email: string,
  createdAt: string | null = "2026-01-01",
  flags: Record<string, unknown> = {}
): EmailRow {
  return { id, email, createdAt, flags };
}

describe("normalizeEmail", () => {
  it("trims and lowercases", () => {
    expect(normalizeEmail("  Mixed@Case.COM ")).toBe("mixed@case.com");
  });

  it("is a fixed point for an already-normalized address", () => {
    expect(normalizeEmail(normalizeEmail("A@B.com"))).toBe(
      normalizeEmail("A@B.com")
    );
  });
});

describe("planTable — normalization", () => {
  it("plans nothing when every address is already normalized", () => {
    const plan = planTable([row(1, "a@b.com"), row(2, "c@d.com")]);

    expect(plan).toMatchObject({
      scanned: 2,
      toNormalize: 0,
      toDelete: 0,
      duplicateGroups: 0,
    });
    expect(plan.actions).toEqual([]);
  });

  it("rewrites a mixed-case address that has no twin", () => {
    const plan = planTable([row(1, "Mixed@Case.com")]);

    expect(plan.toNormalize).toBe(1);
    expect(plan.toDelete).toBe(0);
    expect(plan.actions).toEqual([
      {
        keeperId: 1,
        normalizedEmail: "mixed@case.com",
        emailChanges: true,
        deleteIds: [],
        mergedFlags: {},
      },
    ]);
  });

  it("rewrites an address stored with surrounding whitespace", () => {
    const plan = planTable([row(1, "  spaced@example.com  ")]);

    expect(plan.toNormalize).toBe(1);
    expect(plan.actions[0].normalizedEmail).toBe("spaced@example.com");
  });
});

describe("planTable — dedupe keeps the earliest row", () => {
  it("keeps the oldest created_at and deletes the rest", () => {
    const plan = planTable([
      row(7, "Mixed@Case.com", "2026-03-01"),
      row(2, "mixed@case.com", "2026-01-15"),
      row(9, "MIXED@CASE.COM", "2026-05-20"),
    ]);

    expect(plan.duplicateGroups).toBe(1);
    expect(plan.actions[0].keeperId).toBe(2); // the January row
    expect(plan.actions[0].deleteIds.sort()).toEqual([7, 9]);
    expect(plan.toDelete).toBe(2);
    // Row 2 is already lowercase, so only the deletes are needed.
    expect(plan.actions[0].emailChanges).toBe(false);
    expect(plan.toNormalize).toBe(0);
  });

  it("breaks a created_at tie on the lowest id (inserted first)", () => {
    const plan = planTable([
      row(5, "Twin@example.com", "2026-01-01"),
      row(3, "twin@example.com", "2026-01-01"),
    ]);

    expect(plan.actions[0].keeperId).toBe(3);
    expect(plan.actions[0].deleteIds).toEqual([5]);
  });

  it("treats an unknown created_at as newest, never as oldest", () => {
    const plan = planTable([
      row(1, "Twin@example.com", null),
      row(2, "twin@example.com", "2026-02-02"),
    ]);

    expect(plan.actions[0].keeperId).toBe(2);
  });

  it("normalizes the keeper when it is the mixed-case row", () => {
    const plan = planTable([
      row(1, "Twin@Example.com", "2026-01-01"),
      row(2, "twin@example.com", "2026-02-02"),
    ]);

    expect(plan.actions[0]).toMatchObject({
      keeperId: 1,
      emailChanges: true,
      normalizedEmail: "twin@example.com",
      deleteIds: [2],
    });
    expect(plan.toNormalize).toBe(1);
    expect(plan.toDelete).toBe(1);
  });

  it("handles several independent duplicate groups", () => {
    const plan = planTable([
      row(1, "A@x.com", "2026-01-01"),
      row(2, "a@x.com", "2026-02-01"),
      row(3, "B@y.com", "2026-01-01"),
      row(4, "b@y.com", "2026-02-01"),
      row(5, "solo@z.com", "2026-01-01"),
    ]);

    expect(plan.scanned).toBe(5);
    expect(plan.duplicateGroups).toBe(2);
    expect(plan.toDelete).toBe(2);
    expect(plan.toNormalize).toBe(2);
  });
});

describe("planTable — flag merging", () => {
  const rules = {
    unsubscribed: "orTrue",
    welcome_sent_at: "earliestNonNull",
  } as const;

  // An unsubscribe must survive the merge. Resurrecting an opt-out would mean
  // mailing someone who explicitly asked us to stop.
  it("carries an unsubscribe from ANY twin onto the survivor", () => {
    const plan = planTable(
      [
        row(1, "twin@x.com", "2026-01-01", {
          unsubscribed: 0,
          welcome_sent_at: null,
        }),
        row(2, "Twin@x.com", "2026-02-01", {
          unsubscribed: 1,
          welcome_sent_at: null,
        }),
      ],
      { mergeRules: rules }
    );

    expect(plan.actions[0].keeperId).toBe(1);
    expect(plan.actions[0].mergedFlags.unsubscribed).toBe(1);
  });

  it("leaves a subscribed survivor subscribed when no twin opted out", () => {
    const plan = planTable(
      [
        row(1, "twin@x.com", "2026-01-01", { unsubscribed: 0 }),
        row(2, "Twin@x.com", "2026-02-01", { unsubscribed: 0 }),
      ],
      { mergeRules: { unsubscribed: "orTrue" } }
    );

    expect(plan.actions[0].mergedFlags.unsubscribed).toBe(0);
  });

  // Keeping the EARLIEST send timestamp means a merge can never make a
  // "already sent" column look unsent and re-trigger the email.
  it("keeps the earliest non-null send timestamp", () => {
    const plan = planTable(
      [
        row(1, "twin@x.com", "2026-01-01", {
          unsubscribed: 0,
          welcome_sent_at: null,
        }),
        row(2, "Twin@x.com", "2026-02-01", {
          unsubscribed: 0,
          welcome_sent_at: "2026-02-02",
        }),
        row(3, "TWIN@x.com", "2026-03-01", {
          unsubscribed: 0,
          welcome_sent_at: "2026-03-03",
        }),
      ],
      { mergeRules: rules }
    );

    expect(plan.actions[0].mergedFlags.welcome_sent_at).toBe("2026-02-02");
  });

  it("does not touch flags for a row that has no twin", () => {
    const plan = planTable([row(1, "Solo@x.com", "2026-01-01", { unsubscribed: 1 })], {
      mergeRules: { unsubscribed: "orTrue" },
    });

    expect(plan.actions[0].mergedFlags).toEqual({});
  });
});

describe("planTable — token-bearing tables are merge-gated", () => {
  const rows = [
    row(1, "twin@x.com", "2026-01-01"),
    row(2, "Twin@x.com", "2026-02-01"),
    row(3, "Solo@x.com", "2026-01-01"),
  ];

  it("reports the collision and changes nothing when merging is not allowed", () => {
    const plan = planTable(rows, { allowMerge: false });

    expect(plan.duplicateGroups).toBe(1);
    expect(plan.skippedGroups).toBe(1);
    expect(plan.toDelete).toBe(0);
    // The lone mixed-case row is still fixed — only the colliding group is
    // left alone (normalizing it would trip UNIQUE anyway).
    expect(plan.toNormalize).toBe(1);
  });

  it("merges the same rows once merging is allowed", () => {
    const plan = planTable(rows, { allowMerge: true });

    expect(plan.skippedGroups).toBe(0);
    expect(plan.toDelete).toBe(1);
  });
});

describe("idempotence", () => {
  // Apply the plan to the in-memory rows the way the SQL executor does, then
  // re-plan: a second real run must be a no-op.
  function applyToRows(rows: EmailRow[], plan: ReturnType<typeof planTable>) {
    const deleted = new Set(plan.actions.flatMap((a) => a.deleteIds));
    return rows
      .filter((r) => !deleted.has(r.id))
      .map((r) => {
        const action = plan.actions.find((a) => a.keeperId === r.id);
        return action?.emailChanges
          ? { ...r, email: action.normalizedEmail }
          : r;
      });
  }

  it("plans zero changes on a second pass", () => {
    const rows = [
      row(1, "Mixed@Case.com", "2026-01-01"),
      row(2, "mixed@case.com", "2026-02-01"),
      row(3, "  Spaced@x.com ", "2026-01-01"),
      row(4, "clean@x.com", "2026-01-01"),
    ];

    const first = planTable(rows);
    expect(first.toNormalize + first.toDelete).toBeGreaterThan(0);

    const after = applyToRows(rows, first);
    const second = planTable(after);

    expect(second).toMatchObject({
      toNormalize: 0,
      toDelete: 0,
      duplicateGroups: 0,
      skippedGroups: 0,
    });
    expect(second.actions).toEqual([]);
  });
});

describe("scrub", () => {
  // The repo and its logs are public. Nothing that reaches stdout may carry an
  // address, including a database error that echoes a value back.
  it("redacts an address inside an error message", () => {
    expect(scrub("UNIQUE constraint failed on someone@example.com")).toBe(
      "UNIQUE constraint failed on [email redacted]"
    );
  });

  it("redacts every address in the string", () => {
    expect(scrub("a@b.com and c@d.org")).toBe(
      "[email redacted] and [email redacted]"
    );
  });

  it("leaves address-free text alone", () => {
    expect(scrub("UNIQUE constraint failed: waitlist.email")).toBe(
      "UNIQUE constraint failed: waitlist.email"
    );
  });
});
