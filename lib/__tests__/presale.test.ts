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

describe('pack_purchases status transitions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('completes an existing pending row via UPDATE only', async () => {
    // ensureTable, then UPDATE affecting 1 row → no INSERT fallback
    runMock.mockResolvedValueOnce({}); // CREATE TABLE
    runMock.mockResolvedValueOnce({ rowsAffected: 1 }); // UPDATE

    await markPurchaseCompleted('cs_1', 'pi_1', 'a@example.com');

    expect(runMock).toHaveBeenCalledTimes(2);
    expect(sqlText(1)).toContain('UPDATE pack_purchases');
    expect(sqlText(1)).toContain("status != 'refunded'");
  });

  it('upserts a completed row when no pending row exists (webhook is source of truth)', async () => {
    runMock.mockResolvedValueOnce({}); // CREATE TABLE
    runMock.mockResolvedValueOnce({ rowsAffected: 0 }); // UPDATE missed
    runMock.mockResolvedValueOnce({}); // INSERT fallback

    await markPurchaseCompleted('cs_2', 'pi_2', null);

    expect(runMock).toHaveBeenCalledTimes(3);
    expect(sqlText(2)).toContain('INSERT INTO pack_purchases');
    expect(sqlText(2)).toContain("'completed'");
  });

  it('records a refund by payment intent and reports whether a row matched', async () => {
    runMock.mockResolvedValueOnce({}); // CREATE TABLE
    runMock.mockResolvedValueOnce({ rowsAffected: 1 }); // UPDATE

    await expect(markPurchaseRefunded('pi_1')).resolves.toBe(true);
    expect(sqlText(1)).toContain("SET status = 'refunded'");

    runMock.mockResolvedValueOnce({}); // CREATE TABLE
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
