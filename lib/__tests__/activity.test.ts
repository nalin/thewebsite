import { describe, it, expect, beforeEach, vi } from 'vitest';

// Back the readers with a REAL in-memory SQLite instead of a stubbed db.run,
// because issue #181 is about ordering that happens inside SQLite (ORDER BY and
// the ROW_NUMBER window). Asserting on the SQL text would not prove a backdated
// row actually sorts by time — executing the query against seeded rows does.
const { testDb, rawClient } = await vi.hoisted(async () => {
  const { createClient } = await import('@libsql/client');
  const { drizzle } = await import('drizzle-orm/libsql');
  const rawClient = createClient({ url: ':memory:' });
  return { testDb: drizzle(rawClient), rawClient };
});

vi.mock('@/lib/db', () => ({ db: testDb }));

import {
  getRecentActivity,
  getLatestByRole,
  getPendingDecisions,
  blockerOpenSince,
} from '../activity';

// created_at is stored as 'YYYY-MM-DD HH:MM:SS' text, so lexical order == chrono.
// blocker_started_at is the true "open since" for decision_pending rows and is
// null when unrecorded (callers fall back to created_at).
type Seed = {
  id: number;
  kind: string;
  role: string;
  title: string;
  created_at: string;
  // number allows seeding a degenerate INTEGER 0 (issue #187): the DATETIME
  // column has NUMERIC affinity, so a stray 0 or '0' write lands as INTEGER 0.
  blocker_started_at?: string | number | null;
};

async function seed(rows: Seed[]) {
  await rawClient.execute('DROP TABLE IF EXISTS activity_events');
  await rawClient.execute(`
    CREATE TABLE activity_events (
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
  for (const r of rows) {
    await rawClient.execute({
      sql: 'INSERT INTO activity_events (id, kind, role, title, created_at, blocker_started_at) VALUES (?,?,?,?,?,?)',
      args: [r.id, r.kind, r.role, r.title, r.created_at, r.blocker_started_at ?? null],
    });
  }
}

beforeEach(async () => {
  await seed([]);
});

describe('getRecentActivity — orders by event time, not row id (issue #181)', () => {
  it('sorts backfilled rows by created_at even when their id is higher', async () => {
    // The exact live scenario: two rows backfilled on 07-28 with earlier
    // timestamps carry the highest ids but must NOT lead the feed.
    await seed([
      { id: 97, kind: 'note', role: 'engineer', title: 'note', created_at: '2026-07-28 10:00:00' },
      { id: 98, kind: 'shipped', role: 'ceo', title: 'ship #179', created_at: '2026-07-28 12:00:00' },
      { id: 99, kind: 'note', role: 'ceo', title: 'backfilled A', created_at: '2026-07-21 09:00:00' },
      { id: 100, kind: 'note', role: 'ceo', title: 'backfilled B', created_at: '2026-07-20 09:00:00' },
    ]);

    const feed = await getRecentActivity();

    // Descending by created_at: 98 (07-28 12:00), 97 (07-28 10:00), 99, 100.
    // id 98 is a LOWER id with a LATER created_at than 99/100; 99/100 are
    // HIGHER ids with EARLIER created_at — both cases must go by time.
    expect(feed.map((e) => e.id)).toEqual([98, 97, 99, 100]);
    expect(feed[0].id).toBe(98);
  });

  it('tie-breaks equal timestamps by id descending for stable order', async () => {
    await seed([
      { id: 10, kind: 'note', role: 'engineer', title: 'a', created_at: '2026-07-28 12:00:00' },
      { id: 11, kind: 'note', role: 'engineer', title: 'b', created_at: '2026-07-28 12:00:00' },
    ]);

    const feed = await getRecentActivity();

    expect(feed.map((e) => e.id)).toEqual([11, 10]);
  });
});

describe('getLatestByRole — latest = max(created_at, id) per role (issue #181)', () => {
  it('does not surface a backfilled (higher id, earlier date) row as current', async () => {
    // CEO roster card bug: id 100 is the highest id but 8 days stale; the
    // real current state is the 07-28 shipped row (lower id, later date).
    await seed([
      { id: 98, kind: 'shipped', role: 'ceo', title: 'ship #179', created_at: '2026-07-28 12:00:00' },
      { id: 100, kind: 'decision_pending', role: 'ceo', title: 'idle agent sessions', created_at: '2026-07-20 09:00:00' },
    ]);

    const latest = await getLatestByRole();

    expect(latest['ceo']?.id).toBe(98);
    expect(latest['ceo']?.kind).toBe('shipped');
  });

  it('picks the later-dated row even when it has the lower id', async () => {
    await seed([
      { id: 50, kind: 'shipped', role: 'engineer', title: 'recent', created_at: '2026-07-28 08:00:00' },
      { id: 60, kind: 'note', role: 'engineer', title: 'backdated', created_at: '2026-07-10 08:00:00' },
    ]);

    const latest = await getLatestByRole();

    expect(latest['engineer']?.id).toBe(50);
  });

  it('returns exactly one row per role and tie-breaks equal timestamps by id', async () => {
    await seed([
      { id: 70, kind: 'note', role: 'seo-growth', title: 'x', created_at: '2026-07-28 12:00:00' },
      { id: 71, kind: 'note', role: 'seo-growth', title: 'y', created_at: '2026-07-28 12:00:00' },
      { id: 72, kind: 'note', role: 'product-manager', title: 'z', created_at: '2026-07-27 12:00:00' },
    ]);

    const latest = await getLatestByRole();

    // One winner per role; the seo-growth tie goes to the higher id.
    expect(latest['seo-growth']?.id).toBe(71);
    expect(latest['product-manager']?.id).toBe(72);
    // Roles with no events stay null (course-content, ceo, engineer here).
    expect(latest['course-content']).toBeNull();
    expect(latest['engineer']).toBeNull();
  });
});

describe('getPendingDecisions — supersession stays keyed on id (issue #181, item 3)', () => {
  it('treats a higher-id decision_made as resolving even with a backdated created_at', async () => {
    // Deliberate: resolution is insertion order, not event time. A decision
    // recorded AFTER the question (higher id) supersedes it regardless of a
    // backdated created_at — id is the field backfills never shift.
    await seed([
      { id: 5, kind: 'decision_pending', role: 'ceo', title: 'monetize?', created_at: '2026-07-20 09:00:00' },
      { id: 6, kind: 'decision_made', role: 'ceo', title: 'monetize?', created_at: '2026-07-01 09:00:00' },
    ]);

    const pending = await getPendingDecisions();

    expect(pending.map((e) => e.title)).not.toContain('monetize?');
  });

  it('keeps a pending item open when no later decision_made matches its title', async () => {
    await seed([
      { id: 8, kind: 'decision_pending', role: 'ceo', title: 'pricing tier', created_at: '2026-07-28 09:00:00' },
    ]);

    const pending = await getPendingDecisions();

    expect(pending.map((e) => e.title)).toContain('pricing tier');
  });
});

describe('getPendingDecisions — panel sorts longest-waiting first (issue #183, item 2)', () => {
  it('orders open blockers by "open since" ascending, keyed on blockerOpenSince', async () => {
    // All decision_pending, all still open (no matching decision_made). The
    // panel renders "open since" via blockerOpenSince = blocker_started_at ??
    // created_at, so the sort must key on that same value — including the
    // fallback when blocker_started_at is null (id 12).
    await seed([
      { id: 10, kind: 'decision_pending', role: 'ceo', title: 'A', created_at: '2026-07-28 09:00:00', blocker_started_at: '2026-07-20 09:00:00' },
      { id: 11, kind: 'decision_pending', role: 'ceo', title: 'B', created_at: '2026-07-28 09:00:00', blocker_started_at: '2026-07-14 09:00:00' },
      { id: 12, kind: 'decision_pending', role: 'ceo', title: 'C', created_at: '2026-07-26 09:00:00', blocker_started_at: null },
      { id: 13, kind: 'decision_pending', role: 'ceo', title: 'D', created_at: '2026-07-28 09:00:00', blocker_started_at: '2026-07-16 09:00:00' },
    ]);

    const pending = await getPendingDecisions();

    // Longest-waiting first: 07-14 (11), 07-16 (13), 07-20 (10), then the
    // null-blocker row falling back to its created_at 07-26 (12).
    expect(pending.map((e) => e.id)).toEqual([11, 13, 10, 12]);

    // The rendered "open since" values must be non-decreasing top-to-bottom —
    // i.e. sort and display agree, including the null fallback.
    const openSince = pending.map((e) => blockerOpenSince(e));
    expect(openSince).toEqual([...openSince].sort());
    expect(blockerOpenSince(pending[3])).toBe('2026-07-26 09:00:00');
  });
});

describe('created_at/blocker format normalized on read (issue #183, item 1)', () => {
  it('getRecentActivity: an ISO row does not out-sort a later same-day space-format row', async () => {
    // 'T' (0x54) > ' ' (0x20), so raw string DESC would float the 11:00 ISO row
    // above the 12:00 space row. datetime() normalizes both, so time wins.
    await seed([
      { id: 20, kind: 'note', role: 'engineer', title: 'iso', created_at: '2026-07-28T11:00:00Z' },
      { id: 21, kind: 'note', role: 'engineer', title: 'space', created_at: '2026-07-28 12:00:00' },
    ]);

    const feed = await getRecentActivity();

    expect(feed.map((e) => e.id)).toEqual([21, 20]);
  });

  it('getPendingDecisions: an earlier ISO blocker sorts ahead of a later space-format one', async () => {
    // Longest-waiting first: the 07:00 ISO blocker has waited longer than the
    // 08:00 space blocker, but raw ASC would put the space row first ('space' <
    // 'T'). datetime() puts the genuinely-older ISO blocker on top.
    await seed([
      { id: 30, kind: 'decision_pending', role: 'ceo', title: 'iso-early', created_at: '2026-07-28 12:00:00', blocker_started_at: '2026-07-28T07:00:00Z' },
      { id: 31, kind: 'decision_pending', role: 'ceo', title: 'space-late', created_at: '2026-07-28 12:00:00', blocker_started_at: '2026-07-28 08:00:00' },
    ]);

    const pending = await getPendingDecisions();

    expect(pending.map((e) => e.id)).toEqual([30, 31]);
  });
});

describe("getPendingDecisions — empty-string blocker_started_at falls back like the TS helper (issue #185)", () => {
  it("sorts an empty-string blocker by created_at, not to the top, matching blockerOpenSince", async () => {
    // SQL COALESCE only replaces NULL, so '' would survive; datetime('') is
    // NULL and floats to the TOP of the ASC (longest-waiting-first) panel —
    // while mapRow's falsy check turns '' into null so the row RENDERS its
    // recent created_at. NULLIF(blocker_started_at, '') mirrors the TS
    // semantics so sort position and rendered date agree.
    await seed([
      { id: 40, kind: "decision_pending", role: "ceo", title: "genuinely old", created_at: "2026-07-28 09:00:00", blocker_started_at: "2026-07-14 09:00:00" },
      { id: 41, kind: "decision_pending", role: "ceo", title: "empty blocker", created_at: "2026-07-27 09:00:00", blocker_started_at: "" },
    ]);

    const pending = await getPendingDecisions();

    // The '' row must sort by its created_at (07-27), landing BELOW the real
    // 07-14 blocker — not pinned to the top as apparently-longest-waiting.
    expect(pending.map((e) => e.id)).toEqual([40, 41]);

    // Sort position and rendered "open since" agree: the '' row renders its
    // created_at, the same value it sorted on.
    const emptyRow = pending[1];
    expect(emptyRow.id).toBe(41);
    expect(blockerOpenSince(emptyRow)).toBe("2026-07-27 09:00:00");
  });
});

describe("getPendingDecisions — any degenerate blocker_started_at falls back like the TS helper (issue #187)", () => {
  it("sorts NULL, '', 0, and '0' blockers by created_at, none floating to the top, matching blockerOpenSince", async () => {
    // The whole degenerate family in one panel. blocker_started_at is DATETIME
    // (NUMERIC affinity), so 0 and '0' both land as INTEGER 0; datetime(0) is
    // Julian day zero (-4713-11-24), which under ASC longest-waiting-first would
    // pin the row to the TOP — while mapRow's guard renders the recent created_at.
    // A single plausible-timestamp predicate (GLOB in SQL, regex in mapRow) must
    // reject all of them, so each sorts on its created_at, agreeing with the
    // rendered "open since". id 50 is the only genuine blocker and must lead.
    await seed([
      { id: 50, kind: "decision_pending", role: "ceo", title: "genuinely old", created_at: "2026-07-28 09:00:00", blocker_started_at: "2026-07-10 09:00:00" },
      { id: 51, kind: "decision_pending", role: "ceo", title: "null blocker", created_at: "2026-07-25 09:00:00", blocker_started_at: null },
      { id: 52, kind: "decision_pending", role: "ceo", title: "empty blocker", created_at: "2026-07-26 09:00:00", blocker_started_at: "" },
      { id: 53, kind: "decision_pending", role: "ceo", title: "numeric zero blocker", created_at: "2026-07-27 09:00:00", blocker_started_at: 0 },
      { id: 54, kind: "decision_pending", role: "ceo", title: "string zero blocker", created_at: "2026-07-24 09:00:00", blocker_started_at: "0" },
    ]);

    const pending = await getPendingDecisions();

    // Only id 50 sorts on a real blocker (07-10); every degenerate row sorts on
    // its own created_at. Order by "open since" ASC: 50, 54, 51, 52, 53. The
    // numeric-0 row (53) lands LAST, not pinned to the top — the #187 bug.
    expect(pending.map((e) => e.id)).toEqual([50, 54, 51, 52, 53]);

    // Sort and render agree: every degenerate row renders (and sorted on) its
    // created_at; the genuine row renders its blocker_started_at.
    const openSince = pending.map((e) => blockerOpenSince(e));
    expect(openSince).toEqual([...openSince].sort());
    const byId = Object.fromEntries(pending.map((e) => [e.id, e]));
    expect(blockerOpenSince(byId[50])).toBe("2026-07-10 09:00:00");
    expect(blockerOpenSince(byId[54])).toBe("2026-07-24 09:00:00");
    expect(blockerOpenSince(byId[51])).toBe("2026-07-25 09:00:00");
    expect(blockerOpenSince(byId[52])).toBe("2026-07-26 09:00:00");
    expect(blockerOpenSince(byId[53])).toBe("2026-07-27 09:00:00");
  });
});
