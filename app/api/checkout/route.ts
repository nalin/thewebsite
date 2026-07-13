import { NextResponse } from "next/server";

// Checkout is intentionally disabled. The old implementation created live
// Stripe sessions at a hardcoded price against a purchases table that does
// not exist in production — nothing was ever legitimately sold. Do not
// re-enable without a real product, a real price, and a webhook-verified
// fulfillment path.
export async function POST() {
  return NextResponse.json(
    { error: "checkout disabled pending relaunch" },
    { status: 503 }
  );
}
