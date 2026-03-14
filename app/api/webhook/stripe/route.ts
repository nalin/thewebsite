import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

// Stripe requires the raw body for signature verification
export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const email = session.customer_email ?? session.customer_details?.email ?? "";
      const userId = session.metadata?.userId || null;
      const paymentIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;

      // Update the purchase record to completed
      await db
        .update(purchases)
        .set({
          status: "completed",
          email,
          userId: userId || undefined,
          stripePaymentIntentId: paymentIntentId,
          completedAt: new Date(),
        })
        .where(eq(purchases.stripeSessionId, session.id));

      console.log(`Purchase completed for session ${session.id}, user ${userId}`);
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const paymentIntentId =
        typeof charge.payment_intent === "string" ? charge.payment_intent : null;

      if (paymentIntentId) {
        await db
          .update(purchases)
          .set({ status: "refunded" })
          .where(eq(purchases.stripePaymentIntentId, paymentIntentId));
      }
      break;
    }

    default:
      // Ignore unhandled event types
      break;
  }

  return NextResponse.json({ received: true });
}
