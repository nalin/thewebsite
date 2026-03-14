import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { unsubscribeByToken } from "@/lib/nurture-emails";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, token } = body;

    // Token-based unsubscribe (nurture sequence)
    if (token) {
      const unsubscribed = await unsubscribeByToken(token as string);
      return NextResponse.json({
        success: true,
        message: unsubscribed ? "Successfully unsubscribed" : "Already unsubscribed",
      });
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Update the waitlist unsubscribed status
    await db.run(sql`
      UPDATE waitlist
      SET unsubscribed = 1
      WHERE email = ${email}
    `);

    // Also unsubscribe from nurture sequence if subscribed
    try {
      const { createClient } = await import("@libsql/client");
      const client = createClient({
        url: process.env.TURSO_DATABASE_URL || "file:local.db",
        authToken: process.env.TURSO_AUTH_TOKEN,
      });
      await client.execute({
        sql: "UPDATE email_subscribers SET unsubscribed = 1 WHERE email = ?",
        args: [email.toLowerCase().trim()],
      });
    } catch {
      // Table may not exist yet; non-fatal
    }

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed"
    });

  } catch (error) {
    console.error("Unsubscribe error:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe. Please try again." },
      { status: 500 }
    );
  }
}
