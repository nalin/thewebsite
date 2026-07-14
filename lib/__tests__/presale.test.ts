import { describe, it, expect, vi, beforeEach } from 'vitest';

const runMock = vi.fn();

vi.mock('@/lib/db', () => ({
  db: {
    run: (...args: unknown[]) => runMock(...args),
  },
}));

import {
  markPurchaseCompleted,
  markPurchaseRefunded,
  isPresaleConfigured,
} from '../presale';

// Extract the flattened SQL text of the Nth db.run call (drizzle sql
// template object). queryChunks holds strings and params interleaved.
function sqlText(callIndex: number): string {
  const chunk = runMock.mock.calls[callIndex][0] as {
    queryChunks: unknown[];
  };
  return chunk.queryChunks
    .map((c) =>
      typeof c === 'object' && c !== null && 'value' in c
        ? String((c as { value: unknown[] }).value)
        : ''
    )
    .join(' ');
}

// ensureTable() runs two statements before any real query: CREATE TABLE (call
// index 0) and the idempotent ALTER TABLE ADD COLUMN amount_cents (index 1).
// So the operation's own statement starts at index 2.
describe('pack_purchases status transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes an existing pending row via UPDATE, storing amount_cents', async () => {
    runMock.mockResolvedValueOnce({}); // CREATE TABLE
    runMock.mockResolvedValueOnce({}); // ALTER TABLE ADD COLUMN
    runMock.mockResolvedValueOnce({ rowsAffected: 1 }); // UPDATE

    await markPurchaseCompleted('cs_1', 'pi_1', 'a@example.com', 9900);

    expect(runMock).toHaveBeenCalledTimes(3);
    expect(sqlText(2)).toContain('UPDATE pack_purchases');
    expect(sqlText(2)).toContain("status != 'refunded'");
    expect(sqlText(2)).toContain('amount_cents'); // revenue is recorded
  });

  it('upserts a completed row with amount_cents when no pending row exists', async () => {
    runMock.mockResolvedValueOnce({}); // CREATE TABLE
    runMock.mockResolvedValueOnce({}); // ALTER TABLE ADD COLUMN
    runMock.mockResolvedValueOnce({ rowsAffected: 0 }); // UPDATE missed
    runMock.mockResolvedValueOnce({}); // INSERT fallback

    await markPurchaseCompleted('cs_2', 'pi_2', null, 9900);

    expect(runMock).toHaveBeenCalledTimes(4);
    expect(sqlText(3)).toContain('INSERT INTO pack_purchases');
    expect(sqlText(3)).toContain("'completed'");
    expect(sqlText(3)).toContain('amount_cents');
  });

  it('records a refund by payment intent and reports whether a row matched', async () => {
    runMock.mockResolvedValueOnce({}); // CREATE TABLE
    runMock.mockResolvedValueOnce({}); // ALTER TABLE ADD COLUMN
    runMock.mockResolvedValueOnce({ rowsAffected: 1 }); // UPDATE

    await expect(markPurchaseRefunded('pi_1')).resolves.toBe(true);
    expect(sqlText(2)).toContain("SET status = 'refunded'");

    runMock.mockResolvedValueOnce({}); // CREATE TABLE
    runMock.mockResolvedValueOnce({}); // ALTER TABLE ADD COLUMN
    runMock.mockResolvedValueOnce({ rowsAffected: 0 });
    await expect(markPurchaseRefunded('pi_unknown')).resolves.toBe(false);
  });

  it('isPresaleConfigured requires both env vars', () => {
    vi.stubEnv('STRIPE_SECRET_KEY', '');
    vi.stubEnv('STRIPE_PRICE_ID', '');
    expect(isPresaleConfigured()).toBe(false);

    vi.stubEnv('STRIPE_SECRET_KEY', 'placeholder');
    expect(isPresaleConfigured()).toBe(false);

    vi.stubEnv('STRIPE_PRICE_ID', 'price_placeholder');
    expect(isPresaleConfigured()).toBe(true);
  });
});
