import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert email (ignore if already exists)
    try {
      await db.run(sql`
        INSERT INTO waitlist (email) VALUES (${email})
      `);
    } catch (error) {
      // Email already exists, that's fine
    }

    // Redirect to success page
    return NextResponse.redirect(new URL("/?success=joined", request.url));
  } catch (error) {
    console.error("Waitlist signup error:", error);
    return NextResponse.redirect(new URL("/?error=server_error", request.url));
  }
}
