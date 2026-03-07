import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Update the unsubscribed status
    await db.run(sql`
      UPDATE waitlist
      SET unsubscribed = 1
      WHERE email = ${email}
    `);

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
