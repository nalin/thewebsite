import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, verifyAccessCookie } from "@/lib/access-cookie";

// Course modules are free but require a confirmed email (double opt-in).
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/course/module-")) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(ACCESS_COOKIE)?.value;
  const email = await verifyAccessCookie(cookie);
  if (email) {
    return NextResponse.next();
  }

  const accessUrl = new URL("/course/access", request.url);
  accessUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(accessUrl);
}

export const config = {
  matcher: ["/course/:path*"],
};
