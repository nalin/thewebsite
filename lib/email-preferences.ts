import { createClient } from '@libsql/client';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://thewebsite.app';

function getDbClient() {
  return createClient({
    url: process.env.TURSO_DATABASE_URL || 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

export interface EmailPreferences {
  user_email: string;
  unsubscribe_token: string;
  course_updates: boolean;
  marketing: boolean;
  digest: boolean;
  unsubscribed_at: string | null;
}

export async function ensureEmailPreferencesTable(): Promise<void> {
  const client = getDbClient();
  await client.execute(`
    CREATE TABLE IF NOT EXISTS email_preferences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_email TEXT UNIQUE NOT NULL,
      unsubscribe_token TEXT UNIQUE NOT NULL,
      course_updates INTEGER NOT NULL DEFAULT 1,
      marketing INTEGER NOT NULL DEFAULT 1,
      digest INTEGER NOT NULL DEFAULT 1,
      unsubscribed_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function upsertEmailPreferences(
  email: string,
  token: string
): Promise<void> {
  const client = getDbClient();
  await ensureEmailPreferencesTable();
  await client.execute({
    sql: `INSERT INTO email_preferences (user_email, unsubscribe_token)
          VALUES (?, ?)
          ON CONFLICT(user_email) DO NOTHING`,
    args: [email.toLowerCase().trim(), token],
  });
}

export async function getPreferencesByToken(
  token: string
): Promise<EmailPreferences | null> {
  const client = getDbClient();
  await ensureEmailPreferencesTable();
  const result = await client.execute({
    sql: `SELECT user_email, unsubscribe_token, course_updates, marketing, digest, unsubscribed_at
          FROM email_preferences
          WHERE unsubscribe_token = ?`,
    args: [token],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0] as any;
  return {
    user_email: row.user_email as string,
    unsubscribe_token: row.unsubscribe_token as string,
    course_updates: row.course_updates === 1,
    marketing: row.marketing === 1,
    digest: row.digest === 1,
    unsubscribed_at: row.unsubscribed_at as string | null,
  };
}

export async function updatePreferencesByToken(
  token: string,
  updates: {
    course_updates?: boolean;
    marketing?: boolean;
    digest?: boolean;
  }
): Promise<boolean> {
  const client = getDbClient();
  await ensureEmailPreferencesTable();

  const fields: string[] = [];
  const args: (number | string)[] = [];

  if (updates.course_updates !== undefined) {
    fields.push('course_updates = ?');
    args.push(updates.course_updates ? 1 : 0);
  }
  if (updates.marketing !== undefined) {
    fields.push('marketing = ?');
    args.push(updates.marketing ? 1 : 0);
  }
  if (updates.digest !== undefined) {
    fields.push('digest = ?');
    args.push(updates.digest ? 1 : 0);
  }

  if (fields.length === 0) return false;

  args.push(token);
  const result = await client.execute({
    sql: `UPDATE email_preferences SET ${fields.join(', ')} WHERE unsubscribe_token = ?`,
    args,
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function unsubscribeAllByToken(token: string): Promise<boolean> {
  const client = getDbClient();
  await ensureEmailPreferencesTable();
  const result = await client.execute({
    sql: `UPDATE email_preferences
          SET course_updates = 0, marketing = 0, digest = 0, unsubscribed_at = CURRENT_TIMESTAMP
          WHERE unsubscribe_token = ? AND unsubscribed_at IS NULL`,
    args: [token],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function resubscribeByToken(token: string): Promise<boolean> {
  const client = getDbClient();
  await ensureEmailPreferencesTable();
  const result = await client.execute({
    sql: `UPDATE email_preferences
          SET course_updates = 1, marketing = 1, digest = 1, unsubscribed_at = NULL
          WHERE unsubscribe_token = ?`,
    args: [token],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function getPreferencesByEmail(
  email: string
): Promise<EmailPreferences | null> {
  const client = getDbClient();
  await ensureEmailPreferencesTable();
  const result = await client.execute({
    sql: `SELECT user_email, unsubscribe_token, course_updates, marketing, digest, unsubscribed_at
          FROM email_preferences
          WHERE user_email = ?`,
    args: [email.toLowerCase().trim()],
  });
  if (result.rows.length === 0) return null;
  const row = result.rows[0] as any;
  return {
    user_email: row.user_email as string,
    unsubscribe_token: row.unsubscribe_token as string,
    course_updates: row.course_updates === 1,
    marketing: row.marketing === 1,
    digest: row.digest === 1,
    unsubscribed_at: row.unsubscribed_at as string | null,
  };
}

export function getPreferencesUrl(token: string): string {
  return `${BASE_URL}/preferences/${token}`;
}
