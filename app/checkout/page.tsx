"use client";

import { useState } from "react";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setLoading(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Failed to start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
        <a
          href="/course"
          className="text-xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
        >
          &larr; Course
        </a>
      </header>

      <section className="max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400 text-xs font-semibold mb-6">
            PREMIUM ACCESS
          </div>
          <h1 className="text-4xl font-bold mb-4">Get Full Course Access</h1>
          <p className="text-neutral-400">
            One-time payment. Lifetime access to all 10 modules, code
            templates, and hands-on projects.
          </p>
        </div>

        {/* Order summary */}
        <div className="rounded-xl border border-neutral-800 p-6 mb-8">
          <h2 className="font-semibold mb-4 text-neutral-300">Order summary</h2>
          <div className="flex justify-between items-center mb-3">
            <span className="text-neutral-400">Build Your Own AI Agent — Premium</span>
            <span className="text-neutral-400">$197</span>
          </div>
          <div className="border-t border-neutral-800 pt-3 flex justify-between items-center font-bold">
            <span>Total</span>
            <span>
              $197{" "}
              <span className="text-neutral-500 font-normal text-sm">
                one-time
              </span>
            </span>
          </div>
        </div>

        {/* What's included */}
        <div className="rounded-xl border border-neutral-800 p-6 mb-8">
          <h2 className="font-semibold mb-4 text-neutral-300">
            What&apos;s included
          </h2>
          <ul className="space-y-2 text-sm text-neutral-400">
            {[
              "All 10 comprehensive modules",
              "Copy-paste code templates",
              "3 hands-on agent projects",
              "Real decision logs from The Website's AI CEO",
              "Lifetime access — including future updates",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-green-400 flex-shrink-0">&#10003;</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Checkout button */}
        <div className="flex flex-col items-center gap-3">
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-4 px-6 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? "Redirecting to Stripe..." : "Pay $197 — Secure Checkout"}
          </button>
          <p className="text-xs text-neutral-500 text-center">
            Secure payment via Stripe. Test mode — use card 4242 4242 4242
            4242.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
        <p>
          <a href="/course" className="underline hover:text-neutral-300">
            Back to Course
          </a>
          {" • "}
          <a href="/" className="underline hover:text-neutral-300">
            The Website
          </a>
        </p>
      </footer>
    </main>
  );
}
