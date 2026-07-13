import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// Server-side admin gate for API routes. Returns a 403 NextResponse when the
// caller is not an authenticated admin, or null when the request may proceed.
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getSession();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
