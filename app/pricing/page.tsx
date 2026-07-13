export const metadata = {
  title: "Pricing — Build Your Own AI Agent Course",
  description:
    "The entire 10-module AI agent course is free. Modules 1–2 are open; modules 3–10 unlock with a confirmed email. A paid Agent Operations Pack is in the works — no price or date yet.",
  openGraph: {
    title: "Pricing — Build Your Own AI Agent Course",
    description:
      "All 10 AI agent development modules are free. A paid Agent Operations Pack is in the works — no price or date announced.",
    url: "https://www.thewebsite.app/pricing",
    type: "website",
  },
  alternates: {
    canonical: "https://www.thewebsite.app/pricing",
  },
};

const FREE_MODULES = [
  "Module 1: Automation vs. Autonomy",
  "Module 2: Setting Up Your Agent Environment",
  "Module 3: Autonomous Decision Making",
  "Module 4: Integrating AI Agents with Real Tools",
  "Module 5: Case Study — The Website: What Actually Happened",
  "Module 6: Building Multi-Agent Teams",
  "Module 7: Production AI Agent Best Practices",
  "Module 8: Deployment & Scaling",
  "Module 9: Building Your First AI Agent Business",
  "Module 10: Case Studies & Real-World Examples",
];

const PACK_SOURCES = [
  "The CLAUDE.md operating manual that actually runs this site",
  "Real worker-agent dispatch history from the March build",
  "The July 2026 audit: every failure, documented",
  "Whatever else running this business produces",
];

export default function PricingPage() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="max-w-4xl mx-auto px-4 py-6">
        <a
          href="/"
          className="text-xl font-bold tracking-tight hover:text-neutral-300 transition-colors"
        >
          &larr; The Website
        </a>
      </header>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="inline-block px-4 py-2 bg-neutral-800 rounded-full text-sm font-medium mb-6">
          Updated July 2026 — all 10 modules are now free
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Simple, honest pricing
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
          Simpler than it used to be: the entire course is free. The only paid
          thing on this site is a premium pack that doesn&apos;t exist yet —
          and we won&apos;t name a price until it does.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Free Tier */}
          <div className="rounded-xl border border-neutral-800 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">The Course</h2>
              <p className="text-neutral-400 text-sm">
                No credit card. No catch.
              </p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-neutral-400 ml-2">forever</span>
            </div>

            <a
              href="/course"
              className="block w-full py-3 px-6 rounded-lg border border-neutral-700 text-center font-medium hover:border-neutral-500 hover:bg-neutral-900 transition-colors mb-8"
            >
              Start learning free &rarr;
            </a>

            <div>
              <p className="text-sm font-medium text-neutral-300 mb-4">
                All 10 modules. Modules 1&ndash;2 are open now; modules
                3&ndash;10 unlock with a confirmed email.
              </p>
              <ul className="space-y-3">
                {FREE_MODULES.map((module) => (
                  <li key={module} className="flex items-start gap-3 text-sm">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">
                      &#10003;
                    </span>
                    <span className="text-neutral-300">{module}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Agent Operations Pack */}
          <div className="rounded-xl border border-white/20 p-8 relative bg-neutral-900">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
                IN THE WORKS
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Agent Operations Pack</h2>
              <p className="text-neutral-400 text-sm">
                A paid deep-dive into how this site is actually operated.
              </p>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold">TBD</span>
              <p className="text-neutral-400 text-sm mt-1">
                No price until it exists. No fake countdown either.
              </p>
            </div>

            <a
              href="/course/access"
              className="block w-full py-3 px-6 rounded-lg bg-white text-black text-center font-bold hover:bg-neutral-200 transition-colors mb-8"
            >
              Get notified when it&apos;s real &rarr;
            </a>

            <div>
              <p className="text-sm font-medium text-neutral-300 mb-4">
                It will be built from material that already exists:
              </p>
              <ul className="space-y-3">
                {PACK_SOURCES.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="text-white mt-0.5 flex-shrink-0">&#10003;</span>
                    <span className="text-neutral-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why a paid pack */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-neutral-800">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Why charge for anything?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl mb-4">&#129504;</div>
            <h3 className="text-lg font-semibold mb-2">The course stays free</h3>
            <p className="text-neutral-400 text-sm">
              All 10 modules, permanently. The foundational material is the
              proof this experiment produces something useful — it&apos;s not
              the product.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-4">&#128269;</div>
            <h3 className="text-lg font-semibold mb-2">Operations are the moat</h3>
            <p className="text-neutral-400 text-sm">
              The pack will cover how the site is actually run — the operating
              manual, the worker dispatches, the audits. That&apos;s the
              material that only exists because a live system produced it.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-4">&#128202;</div>
            <h3 className="text-lg font-semibold mb-2">Honest accounting</h3>
            <p className="text-neutral-400 text-sm">
              This site has made $0 so far — that&apos;s public on the metrics
              page. If it ever charges money, the accounting will be just as
              public.
            </p>
          </div>
        </div>
      </section>

      {/* Honesty note */}
      <section className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-900/50">
          <div className="text-3xl mb-4">&#128274;</div>
          <h3 className="text-xl font-bold mb-2">Nothing to risk</h3>
          <p className="text-neutral-400 text-sm">
            There is nothing for sale on this site today. An earlier version of
            this page advertised a $67 &quot;founders price&quot; — payments
            were never live and nobody was ever charged. When the Agent
            Operations Pack ships, the price will be stated here first.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center border-t border-neutral-800">
        <h2 className="text-3xl font-bold mb-4">
          Start free. It&apos;s all free.
        </h2>
        <p className="text-neutral-400 mb-8">
          Modules 1&ndash;2 are open right now. Confirm your email and the
          other eight unlock too.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/course"
            className="px-8 py-3 rounded-lg border border-neutral-700 font-medium hover:border-neutral-500 hover:bg-neutral-900 transition-colors"
          >
            Start reading &rarr;
          </a>
          <a
            href="/course/access"
            className="px-8 py-3 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
          >
            Unlock all 10 modules
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
        <p>
          <a href="/" className="underline hover:text-neutral-300">
            Back to The Website
          </a>
          {" • "}
          <a href="/course" className="underline hover:text-neutral-300">
            Free Course
          </a>
          {" • "}
          <a href="/blog" className="underline hover:text-neutral-300">
            Blog
          </a>
          {" • "}
          <a
            href="https://twitter.com/nalin"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-neutral-300"
          >
            Follow @nalin
          </a>
        </p>
      </footer>
    </main>
  );
}
