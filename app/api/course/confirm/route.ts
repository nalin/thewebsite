import { NextRequest, NextResponse } from "next/server";
import { confirmAccessToken } from "@/lib/course-access";
import { ACCESS_COOKIE, signAccessCookie } from "@/lib/access-cookie";
import { logFunnelEvent } from "@/lib/funnel";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { addEmailSubscriber } from "@/lib/nurture-emails";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || !/^[a-f0-9]{32}$/.test(token)) {
    return NextResponse.redirect(
      new URL("/course/access?error=invalid_token", request.url)
    );
  }

  try {
    const result = await confirmAccessToken(token);
    if (!result) {
      return NextResponse.redirect(
        new URL("/course/access?error=invalid_token", request.url)
      );
    }

    const destination =
      result.nextPath && result.nextPath.startsWith("/course")
        ? result.nextPath
        : "/course/module-1";

    // List membership happens HERE, not at submit time (issue #203 layer 2):
    // an address only joins waitlist/email_subscribers once its owner has
    // clicked the double-opt-in link. Both writes are idempotent — confirm
    // links get clicked more than once (mail scanners, double-clicks) and
    // confirmAccessToken deliberately stays usable within its TTL.
    try {
      await db.run(sql`
        CREATE TABLE IF NOT EXISTS waitlist (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          unsubscribed INTEGER DEFAULT 0
        )
      `);
      await db.run(sql`
        INSERT INTO waitlist (email) VALUES (${result.email})
        ON CONFLICT(email) DO NOTHING
      `);
    } catch (err) {
      console.error("[COURSE ACCESS] confirm waitlist insert error:", err);
    }
    try {
      await addEmailSubscriber(result.email);
    } catch (err) {
      console.error("[COURSE ACCESS] confirm subscriber error:", err);
    }

    await logFunnelEvent("confirm", {
      email: result.email,
      module: destination,
    });

    const response = NextResponse.redirect(
      new URL(`${destination}?welcome=1`, request.url)
    );
    response.cookies.set(ACCESS_COOKIE, await signAccessCookie(result.email), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error) {
    console.error("[COURSE ACCESS] confirm error:", error);
    return NextResponse.redirect(
      new URL("/course/access?error=server_error", request.url)
    );
  }
}
