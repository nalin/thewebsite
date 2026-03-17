import Stripe from "stripe";

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is required");
  }
  return new Stripe(key, { apiVersion: "2026-02-25.clover" });
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

export const COURSE_PRICE_CENTS = 19700; // $197.00
export const COURSE_PRODUCT_ID = "course-premium";
