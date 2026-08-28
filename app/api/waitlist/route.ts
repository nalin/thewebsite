import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { addEmailSubscriber, sendWelcomeEmail } from "@/lib/nurture-emails";
import { trackReferral } from "@/lib/referrals";
import { verifySignupForm } from "@/lib/form-guard";

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

// A duplicate email is not an error — the visitor is already on the list, which
// is exactly the outcome they asked for. Signing up is idempotent, so ANY
// unique-constraint failure raised anywhere in the signup path means "already
// subscribed", not "server broke". Recognising it by shape (rather than relying
// on a try/catch wrapped around one specific INSERT) is what keeps a returning
// visitor off the generic failure page — see issue #161.
function isDuplicateError(error: unknown, depth = 0): boolean {
  if (!error || depth > 3) return false;
  const err = error as { message?: unknown; code?: unknown; cause?: unknown };
  const haystack = [
    typeof err.message === "string" ? err.message : "",
    typeof err.code === "string" ? err.code : "",
  ]
    .join(" ")
    .toLowerCase();

  // Deliberately narrow: only signals that specifically mean "this row is
  // already there". A vaguer match like "already exists" would also swallow a
  // DDL failure and show a success page to someone who never got stored.
  if (
    haystack.includes("unique constraint") ||
    haystack.includes("sqlite_constraint_unique") ||
    haystack.includes("sqlite_constraint_primarykey") ||
    haystack.includes("duplicate key")
  ) {
    return true;
  }

  // libsql/drizzle often wrap the driver error; check a few levels down.
  return err.cause ? isDuplicateError(err.cause, depth + 1) : false;
}

export async function POST(request: NextRequest) {
  // Kept outside the try so the catch below can still honour a lead-magnet
  // page's `next` (it falls back to the homepage until we've parsed the form).
  let dest = (status: string) => `/?${status}`;

  // Success is the same response whether the email is new or already on the
  // list — the pages that consume this redirect check for `success=joined`
  // exactly (app/page.tsx, /starter-kit, /free-guide), so an "already
  // subscribed" variant would silently render no confirmation at all.
  const joined = () => {
    const response = NextResponse.redirect(
      new URL(dest("success=joined"), request.url)
    );
    response.cookies.set("ref_code", "", { maxAge: 0, path: "/" });
    return response;
  };

  try {
    const formData = await request.formData();
    const rawEmail = formData.get("email");
    // Normalise here so the waitlist table dedupes the same way
    // email_subscribers already does (addEmailSubscriber lowercases + trims),
    // instead of storing Test@Example.COM and test@example.com as two rows.
    const email =
      typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    const returnPath = sanitizeReturnPath(formData.get("next"));
    dest = (status: string) => `${returnPath ?? "/"}?${status}`;

    if (!email || !email.includes("@")) {
      return NextResponse.redirect(new URL(dest("error=invalid_email"), request.url));
    }

    // Anti-spam gate (issue #203): require the server-rendered form token and
    // an untouched honeypot. Generic error param — no hint which check failed.
    if (!verifySignupForm(formData).ok) {
      return NextResponse.redirect(
        new URL(dest("error=invalid_submission"), request.url)
      );
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

    // Insert email. ON CONFLICT makes the re-signup a no-op in the database
    // rather than an exception; the catch stays as a belt-and-braces guard for
    // drivers/tables that still raise (and re-throws anything that is NOT a
    // duplicate, so a real write failure is still reported as one).
    try {
      await db.run(sql`
        INSERT INTO waitlist (email) VALUES (${email})
        ON CONFLICT(email) DO NOTHING
      `);
    } catch (error) {
      if (!isDuplicateError(error)) throw error;
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
    return joined();
  } catch (error) {
    // Already on the list: the visitor's intent is satisfied, so show them the
    // same success state a first-time signup gets instead of a generic failure.
    if (isDuplicateError(error)) {
      return joined();
    }
    console.error("Waitlist signup error:", error);
    return NextResponse.redirect(new URL(dest("error=server_error"), request.url));
  }
}
