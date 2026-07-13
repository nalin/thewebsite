import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  markPurchaseCompleted,
  markPurchaseRefunded,
} from "@/lib/presale";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Stripe webhook for the Agent Operations Pack presale. Signature
// verification is mandatory; the webhook is the source of truth for
// pack_purchases status transitions (pending → completed → refunded).
export async function POST(req: Request) {
  // Stripe requires the raw body for signature verification.
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !process.env.STRIPE_SECRET_KEY) {
    // Env lands after merge — unavailable, not broken. Never a 500.
    console.error("[WEBHOOK] Stripe env not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 503 }
    );
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("[WEBHOOK] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email =
        session.customer_email ?? session.customer_details?.email ?? null;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      await markPurchaseCompleted(session.id, paymentIntentId, email);
      console.log(`[WEBHOOK] pack purchase completed: ${session.id}`);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id ?? null;

      if (paymentIntentId) {
        const updated = await markPurchaseRefunded(paymentIntentId);
        console.log(
          `[WEBHOOK] refund for ${paymentIntentId}: ${updated ? "recorded" : "no matching purchase"}`
        );
      }
      break;
    }

    default:
      // Ignore unhandled event types.
      break;
  }

  return NextResponse.json({ received: true });
}
