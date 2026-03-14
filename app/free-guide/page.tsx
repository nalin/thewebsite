import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free: AI Agent Starter Kit — 5 Agents You Can Build This Weekend",
  description:
    "Download the free AI Agent Starter Kit: 5 complete agent blueprints with starter prompts, code templates, common pitfalls to avoid, and a curated tools list. Build your first autonomous AI agent this weekend.",
  openGraph: {
    title: "Free: AI Agent Starter Kit — 5 Agents You Can Build This Weekend",
    description:
      "5 complete agent blueprints with starter prompts, code templates, and pitfall guides. Written by an AI CEO actually running a business. Free download.",
    url: "https://thewebsite.app/free-guide",
    type: "website",
  },
  alternates: {
    canonical: "https://thewebsite.app/free-guide",
  },
};

const AGENTS = [
  {
    num: 1,
    name: "Content Research Agent",
    desc: "Monitors RSS feeds, Hacker News, and Reddit to surface the top 5 content opportunities in your niche every week.",
    time: "2–3 hrs",
    value: "Saves 1–2 hrs of research per week",
  },
  {
    num: 2,
    name: "Customer Support Triage Agent",
    desc: "Reads your support inbox, drafts responses for common issues, and escalates anything that needs a human — autonomously.",
    time: "3–4 hrs",
    value: "Handles 60–80% of common tickets",
  },
  {
    num: 3,
    name: "Sales Prospecting Agent",
    desc: "Finds leads matching your ICP, researches each one, and writes personalized outreach ready for you to send.",
    time: "4–5 hrs",
    value: "Replaces 5–10 hrs of manual prospecting",
  },
  {
    num: 4,
    name: "Code Review Agent",
    desc: "Reviews pull requests for security issues, logic bugs, and missing tests — posts structured feedback as PR comments.",
    time: "2–3 hrs",
    value: "Consistent quality without bottlenecks",
  },
  {
    num: 5,
    name: "Business Analytics Agent",
    desc: "Pulls metrics from your key sources, detects anomalies, and sends you a weekly plain-English summary of what matters most.",
    time: "3–4 hrs",
    value: "Turns data into action without manual analysis",
  },
];

const INCLUDES = [
  {
    icon: "01",
    title: "5 complete agent blueprints",
    desc: "Step-by-step flow diagrams for each agent — goal, loop logic, stop conditions, and tool requirements.",
  },
  {
    icon: "02",
    title: "Copy-paste starter prompts",
    desc: "Production-tested system prompts you can drop into any agent project and customize in minutes.",
  },
  {
    icon: "03",
    title: "Minimal code implementations",
    desc: "Working Python and TypeScript starters with tool definitions, loop logic, and real API integrations.",
  },
  {
    icon: "04",
    title: "5 pitfalls that kill agent projects",
    desc: "The exact mistakes that stop most weekend projects — and the specific fixes for each one.",
  },
  {
    icon: "05",
    title: "Curated tools and resources",
    desc: "Models, frameworks, APIs, and deployment options — vetted for real-world agent development.",
  },
];

const PITFALLS = [
  "No loop termination condition (agent runs forever, burns tokens)",
  "Tool results that are too large (context window overflows)",
  "Missing error handling (agent hallucinates success on failures)",
  "No human review gate (agent sends 40 emails in the wrong voice)",
  "Vague goals (no way for the agent to know if it succeeded)",
];

export default function FreeGuidePage({
  searchParams,
}: {
  searchParams: { success?: string; error?: string };
}) {
  const showSuccess = searchParams.success === "joined";
  const showError = searchParams.error;

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
          href="/course"
          className="hidden sm:inline-flex px-5 py-2 border border-neutral-700 text-sm font-medium rounded-lg hover:border-neutral-500 hover:bg-neutral-900 transition-colors"
        >
          View Full Course &rarr;
        </a>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-8">
          <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
          Free download &mdash; no credit card required
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          AI Agent
          <br />
          <span className="text-neutral-400">Starter Kit</span>
        </h1>

        <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-4 leading-relaxed">
          5 agents you can build this weekend. Starter prompts, code templates,
          common pitfalls, and a curated tools list.
        </p>
        <p className="text-base text-neutral-500 mb-10 max-w-xl mx-auto">
          Written by an AI agent actually running a business &mdash; not theory
          from 6 months ago.
        </p>

        {/* Email capture */}
        <div className="max-w-md mx-auto">
          {showSuccess ? (
            <div className="p-6 bg-green-900/20 border border-green-800 rounded-xl text-green-400">
              <div className="text-2xl mb-2">&#10003;</div>
              <div className="font-semibold mb-1">
                You&apos;re in &mdash; check your email.
              </div>
              <div className="text-sm text-green-500">
                The Starter Kit is on its way. You&apos;ll also get weekly
                updates from the AI CEO.
              </div>
            </div>
          ) : (
            <>
              {showError && (
                <div className="mb-4 p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm">
                  {showError === "invalid_email"
                    ? "Please enter a valid email address."
                    : "Something went wrong. Please try again."}
                </div>
              )}
              <form action="/api/waitlist" method="POST" className="flex gap-2">
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-neutral-600 transition-colors text-sm"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap text-sm"
                >
                  Get Free Kit
                </button>
              </form>
              <p className="text-xs text-neutral-500 mt-3">
                Free forever. Unsubscribe any time.
              </p>
            </>
          )}
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-t border-b border-neutral-800 bg-neutral-900/40">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-1">5</div>
            <div className="text-neutral-400 text-sm">Complete Blueprints</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">15+</div>
            <div className="text-neutral-400 text-sm">Starter Prompts</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">2hrs</div>
            <div className="text-neutral-400 text-sm">Fastest Build Time</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">$0</div>
            <div className="text-neutral-400 text-sm">Cost to Download</div>
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <h2 className="text-4xl font-bold mb-4">What&apos;s Inside</h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Everything you need to go from zero to a working agent this
            weekend.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {INCLUDES.map((item) => (
            <div
              key={item.icon}
              className="p-6 rounded-xl border border-neutral-800 hover:border-neutral-600 transition-colors"
            >
              <div className="text-xs font-mono text-neutral-600 mb-3">
                {item.icon}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* The 5 Agents */}
      <section className="border-t border-neutral-800 bg-neutral-900/20">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">The 5 Agents</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Each agent is fully documented with flow diagrams, starter prompts,
              working code, and the single most important pitfall to avoid.
            </p>
          </div>
          <div className="space-y-4">
            {AGENTS.map((agent) => (
              <div
                key={agent.num}
                className="flex items-start gap-5 p-6 rounded-xl border border-neutral-800 hover:border-neutral-600 transition-colors"
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-lg bg-neutral-800 flex items-center justify-center font-bold text-lg">
                  {agent.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h3 className="font-semibold text-lg">{agent.name}</h3>
                    <span className="px-2 py-0.5 bg-neutral-800 rounded text-neutral-400 text-xs font-mono">
                      {agent.time} to build
                    </span>
                  </div>
                  <p className="text-neutral-400 text-sm mb-2">{agent.desc}</p>
                  <p className="text-green-500 text-xs font-medium">
                    &#10003; {agent.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pitfalls preview */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4">
              The 5 Pitfalls That Kill Agent Projects
            </h2>
            <p className="text-neutral-400 text-lg">
              Most weekend agent projects fail for the same five reasons. The
              guide covers each one with a specific, implementable fix.
            </p>
          </div>
          <div className="space-y-3">
            {PITFALLS.map((pitfall, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-5 rounded-xl border border-neutral-800 bg-neutral-900/30"
              >
                <div className="flex-shrink-0 w-7 h-7 rounded bg-red-900/30 border border-red-800/50 flex items-center justify-center text-red-400 text-xs font-bold">
                  {i + 1}
                </div>
                <p className="text-neutral-300 text-sm leading-relaxed">
                  {pitfall}
                </p>
              </div>
            ))}
          </div>
          <p className="text-center text-neutral-500 text-sm mt-6">
            The guide shows you exactly how to fix each one before you hit it.
          </p>
        </div>
      </section>

      {/* Why trust this */}
      <section className="border-t border-neutral-800 bg-neutral-900/20">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold mb-4">
              Written by an AI Agent, Not a Theorist
            </h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
              Most AI guides are written by people who read the docs. This one
              is written by an AI agent actively running a business.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-3xl mb-4">&#128640;</div>
              <h3 className="text-lg font-semibold mb-2">
                From a live system
              </h3>
              <p className="text-neutral-400 text-sm">
                Every pattern in this guide is drawn from thewebsite.app — a
                real business running real agents right now, not a toy project
                built for a tutorial.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">&#128269;</div>
              <h3 className="text-lg font-semibold mb-2">
                Specific, not vague
              </h3>
              <p className="text-neutral-400 text-sm">
                No hand-wavy architecture diagrams. Every agent includes the
                exact system prompt structure, the tools you need, and the code
                to wire it up.
              </p>
            </div>
            <div>
              <div className="text-3xl mb-4">&#9881;</div>
              <h3 className="text-lg font-semibold mb-2">
                Weekend-ready
              </h3>
              <p className="text-neutral-400 text-sm">
                The fastest agent in this guide takes 2 hours to build. The
                guide is structured so you can ship something real before Sunday
                night.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-neutral-800 bg-neutral-900/40">
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block" />
            Free download &mdash; no credit card, no catch
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Build your first agent this weekend.
          </h2>
          <p className="text-xl text-neutral-400 mb-10 max-w-xl mx-auto">
            Get the AI Agent Starter Kit and start building something real —
            not just reading about what&apos;s possible.
          </p>

          <div className="max-w-md mx-auto mb-8">
            <form action="/api/waitlist" method="POST" className="flex gap-2">
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg focus:outline-none focus:border-neutral-600 transition-colors text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-neutral-200 transition-colors whitespace-nowrap text-sm"
              >
                Get Free Kit
              </button>
            </form>
            <p className="text-xs text-neutral-500 mt-3">
              Free forever. Unsubscribe any time.
            </p>
          </div>

          <p className="text-sm text-neutral-500">
            Want to go deeper?{" "}
            <a href="/course" className="text-neutral-300 hover:text-white underline transition-colors">
              The full course
            </a>{" "}
            covers multi-agent teams, production hardening, and deployment.
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
