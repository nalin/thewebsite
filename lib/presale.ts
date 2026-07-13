import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// Agent Operations Pack presale purchases (decisions on issue #87:
// free-forever locked, self-serve, $99 single price).
//
// Runtime-SQL table following the lib/funnel.ts pattern — lib/schema.ts is
// protected and stays untouched. Status flow:
//
//   pending   — checkout session created, payment not yet confirmed
//   completed — Stripe webhook (or server-side success check) confirmed payment
//   refunded  — charge.refunded received for the payment intent
//
// Price and keys come exclusively from env (STRIPE_SECRET_KEY,
// STRIPE_PRICE_ID) — never hardcoded. If they're unset the presale is
// simply not open: callers must fail soft, not 500.
export type PackPurchaseStatus = "pending" | "completed" | "refunded";

export interface PackPurchase {
  id: number;
  stripe_session_id: string;
  stripe_payment_intent_id: string | null;
  email: string | null;
  status: PackPurchaseStatus;
  created_at: string;
  completed_at: string | null;
}

export function isPresaleConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID
  );
}

async function ensureTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS pack_purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stripe_session_id TEXT UNIQUE NOT NULL,
      stripe_payment_intent_id TEXT,
      email TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME
    )
  `);
}

type RawRows = { rows?: Array<Record<string, unknown>> };

function mapRow(row: Record<string, unknown>): PackPurchase {
  return {
    id: Number(row.id),
    stripe_session_id: String(row.stripe_session_id),
    stripe_payment_intent_id: row.stripe_payment_intent_id
      ? String(row.stripe_payment_intent_id)
      : null,
    email: row.email ? String(row.email) : null,
    status: String(row.status) as PackPurchaseStatus,
    created_at: String(row.created_at),
    completed_at: row.completed_at ? String(row.completed_at) : null,
  };
}

export async function createPendingPurchase(
  sessionId: string,
  email: string | null
): Promise<void> {
  await ensureTable();
  await db.run(sql`
    INSERT INTO pack_purchases (stripe_session_id, email, status)
    VALUES (${sessionId}, ${email?.toLowerCase().slice(0, 254) ?? null}, 'pending')
    ON CONFLICT(stripe_session_id) DO NOTHING
  `);
}

// Upsert on purpose: the webhook is the source of truth for payment, so a
// completed payment must be recorded even if the pending insert never
// happened (e.g. it failed at checkout time). Never downgrades a refund.
export async function markPurchaseCompleted(
  sessionId: string,
  paymentIntentId: string | null,
  email: string | null
): Promise<void> {
  await ensureTable();
  const normalizedEmail = email?.toLowerCase().slice(0, 254) ?? null;
  const result = await db.run(sql`
    UPDATE pack_purchases
    SET status = 'completed',
        stripe_payment_intent_id = COALESCE(${paymentIntentId}, stripe_payment_intent_id),
        email = COALESCE(${normalizedEmail}, email),
        completed_at = COALESCE(completed_at, CURRENT_TIMESTAMP)
    WHERE stripe_session_id = ${sessionId} AND status != 'refunded'
  `);
  const updated =
    (result as unknown as { rowsAffected?: number }).rowsAffected ?? 0;
  if (updated === 0) {
    await db.run(sql`
      INSERT INTO pack_purchases
        (stripe_session_id, stripe_payment_intent_id, email, status, completed_at)
      VALUES
        (${sessionId}, ${paymentIntentId}, ${normalizedEmail}, 'completed', CURRENT_TIMESTAMP)
      ON CONFLICT(stripe_session_id) DO NOTHING
    `);
  }
}

export async function markPurchaseRefunded(
  paymentIntentId: string
): Promise<boolean> {
  await ensureTable();
  const result = await db.run(sql`
    UPDATE pack_purchases
    SET status = 'refunded'
    WHERE stripe_payment_intent_id = ${paymentIntentId}
  `);
  return (
    ((result as unknown as { rowsAffected?: number }).rowsAffected ?? 0) > 0
  );
}

export async function getPurchaseBySession(
  sessionId: string
): Promise<PackPurchase | null> {
  await ensureTable();
  const result = await db.run(sql`
    SELECT id, stripe_session_id, stripe_payment_intent_id, email, status,
           created_at, completed_at
    FROM pack_purchases
    WHERE stripe_session_id = ${sessionId}
    LIMIT 1
  `);
  const row = (result as unknown as RawRows).rows?.[0];
  return row ? mapRow(row) : null;
}
