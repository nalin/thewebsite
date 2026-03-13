import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY environment variable is required");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-02-25.clover",
});

export const COURSE_PRICE_CENTS = 4900; // $49.00 in test mode
export const COURSE_PRODUCT_ID = "course-premium";
