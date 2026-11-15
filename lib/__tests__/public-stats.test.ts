import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// getPublicStats() is what the homepage awaits on every render (#250). These
// cases pin its worst case: a hung DB costs at most STATS_TIMEOUT_MS (3s), a
// fresh value skips the DB entirely, and a failure never renders as 0.

const run = vi.fn();
vi.mock('@/lib/db', () => ({ db: { run } }));

// waitlist, waitlistThisWeek, activeSubscribers, courseUnlocks, revenueCents —
// the order getPublicStats() issues its five queries in.
const GOOD = [1130, 12, 340, 95, 9900];
const EXPECTED = {
  waitlistSignups: 1130,
  waitlistThisWeek: 12,
  activeSubscribers: 340,
  courseUnlocks: 95,
  revenueCents: 9900,
};

function answerWith(counts: number[]) {
  let i = 0;
  run.mockImplementation(async () => ({ rows: [{ count: counts[i++ % counts.length] }] }));
}
const hang = () => run.mockImplementation(() => new Promise(() => {}));

// The cache is module state, so each case loads a fresh copy of the module.
async function load() {
  vi.resetModules();
  return (await import('../activity')).getPublicStats;
}

beforeEach(() => {
  vi.useFakeTimers();
  run.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('getPublicStats (#250)', () => {
  it('returns the five counts it read', async () => {
    const getPublicStats = await load();
    answerWith(GOOD);
    expect(await getPublicStats()).toEqual(EXPECTED);
    expect(run).toHaveBeenCalledTimes(5);
  });

  it('serves a fresh value from cache without touching the DB, and re-reads after 60s', async () => {
    const getPublicStats = await load();
    answerWith(GOOD);
    await getPublicStats();
    await vi.advanceTimersByTimeAsync(59_000);
    expect(await getPublicStats()).toEqual(EXPECTED);
    expect(run).toHaveBeenCalledTimes(5);

    await vi.advanceTimersByTimeAsync(1_000);
    await getPublicStats();
    expect(run).toHaveBeenCalledTimes(10);
  });

  it('concurrent callers share one refresh', async () => {
    const getPublicStats = await load();
    answerWith(GOOD);
    const [a, b, c] = await Promise.all([getPublicStats(), getPublicStats(), getPublicStats()]);
    expect([a, b, c]).toEqual([EXPECTED, EXPECTED, EXPECTED]);
    expect(run).toHaveBeenCalledTimes(5);
  });

  it('a hung DB with nothing cached settles at 3s with null, not zeros', async () => {
    const getPublicStats = await load();
    hang();
    let settled = false;
    const result = getPublicStats().then((v) => {
      settled = true;
      return v;
    });

    await vi.advanceTimersByTimeAsync(2_999);
    expect(settled).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(true);
    expect(await result).toBeNull();
  });

  it('a hung DB after a good read serves the last value read, within 3s', async () => {
    const getPublicStats = await load();
    answerWith(GOOD);
    await getPublicStats();
    await vi.advanceTimersByTimeAsync(60_000);

    hang();
    const result = getPublicStats();
    await vi.advanceTimersByTimeAsync(3_000);
    expect(await result).toEqual(EXPECTED);
  });

  it('a DB error after a good read serves the last value read, not 0', async () => {
    const getPublicStats = await load();
    answerWith(GOOD);
    await getPublicStats();
    await vi.advanceTimersByTimeAsync(60_000);

    run.mockRejectedValue(new Error('fetch failed'));
    expect(await getPublicStats()).toEqual(EXPECTED);
  });

  it('one failed query fails the whole read — no partial zeros', async () => {
    const getPublicStats = await load();
    let i = 0;
    run.mockImplementation(async () => {
      if (++i === 5) throw new Error('no such table: pack_purchases');
      return { rows: [{ count: GOOD[i - 1] }] };
    });
    expect(await getPublicStats()).toBeNull();
  });

  it('a row with no count is a failure, not 0', async () => {
    const getPublicStats = await load();
    run.mockResolvedValue({ rows: [] });
    expect(await getPublicStats()).toBeNull();
  });

  it('after a failure, waits 15s before querying again', async () => {
    const getPublicStats = await load();
    run.mockRejectedValue(new Error('fetch failed'));
    await getPublicStats();
    const callsAfterFailure = run.mock.calls.length;

    await vi.advanceTimersByTimeAsync(14_000);
    expect(await getPublicStats()).toBeNull();
    expect(run).toHaveBeenCalledTimes(callsAfterFailure);

    answerWith(GOOD);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(await getPublicStats()).toEqual(EXPECTED);
  });
});
