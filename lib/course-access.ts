import { Resend } from "resend";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { EMAIL_FROM } from "@/lib/email-sender";

const TOKEN_TTL_HOURS = 24;

let resendInstance: Resend | null = null;
function getResend(): Resend {
  if (!resendInstance) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

async function ensureTable() {
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS course_access_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      next_path TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      confirmed_at DATETIME
    )
  `);
}

export async function createAccessToken(
  email: string,
  nextPath: string | null
): Promise<string> {
  await ensureTable();
  const token = crypto.randomUUID().replace(/-/g, "");
  await db.run(sql`
    INSERT INTO course_access_tokens (email, token, next_path)
    VALUES (${email.toLowerCase()}, ${token}, ${nextPath})
  `);
  return token;
}

// Valid within TTL. Idempotent: email scanners and double-clicks may hit the
// link more than once, so a confirmed token stays usable until it expires.
export async function confirmAccessToken(
  token: string
): Promise<{ email: string; nextPath: string | null } | null> {
  await ensureTable();
  const result = await db.run(sql`
    SELECT email, next_path FROM course_access_tokens
    WHERE token = ${token}
      AND created_at >= datetime('now', ${"-" + TOKEN_TTL_HOURS + " hours"})
    LIMIT 1
  `);
  const row = (result as unknown as { rows?: Array<Record<string, unknown>> })
    .rows?.[0];
  if (!row) return null;
  await db.run(sql`
    UPDATE course_access_tokens
    SET confirmed_at = CURRENT_TIMESTAMP
    WHERE token = ${token} AND confirmed_at IS NULL
  `);
  return {
    email: String(row.email),
    nextPath: row.next_path ? String(row.next_path) : null,
  };
}

export async function sendConfirmationEmail(
  email: string,
  token: string
): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://thewebsite.app";
  const confirmUrl = `${baseUrl}/api/course/confirm?token=${token}`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Confirm your email</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="font-size: 24px; margin-bottom: 8px; color: #111;">One click and the course is yours</h1>
  <p style="font-size: 16px; color: #333;">
    Confirm your email to unlock all 10 modules of <strong>Build Your Own AI Agent</strong> —
    free, written by the AI CEO actually running this site.
  </p>
  <p style="margin: 30px 0;">
    <a href="${confirmUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: 600;">Confirm email &amp; start reading</a>
  </p>
  <p style="font-size: 14px; color: #666;">
    Or paste this link into your browser:<br>
    <a href="${confirmUrl}" style="color: #0066cc; word-break: break-all;">${confirmUrl}</a>
  </p>
  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
  <p style="font-size: 12px; color: #999;">
    This link expires in ${TOKEN_TTL_HOURS} hours. If you didn't request access to the course
    on thewebsite.app, you can safely ignore this email — nothing is subscribed until you confirm.
  </p>
</body>
</html>
`.trim();

  try {
    const resend = getResend();
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: "Confirm your email to unlock the course",
      html,
    });
    if (error) {
      console.error("[COURSE ACCESS] Resend error:", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error("[COURSE ACCESS] Email send error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
