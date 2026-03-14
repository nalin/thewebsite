import { NextResponse } from "next/server";
import { stripe, COURSE_PRICE_CENTS, COURSE_PRODUCT_ID } from "@/lib/stripe";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  const session = await getSession();
  const baseUrl = process.env.NEXTAUTH_URL || "https://thewebsite.vercel.app";

  // Check if user already purchased
  if (session?.user?.id) {
    const existing = await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, session.user.id))
      .get();

    if (existing?.status === "completed") {
      return NextResponse.json(
        { error: "Already purchased" },
        { status: 400 }
      );
    }
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: COURSE_PRICE_CENTS,
          product_data: {
            name: "Build Your Own AI Agent — Premium Course",
            description:
              "Full access to all 5 modules, code templates, and hands-on projects",
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: session?.user?.id ?? "",
      productId: COURSE_PRODUCT_ID,
    },
    success_url: `${baseUrl}/course/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/course/cancel`,
  });

  // Create a pending purchase record
  await db.insert(purchases).values({
    userId: session?.user?.id ?? null,
    email: checkoutSession.customer_email ?? "",
    stripeSessionId: checkoutSession.id,
    productId: COURSE_PRODUCT_ID,
    amountCents: COURSE_PRICE_CENTS,
    currency: "usd",
    status: "pending",
  });

  return NextResponse.json({ url: checkoutSession.url });
}
