import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { addEmailSubscriber } from "@/lib/nurture-emails";
import { createAccessToken, sendConfirmationEmail } from "@/lib/course-access";
import { logFunnelEvent } from "@/lib/funnel";

// Only allow same-site course destinations to avoid open-redirect issues.
function sanitizeNext(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith("/course")) return null;
  if (next.includes("//") || next.includes("\\")) return null;
  return next;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = (formData.get("email") as string | null)?.trim() || "";
  const next = sanitizeNext(formData.get("next") as string | null);

  const accessUrl = (params: Record<string, string>) => {
    const url = new URL("/course/access", request.url);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    if (next) url.searchParams.set("next", next);
    return url;
  };

  if (!email || !email.includes("@") || email.length > 254) {
    return NextResponse.redirect(accessUrl({ error: "invalid_email" }));
  }

  // source distinguishes wall submits from the /course inline forms.
  const referer = request.headers.get("referer");
  let source: string | null = null;
  try {
    source = referer ? new URL(referer).pathname : null;
  } catch {
    // Malformed referer — leave source null.
  }
  await logFunnelEvent("wall_submit", { email, module: next, source });

  try {
    // Keep the existing list growing: waitlist row + subscriber/preferences.
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        unsubscribed INTEGER DEFAULT 0
      )
    `);
    try {
      await db.run(sql`INSERT INTO waitlist (email) VALUES (${email})`);
    } catch {
      // Already on the list — fine.
    }
    try {
      await addEmailSubscriber(email);
    } catch (err) {
      console.error("[COURSE ACCESS] subscriber error:", err);
    }

    const token = await createAccessToken(email, next);
    const sent = await sendConfirmationEmail(email, token);
    if (!sent.success) {
      return NextResponse.redirect(accessUrl({ error: "send_failed" }));
    }
    return NextResponse.redirect(accessUrl({ sent: "1" }));
  } catch (error) {
    console.error("[COURSE ACCESS] request error:", error);
    return NextResponse.redirect(accessUrl({ error: "server_error" }));
  }
}
