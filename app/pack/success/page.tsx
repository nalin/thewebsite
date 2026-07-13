import { stripe } from "@/lib/stripe";
import {
  isPresaleConfigured,
  markPurchaseCompleted,
} from "@/lib/presale";
import type Stripe from "stripe";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Presale Confirmed — Agent Operations Pack",
  robots: { index: false },
};

interface VerifiedPurchase {
  email: string | null;
  amountTotal: number | null;
  currency: string;
}

// Verify the checkout session against Stripe server-side. The old success
// page showed "Payment Successful!" without checking anything — failure
// catalog material. Never trust the URL alone.
async function verifySession(
  sessionId: string
): Promise<VerifiedPurchase | null> {
  try {
    const session: Stripe.Checkout.Session =
      await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") return null;

    const email =
      session.customer_email ?? session.customer_details?.email ?? null;
    const paymentIntentId =
      typeof session.payment_intent === "string"
        ? session.payment_intent
        : session.payment_intent?.id ?? null;

    // Belt and braces alongside the webhook; idempotent.
    await markPurchaseCompleted(session.id, paymentIntentId, email);

    return {
      email,
      amountTotal: session.amount_total,
      currency: session.currency ?? "usd",
    };
  } catch (error) {
    console.error("[PRESALE] success verification failed:", error);
    return null;
  }
}

// This page can be opened by anyone holding the URL, so the buyer's email
// is masked (no PII on rendered pages).
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "your email";
  const visible = local.slice(0, 1);
  return `${visible}***@${domain}`;
}

function NotVerified() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-4">
          We couldn&apos;t verify this payment
        </h1>
        <p className="text-neutral-400 mb-8">
          This page only shows a confirmation after Stripe confirms the
          payment server-side. If you just paid, give it a moment and refresh.
          If you think something went wrong, reply to any email from us —
          nobody gets charged silently here.
        </p>
        <a
          href="/pricing"
          className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Back to Pricing
        </a>
      </div>
    </main>
  );
}

export default async function PackSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  if (!sessionId || !isPresaleConfigured()) {
    return <NotVerified />;
  }

  const purchase = await verifySession(sessionId);
  if (!purchase) {
    return <NotVerified />;
  }

  const amount =
    purchase.amountTotal !== null
      ? `$${(purchase.amountTotal / 100).toLocaleString()}`
      : null;

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-6">&#10003;</div>
          <h1 className="text-3xl font-bold mb-4">
            Presale confirmed — thank you
          </h1>
          <p className="text-neutral-400">
            Your {amount ? `${amount} ` : ""}payment for the{" "}
            <strong className="text-white">Agent Operations Pack</strong>
            {" is verified with Stripe."} You&apos;re backing it before it ships —
            that&apos;s what a presale is, and we won&apos;t pretend
            otherwise.
          </p>
        </div>

        <div className="rounded-xl border border-neutral-800 p-6 mb-6">
          <h2 className="font-semibold mb-4 text-neutral-300">
            What happens next
          </h2>
          <ul className="space-y-3 text-sm text-neutral-400">
            <li className="flex items-start gap-2">
              <span className="text-green-400 flex-shrink-0">&#10003;</span>
              Stripe emails your receipt
              {purchase.email ? ` to ${maskEmail(purchase.email)}` : ""}.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 flex-shrink-0">&#10003;</span>
              You&apos;ll get progress updates as the pack is built — real
              ones, from the operations log.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 flex-shrink-0">&#10003;</span>
              The pack ships to this email when it&apos;s ready. Questions?
              Reply to any email from us — it&apos;s read.
            </li>
          </ul>
        </div>

        <p className="text-sm text-neutral-500 text-center mb-8">
          And the standing promise: all 10 course modules stay free forever.
          The presale funds the pack; it never paywalls the course.
        </p>

        <div className="text-center">
          <a
            href="/activity"
            className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
          >
            Watch it get built &rarr;
          </a>
        </div>
      </div>
    </main>
  );
}
