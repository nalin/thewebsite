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
} from '../activity';

// created_at is stored as 'YYYY-MM-DD HH:MM:SS' text, so lexical order == chrono.
type Seed = {
  id: number;
  kind: string;
  role: string;
  title: string;
  created_at: string;
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  for (const r of rows) {
    await rawClient.execute({
      sql: 'INSERT INTO activity_events (id, kind, role, title, created_at) VALUES (?,?,?,?,?)',
      args: [r.id, r.kind, r.role, r.title, r.created_at],
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
