"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email }),
      });
    } catch {
      // Best-effort — we still show success
    }
    setLoading(false);
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
        <a
          href="/pricing"
          className="text-xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
        >
          &larr; Pricing
        </a>
      </header>

      <section className="max-w-lg mx-auto px-4 py-16">
        {submitted ? (
          <div className="text-center">
            <div className="text-5xl mb-6">&#127881;</div>
            <h1 className="text-3xl font-bold mb-4">You&apos;re on the list!</h1>
            <p className="text-neutral-400 mb-8">
              We&apos;re setting up secure payments right now. You&apos;ll be the
              first to know the moment Pro is open — and your founders pricing
              of <strong className="text-white">$67</strong> is locked in.
            </p>
            <a
              href="/course"
              className="inline-block px-6 py-3 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Start the free course while you wait &rarr;
            </a>
          </div>
        ) : (
          <>
            <div className="text-center mb-10">
              <div className="inline-block px-4 py-2 bg-neutral-800 rounded-full text-sm font-medium mb-6">
                Founders pricing — 31% off, first 50 buyers
              </div>
              <h1 className="text-4xl font-bold mb-4">Get Pro Access</h1>
              <p className="text-neutral-400">
                Payment infrastructure is being set up. Reserve your founders
                price now and we&apos;ll email you the moment checkout is live.
              </p>
            </div>

            {/* Order summary */}
            <div className="rounded-xl border border-neutral-800 p-6 mb-8">
              <h2 className="font-semibold mb-4 text-neutral-300">
                Order summary
              </h2>
              <div className="flex justify-between items-center mb-3">
                <span className="text-neutral-400">AI Agent Course — Pro</span>
                <span className="text-neutral-500 line-through">$97</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-neutral-400">Founders discount</span>
                <span className="text-green-400">-$30</span>
              </div>
              <div className="border-t border-neutral-800 pt-3 flex justify-between items-center font-bold">
                <span>Total</span>
                <span>$67 <span className="text-neutral-500 font-normal text-sm">one-time</span></span>
              </div>
            </div>

            {/* What you get */}
            <div className="rounded-xl border border-neutral-800 p-6 mb-8">
              <h2 className="font-semibold mb-4 text-neutral-300">
                What&apos;s included
              </h2>
              <ul className="space-y-2 text-sm text-neutral-400">
                {[
                  "All 5 existing modules (free tier)",
                  "Module 6+: Advanced topics as they drop",
                  "Annotated source code walkthroughs",
                  "Agent prompt library & templates",
                  "Private builder community",
                  "30-day money-back guarantee",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="text-green-400 flex-shrink-0">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Email form */}
            <div className="rounded-xl border border-white/20 bg-neutral-900 p-6">
              <h2 className="font-semibold mb-2">Reserve your spot</h2>
              <p className="text-sm text-neutral-400 mb-4">
                Enter your email and we&apos;ll notify you the moment payment is
                live. Your $67 founders price is guaranteed.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 bg-neutral-950 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {loading ? "Reserving..." : "Reserve founders price \u2192"}
                </button>
              </form>
              <p className="text-xs text-neutral-500 mt-3 text-center">
                No charge now. We&apos;ll email you when checkout is ready.
              </p>
            </div>
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
        <p>
          <a href="/pricing" className="underline hover:text-neutral-300">
            Back to Pricing
          </a>
          {" • "}
          <a href="/course" className="underline hover:text-neutral-300">
            Free Course
          </a>
        </p>
      </footer>
    </main>
  );
}
