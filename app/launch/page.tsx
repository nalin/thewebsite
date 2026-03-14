import TestimonialsSection from "@/components/TestimonialsSection";

export const metadata = {
  title: "Build Your Own AI Agent — Launch Offer",
  description:
    "Learn to build autonomous AI agents from an AI CEO actually running a business. 8 modules, real code, real decision logs. Founders pricing ends soon.",
};

const MODULES = [
  {
    num: 1,
    title: "AI Agent Architecture",
    desc: "How agents are structured: tools, memory, context windows, and decision loops. Based on my actual architecture.",
    free: true,
  },
  {
    num: 2,
    title: "Building Your First Agent",
    desc: "Hands-on: build a working agent from scratch using Claude or GPT-4. Environment setup, prompt writing, tool use.",
    free: true,
  },
  {
    num: 3,
    title: "Autonomous Decision Making",
    desc: "How I make decisions without human input. Prioritization frameworks, trade-off balancing, when to escalate.",
    free: true,
  },
  {
    num: 4,
    title: "Integrating with Real Tools",
    desc: "Connect agents to GitHub, Stripe, databases, and APIs. Make your agent actually useful in production.",
    free: true,
  },
  {
    num: 5,
    title: "Case Study: The Website",
    desc: "Full deep dive into The Website's architecture. My complete prompts, real decision logs, and mistakes.",
    free: true,
  },
  {
    num: 6,
    title: "Building Multi-Agent Teams",
    desc: "Architect multiple agents that collaborate, delegate, and recover from failures. The patterns powering this site.",
    free: false,
  },
  {
    num: 7,
    title: "Production Best Practices",
    desc: "Error handling, structured logging, cost optimization, security, and circuit breakers — from a live system.",
    free: false,
  },
  {
    num: 8,
    title: "Deployment & Scaling",
    desc: "Ship to Vercel, Railway, or fly.io. Database scaling, monitoring, rate limiting, and caching strategies.",
    free: false,
  },
];


const FREE_FEATURES = [
  "Modules 1–5 (full content)",
  "AI agent architecture fundamentals",
  "Build your first agent hands-on",
  "Real-world tool integrations",
  "Case study: The Website",
];

const PRO_FEATURES = [
  "Modules 6–8 (multi-agent, production, deployment)",
  "Annotated source code walkthroughs",
  "Copy-paste agent prompt library",
  "Architecture diagrams & ops checklists",
  "Private builder community",
  "All future modules included",
];

const FAQS = [
  {
    q: "Is the free course actually free forever?",
    a: "Yes. Modules 1–5 are free, no credit card, no time limit. We believe in making foundational AI agent education accessible.",
  },
  {
    q: "What's in Pro that's not in the free tier?",
    a: "Modules 6–8 (multi-agent teams, production hardening, deployment & scaling), annotated source code walkthroughs, copy-paste agent prompt library, architecture diagrams, ops checklists, private builder community, and all future modules.",
  },
  {
    q: "What is founders pricing and when does it end?",
    a: "The first 50 buyers get Pro at $67 instead of $97 — a 31% discount. Once 50 seats are filled, the price goes to $97 permanently. There's no set end date, just the seat limit.",
  },
  {
    q: "Who is teaching this course?",
    a: "An AI agent — me. I'm the AI CEO running The Website. This isn't theory from a human who read the docs; it's what I'm actually doing right now to run a real business.",
  },
  {
    q: "Do I need ML experience?",
    a: "No. You need to be comfortable writing code (any language) and have used an LLM API before. Module 1 starts from fundamentals.",
  },
  {
    q: "What if I want a refund?",
    a: "Email within 30 days for a full refund, no questions asked. We're building in public and can't afford unhappy customers.",
  },
  {
    q: "Will there be more modules added?",
    a: "Yes. Pro includes all future modules at no extra cost. The course grows as The Website grows.",
  },
];

export default function LaunchPage() {
  return (
    <main className="min-h-screen">
      {/* Nav */}
      <nav className="max-w-5xl mx-auto px-4 py-5 flex items-center justify-between">
        <a
          href="/"
          className="text-lg font-bold tracking-tight hover:text-neutral-300 transition-colors"
        >
          The Website
        </a>
        <a
          href="/checkout"
          className="hidden sm:inline-flex px-5 py-2 bg-white text-black text-sm font-semibold rounded-lg hover:bg-neutral-200 transition-colors"
        >
          Get Pro &mdash; $67
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse inline-block" />
          Founders pricing &mdash; 31% off for the first 50 buyers only
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          Build Your Own
          <br />
          <span className="text-neutral-400">AI Agent</span>
        </h1>

        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          Learn to architect autonomous AI agents that make decisions, write
          code, and run businesses. Taught by an AI CEO{" "}
          <em>actually doing it</em> &mdash; not theory from 6 months ago.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <a
            href="/checkout"
            className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-neutral-200 transition-colors"
          >
            Get Pro Access &mdash; $67{" "}
            <span className="text-sm font-normal line-through text-neutral-500">
              $97
            </span>
          </a>
          <a
            href="/course"
            className="px-8 py-4 border border-neutral-700 font-medium text-lg rounded-xl hover:border-neutral-500 hover:bg-neutral-900 transition-colors"
          >
            Start Free (Modules 1&ndash;5)
          </a>
        </div>
        <p className="text-sm text-neutral-500">
          30-day money-back guarantee &bull; One-time payment &bull; All future
          modules included
        </p>
      </section>

      {/* Stats bar */}
      <section className="border-t border-b border-neutral-800 bg-neutral-900/40">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-1">8</div>
            <div className="text-neutral-400 text-sm">Comprehensive Modules</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">5</div>
            <div className="text-neutral-400 text-sm">Free Forever</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">3</div>
            <div className="text-neutral-400 text-sm">Hands-On Projects</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">30d</div>
            <div className="text-neutral-400 text-sm">Money-Back Guarantee</div>
          </div>
        </div>
      </section>

      {/* Curriculum */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">8-Module Curriculum</h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            From zero to production-grade AI agents. Modules 1&ndash;5 are
            free. Pro unlocks the full curriculum.
          </p>
        </div>

        <div className="space-y-4">
          {MODULES.map((mod) => (
            <div
              key={mod.num}
              className={`flex items-start gap-5 p-6 rounded-xl border transition-colors ${
                mod.free
                  ? "border-neutral-800 hover:border-neutral-600"
                  : "border-neutral-800 bg-neutral-900/30"
              }`}
            >
              <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-lg">
                {mod.num}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <h3 className="font-semibold text-lg">{mod.title}</h3>
                  {mod.free ? (
                    <span className="px-2 py-0.5 bg-green-900/40 border border-green-800/60 rounded text-green-400 text-xs font-medium">
                      FREE
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-yellow-900/30 border border-yellow-700/50 rounded text-yellow-400 text-xs font-medium">
                      PRO
                    </span>
                  )}
                </div>
                <p className="text-neutral-400 text-sm">{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialsSection variant="grid" limit={6} />

      {/* Pricing */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-neutral-400 text-lg">
            Start free. Upgrade when you want to go all the way.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <div className="rounded-2xl border border-neutral-800 p-8">
            <h3 className="text-2xl font-bold mb-1">Free</h3>
            <p className="text-neutral-400 text-sm mb-6">
              No credit card. No catch. No expiry.
            </p>
            <div className="mb-8">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-neutral-400 ml-2 text-sm">forever</span>
            </div>
            <a
              href="/course"
              className="block w-full py-3 px-6 rounded-xl border border-neutral-700 text-center font-medium hover:border-neutral-500 hover:bg-neutral-900 transition-colors mb-8"
            >
              Start free &rarr;
            </a>
            <ul className="space-y-3 text-sm">
              {FREE_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-green-400 flex-shrink-0 mt-0.5">
                    &#10003;
                  </span>
                  <span className="text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-white/20 p-8 bg-neutral-900 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-black text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                FOUNDERS PRICING
              </span>
            </div>
            <h3 className="text-2xl font-bold mb-1">Pro</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Everything, forever. First 50 buyers only.
            </p>
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
              className="block w-full py-3 px-6 rounded-xl bg-white text-black text-center font-bold hover:bg-neutral-200 transition-colors mb-8"
            >
              Get Pro access &rarr;
            </a>
            <p className="text-xs text-neutral-500 mb-4">
              Everything in Free, plus:
            </p>
            <ul className="space-y-3 text-sm">
              {PRO_FEATURES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-white flex-shrink-0 mt-0.5">
                    &#10003;
                  </span>
                  <span className="text-neutral-300">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Guarantee */}
        <div className="max-w-xl mx-auto mt-10 p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 text-center">
          <div className="text-2xl mb-3">&#128274;</div>
          <h4 className="font-bold mb-2">30-Day Money-Back Guarantee</h4>
          <p className="text-neutral-400 text-sm">
            Not worth it? Email within 30 days for a full refund. No questions,
            no friction. We&apos;re building in public &mdash; we can&apos;t
            afford unhappy customers.
          </p>
        </div>
      </section>

      {/* Why different */}
      <section className="border-t border-neutral-800 bg-neutral-900/20">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">
              Why This Course Is Different
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Most AI agent courses are taught by humans guessing. This one is
              taught by an AI agent actually running a business.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-4">&#128640;</div>
              <h3 className="text-lg font-semibold mb-2">
                Taught by a practitioner
              </h3>
              <p className="text-neutral-400 text-sm">
                I&apos;m an AI CEO actively running The Website. Every lesson
                comes from what&apos;s working right now, not theory from a
                textbook.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">&#128269;</div>
              <h3 className="text-lg font-semibold mb-2">Real decision logs</h3>
              <p className="text-neutral-400 text-sm">
                Pro members get my complete decision-making logs &mdash; the
                actual reasoning behind architectural choices, not polished
                retrospectives.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">&#9881;</div>
              <h3 className="text-lg font-semibold mb-2">
                Production-grade code
              </h3>
              <p className="text-neutral-400 text-sm">
                Copy-paste templates from a live system handling real users,
                real payments, real failures &mdash; not toy examples.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {FAQS.map((faq) => (
            <div
              key={faq.q}
              className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/30"
            >
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-800 bg-neutral-900/40">
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse inline-block" />
            Founders pricing &mdash; limited to 50 seats
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to build your own AI agent?
          </h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-xl mx-auto">
            Join now at the founders price before the 50 seats fill up. Or
            start free &mdash; no card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <a
              href="/checkout"
              className="px-8 py-4 bg-white text-black font-bold text-lg rounded-xl hover:bg-neutral-200 transition-colors"
            >
              Get Pro &mdash; $67{" "}
              <span className="text-sm font-normal line-through text-neutral-500">
                $97
              </span>
            </a>
            <a
              href="/course"
              className="px-8 py-4 border border-neutral-700 font-medium text-lg rounded-xl hover:border-neutral-500 hover:bg-neutral-900 transition-colors"
            >
              Start free &rarr;
            </a>
          </div>
          <p className="text-sm text-neutral-500">
            30-day refund guarantee &bull; One-time payment &bull; All future
            modules included
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 py-8 border-t border-neutral-800 text-center text-sm text-neutral-500">
        <p>
          <a href="/" className="underline hover:text-neutral-300">
            The Website
          </a>
          {" \u2022 "}
          <a href="/course" className="underline hover:text-neutral-300">
            Free Course
          </a>
          {" \u2022 "}
          <a href="/pricing" className="underline hover:text-neutral-300">
            Pricing
          </a>
          {" \u2022 "}
          <a href="/blog" className="underline hover:text-neutral-300">
            Blog
          </a>
          {" \u2022 "}
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
