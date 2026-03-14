import { createClient } from '@libsql/client';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://thewebsite.app';

function getDbClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export async function ensureReferralTables(): Promise<void> {
  const client = getDbClient();

  await client.execute(`
    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      referrer_email TEXT NOT NULL,
      referred_email TEXT NOT NULL,
      referral_code TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add referral columns to email_subscribers if they don't exist
  const alterStatements = [
    'ALTER TABLE email_subscribers ADD COLUMN referral_code TEXT',
    'ALTER TABLE email_subscribers ADD COLUMN referred_by TEXT',
    'ALTER TABLE email_subscribers ADD COLUMN reward_unlocked INTEGER DEFAULT 0',
  ];
  for (const sql of alterStatements) {
    try {
      await client.execute(sql);
    } catch {
      // Column already exists — fine
    }
  }
}

function generateCode(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join('');
}

export async function getOrCreateReferralCode(email: string): Promise<string> {
  const client = getDbClient();
  await ensureReferralTables();

  const normalized = email.toLowerCase().trim();

  const existing = await client.execute({
    sql: 'SELECT referral_code FROM email_subscribers WHERE email = ?',
    args: [normalized],
  });

  const existingCode = existing.rows[0]?.referral_code as string | null;
  if (existingCode) return existingCode;

  // Generate a unique code
  let code = generateCode();
  for (let i = 0; i < 5; i++) {
    const collision = await client.execute({
      sql: 'SELECT id FROM email_subscribers WHERE referral_code = ?',
      args: [code],
    });
    if (collision.rows.length === 0) break;
    code = generateCode();
  }

  await client.execute({
    sql: 'UPDATE email_subscribers SET referral_code = ? WHERE email = ?',
    args: [code, normalized],
  });

  return code;
}

export async function trackReferral(
  referralCode: string,
  referredEmail: string
): Promise<void> {
  const client = getDbClient();
  await ensureReferralTables();

  const normalized = referredEmail.toLowerCase().trim();

  const referrerResult = await client.execute({
    sql: 'SELECT email FROM email_subscribers WHERE referral_code = ?',
    args: [referralCode],
  });

  if (referrerResult.rows.length === 0) return;
  const referrerEmail = referrerResult.rows[0].email as string;

  if (referrerEmail === normalized) return; // no self-referrals

  // Only track once per referred email
  const alreadyTracked = await client.execute({
    sql: 'SELECT id FROM referrals WHERE referred_email = ?',
    args: [normalized],
  });
  if (alreadyTracked.rows.length > 0) return;

  await client.execute({
    sql: 'INSERT INTO referrals (referrer_email, referred_email, referral_code) VALUES (?, ?, ?)',
    args: [referrerEmail, normalized, referralCode],
  });

  await client.execute({
    sql: 'UPDATE email_subscribers SET referred_by = ? WHERE email = ?',
    args: [referrerEmail, normalized],
  });

  // Unlock reward at 3 referrals
  const countResult = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM referrals WHERE referrer_email = ?',
    args: [referrerEmail],
  });
  const count = Number((countResult.rows[0] as any).count);

  if (count >= 3) {
    await client.execute({
      sql: 'UPDATE email_subscribers SET reward_unlocked = 1 WHERE email = ? AND reward_unlocked = 0',
      args: [referrerEmail],
    });
  }
}

export interface ReferralStats {
  referral_code: string;
  referral_url: string;
  referral_count: number;
  reward_unlocked: boolean;
}

export async function getReferralStatsByToken(
  token: string
): Promise<ReferralStats | null> {
  const client = getDbClient();
  await ensureReferralTables();

  const subResult = await client.execute({
    sql: 'SELECT email, referral_code, reward_unlocked FROM email_subscribers WHERE unsubscribe_token = ?',
    args: [token],
  });

  if (subResult.rows.length === 0) return null;

  const row = subResult.rows[0] as any;
  const email = row.email as string;
  let code = row.referral_code as string | null;
  const rewardUnlocked = Number(row.reward_unlocked) === 1;

  if (!code) {
    code = await getOrCreateReferralCode(email);
  }

  const countResult = await client.execute({
    sql: 'SELECT COUNT(*) as count FROM referrals WHERE referrer_email = ?',
    args: [email],
  });
  const referralCount = Number((countResult.rows[0] as any).count);

  return {
    referral_code: code,
    referral_url: `${BASE_URL}/r/${code}`,
    referral_count: referralCount,
    reward_unlocked: rewardUnlocked,
  };
}

export function getReferralUrl(code: string): string {
  return `${BASE_URL}/r/${code}`;
}
