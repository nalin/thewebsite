import { NextRequest, NextResponse } from "next/server";
import { ACCESS_COOKIE, verifyAccessCookie } from "@/lib/access-cookie";

// Course modules are free; modules 3+ require a confirmed email (double
// opt-in). Modules 1-2 stay open for SEO and to demonstrate value before
// the email ask.
const OPEN_MODULES = new Set(["/course/module-1", "/course/module-2"]);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/course/module-") || OPEN_MODULES.has(pathname)) {
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
