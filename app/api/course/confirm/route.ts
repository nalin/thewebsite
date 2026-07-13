import { NextRequest, NextResponse } from "next/server";
import { confirmAccessToken } from "@/lib/course-access";
import { ACCESS_COOKIE, signAccessCookie } from "@/lib/access-cookie";

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
