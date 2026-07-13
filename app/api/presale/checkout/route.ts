import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createPendingPurchase, isPresaleConfigured } from "@/lib/presale";

export const dynamic = "force-dynamic";

// Starts an Agent Operations Pack presale checkout (issue #87: $99 single
// price). Price comes from the STRIPE_PRICE_ID env var — no amounts or
// price IDs are hardcoded here.
export async function POST(request: Request) {
  // Fail soft: prod env vars land after the merge. 503, never a 500.
  if (!isPresaleConfigured()) {
    return NextResponse.json(
      { error: "Presale is not open yet. Check back shortly." },
      { status: 503 }
    );
  }

  // Optional email prefill from the pricing-page form.
  let email: string | null = null;
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (typeof body.email === "string") email = body.email;
    } else if (contentType.includes("form")) {
      const form = await request.formData();
      const value = form.get("email");
      if (typeof value === "string") email = value;
    }
  } catch {
    // Prefill is best-effort; Stripe collects the email at checkout anyway.
  }
  if (email && !email.includes("@")) email = null;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://thewebsite.app";

  try {
    // payment_method_types is intentionally omitted: with dynamic payment
    // methods Stripe picks what to offer, per current best practice.
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${baseUrl}/pack/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
      ...(email ? { customer_email: email } : {}),
    });

    await createPendingPurchase(session.id, email);

    if (!session.url) {
      return NextResponse.json(
        { error: "Could not start checkout. Please try again." },
        { status: 502 }
      );
    }

    // The buy button is a plain HTML form POST; 303 sends the browser to
    // Stripe's hosted checkout. fetch() callers can follow the redirect.
    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("[PRESALE] checkout error:", error);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 502 }
    );
  }
}
