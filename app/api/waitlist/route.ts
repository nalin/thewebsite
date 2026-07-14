import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { addEmailSubscriber, sendWelcomeEmail } from "@/lib/nurture-emails";
import { trackReferral } from "@/lib/referrals";

// Open-redirect guard: only accept a same-origin, relative path (a single
// leading "/", no protocol-relative "//", no scheme, no query). Anything else
// (including "//evil.com") falls back to the homepage. Lead-magnet pages pass
// their own path here so they can show their own success state.
function sanitizeReturnPath(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  // The (?!\/) lookahead rejects ANY protocol-relative value ("//evil",
  // "///evil", "//evil/path"), which new URL() would resolve to an off-origin
  // host — not just the dotted "//evil.com" case.
  return /^\/(?!\/)[A-Za-z0-9/_-]*$/.test(value) ? value : null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const returnPath = sanitizeReturnPath(formData.get("next"));
    const dest = (status: string) =>
      `${returnPath ?? "/"}?${status}`;

    if (!email || !email.includes("@")) {
      return NextResponse.redirect(new URL(dest("error=invalid_email"), request.url));
    }

    // Create waitlist table if it doesn't exist
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS waitlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        unsubscribed INTEGER DEFAULT 0
      )
    `);

    // Add unsubscribed column if it doesn't exist (for existing tables)
    try {
      await db.run(sql`
        ALTER TABLE waitlist ADD COLUMN unsubscribed INTEGER DEFAULT 0
      `);
    } catch (error) {
      // Column already exists, that's fine
    }

    // Insert email (ignore if already exists)
    try {
      await db.run(sql`
        INSERT INTO waitlist (email) VALUES (${email})
      `);
    } catch (error) {
      // Email already exists, that's fine
    }

    // Add to email_subscribers and send welcome email
    try {
      const { token, alreadyExists } = await addEmailSubscriber(email);
      if (!alreadyExists) {
        // Track referral if a ref_code cookie is present
        const refCode = request.cookies.get("ref_code")?.value;
        if (refCode) {
          trackReferral(refCode, email).catch((err) => {
            console.error("Failed to track referral:", err);
          });
        }
        // Fire and forget — don't block the redirect on email send
        sendWelcomeEmail(email, token).catch((err) => {
          console.error("Failed to send welcome email:", err);
        });
      }
    } catch (err) {
      console.error("Email subscriber error:", err);
    }

    // Redirect to the success state (the lead-magnet page's own, if it passed a
    // same-origin `next`; otherwise the homepage). Clear ref_code on the way out.
    const successResponse = NextResponse.redirect(
      new URL(dest("success=joined"), request.url)
    );
    successResponse.cookies.set("ref_code", "", { maxAge: 0, path: "/" });
    return successResponse;
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
