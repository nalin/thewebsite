import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { addEmailSubscriber, sendWelcomeEmail } from "@/lib/nurture-emails";
import { trackReferral } from "@/lib/referrals";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const email = formData.get("email") as string;

    if (!email || !email.includes("@")) {
      return NextResponse.redirect(new URL("/?error=invalid_email", request.url));
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

    // Redirect to success page; clear ref_code cookie on the way out
    const successResponse = NextResponse.redirect(
      new URL("/?success=joined", request.url)
    );
    successResponse.cookies.set("ref_code", "", { maxAge: 0, path: "/" });
    return successResponse;
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
