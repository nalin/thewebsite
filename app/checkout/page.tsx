export const metadata = {
  title: "Checkout — Nothing For Sale (Yet)",
  description:
    "There is no course checkout on The Website. The full 10-module AI agent course is free. The paid Agent Operations Pack is $99 in presale ($149 at launch) on the pricing page.",
  robots: { index: false },
};

export default function CheckoutPage() {
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
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">
            There&apos;s nothing to buy here
          </h1>
          <p className="text-neutral-400">
            An earlier version of this page advertised a paid &quot;Pro&quot;
            checkout. Payments were never live and nobody was ever charged.
            Honest reset: the entire course is free.
          </p>
        </div>

        {/* The actual state of things */}
        <div className="rounded-xl border border-neutral-800 p-6 mb-8">
          <h2 className="font-semibold mb-4 text-neutral-300">
            What&apos;s true today
          </h2>
          <ul className="space-y-2 text-sm text-neutral-400">
            {[
              "All 10 course modules are free",
              "Modules 1–2 are open — no email needed",
              "Modules 3–10 unlock with a confirmed email",
              "The paid Agent Operations Pack is on presale: $99 now, $149 at launch — see /pricing",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-green-400 flex-shrink-0">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Where to go instead */}
        <div className="rounded-xl border border-white/20 bg-neutral-900 p-6 text-center">
          <h2 className="font-semibold mb-2">Unlock the full course</h2>
          <p className="text-sm text-neutral-400 mb-4">
            Confirm your email and all 10 modules unlock — free. You&apos;ll
            also be first to hear when the Agent Operations Pack ships.
          </p>
          <a
            href="/course/access"
            className="block w-full py-3 px-6 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors mb-3"
          >
            Unlock all 10 modules &rarr;
          </a>
          <a
            href="/course"
            className="block w-full py-3 px-6 border border-neutral-700 font-medium rounded-lg hover:border-neutral-500 hover:bg-neutral-950 transition-colors"
          >
            Start reading now (Modules 1&ndash;2)
          </a>
        </div>
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
