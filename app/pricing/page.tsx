export const metadata = {
  title: "Pricing - Build Your Own AI Agent Course",
  description:
    "Free access to the first 5 modules. Go Pro for advanced content, community access, and everything we build next.",
};

const FREE_MODULES = [
  "Module 1: AI Agent Architecture",
  "Module 2: Building Your First Agent",
  "Module 3: Autonomous Decision Making",
  "Module 4: Integrating with Real Tools",
  "Module 5: Case Study — The Website",
];

const PRO_EXTRAS = [
  "Module 6+: Multi-agent coordination",
  "Module 7+: Production hardening & cost optimization",
  "Annotated source code walkthroughs",
  "Agent prompt library (copy-paste ready)",
  "Architecture diagrams & ops checklists",
  "Private community of builders",
  "All future modules included",
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
          Founders pricing — first 50 buyers get 31% off
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
          Simple, honest pricing
        </h1>
        <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
          The free course is genuinely complete. Pro is for builders who want to
          go deeper — advanced modules, community, and everything we add next.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6 items-start">
          {/* Free Tier */}
          <div className="rounded-xl border border-neutral-800 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Free</h2>
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
                What&apos;s included:
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

          {/* Pro Tier */}
          <div className="rounded-xl border border-white/20 p-8 relative bg-neutral-900">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full">
                FOUNDERS PRICING
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-1">Pro</h2>
              <p className="text-neutral-400 text-sm">
                Everything, forever. First 50 buyers only.
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold">$67</span>
                <span className="text-neutral-500 line-through text-xl">
                  $97
                </span>
              </div>
              <p className="text-neutral-400 text-sm mt-1">one-time payment</p>
            </div>

            <a
              href="/checkout"
              className="block w-full py-3 px-6 rounded-lg bg-white text-black text-center font-bold hover:bg-neutral-200 transition-colors mb-8"
            >
              Get Pro access &rarr;
            </a>

            <div>
              <p className="text-sm font-medium text-neutral-300 mb-4">
                Everything in Free, plus:
              </p>
              <ul className="space-y-3">
                {PRO_EXTRAS.map((item) => (
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

      {/* Why Pro */}
      <section className="max-w-4xl mx-auto px-4 py-16 border-t border-neutral-800">
        <h2 className="text-3xl font-bold mb-12 text-center">Why go Pro?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="text-3xl mb-4">&#129504;</div>
            <h3 className="text-lg font-semibold mb-2">Advanced techniques</h3>
            <p className="text-neutral-400 text-sm">
              Multi-agent coordination, production cost optimization, and
              reliability patterns learned from running a live system — not
              theory.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-4">&#128269;</div>
            <h3 className="text-lg font-semibold mb-2">Behind the code</h3>
            <p className="text-neutral-400 text-sm">
              Annotated walkthroughs of the actual source code running The
              Website, with decision logs explaining every architectural choice.
            </p>
          </div>
          <div>
            <div className="text-3xl mb-4">&#128101;</div>
            <h3 className="text-lg font-semibold mb-2">Builder community</h3>
            <p className="text-neutral-400 text-sm">
              Private channel with other developers building AI agents. Compare
              notes, share prompts, get feedback on your architecture.
            </p>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="p-8 rounded-xl border border-neutral-800 bg-neutral-900/50">
          <div className="text-3xl mb-4">&#128274;</div>
          <h3 className="text-xl font-bold mb-2">Zero risk</h3>
          <p className="text-neutral-400 text-sm">
            If you buy Pro and decide it wasn&apos;t worth it, email us within
            30 days for a full refund. No questions, no friction. We&apos;re
            building this in public — we can&apos;t afford to have unhappy
            customers.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center border-t border-neutral-800">
        <h2 className="text-3xl font-bold mb-4">
          Start free. Upgrade when you&apos;re ready.
        </h2>
        <p className="text-neutral-400 mb-8">
          The free course is genuinely valuable. Pro is for when you want to go
          all the way.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/course"
            className="px-8 py-3 rounded-lg border border-neutral-700 font-medium hover:border-neutral-500 hover:bg-neutral-900 transition-colors"
          >
            Start free &rarr;
          </a>
          <a
            href="/checkout"
            className="px-8 py-3 rounded-lg bg-white text-black font-bold hover:bg-neutral-200 transition-colors"
          >
            Get Pro &mdash; $67
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
