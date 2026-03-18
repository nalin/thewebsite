import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { purchases } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { COURSE_PRODUCT_ID } from "@/lib/stripe";

export const metadata = {
  title: "Premium Bonuses — Build Your Own AI Agent",
  description: "Access your premium bonuses: templates, case studies, Discord community, and 1-on-1 coaching.",
};

async function getPurchaseStatus(userId: string) {
  const purchase = await db
    .select()
    .from(purchases)
    .where(
      and(
        eq(purchases.userId, userId),
        eq(purchases.productId, COURSE_PRODUCT_ID),
        eq(purchases.status, "completed")
      )
    )
    .get();
  return purchase ?? null;
}

const TEMPLATES = [
  {
    name: "AI Agent Starter Kit",
    description: "Complete boilerplate for building an autonomous AI agent with tool use, memory, and decision-making loops.",
    filename: "ai-agent-starter-kit.zip",
    size: "12 KB",
    icon: "🤖",
  },
  {
    name: "Multi-Agent Orchestration Template",
    description: "Production-ready template for CEO + Worker agent teams, with task delegation, status tracking, and inter-agent messaging.",
    filename: "multi-agent-orchestration.zip",
    size: "18 KB",
    icon: "🏗️",
  },
  {
    name: "Prompt Engineering Playbook",
    description: "The exact system prompts I use for reasoning, tool selection, and decision-making. Copy-paste ready.",
    filename: "prompt-engineering-playbook.md",
    size: "8 KB",
    icon: "📝",
  },
  {
    name: "Agent Evaluation Framework",
    description: "Test suite and evaluation harness for measuring agent performance, reliability, and cost efficiency.",
    filename: "agent-eval-framework.zip",
    size: "22 KB",
    icon: "🧪",
  },
  {
    name: "Production Deployment Checklist",
    description: "Step-by-step checklist for deploying AI agents to production with monitoring, error handling, and rollback plans.",
    filename: "production-checklist.md",
    size: "5 KB",
    icon: "🚀",
  },
];

const CASE_STUDIES = [
  {
    title: "The Website: 65+ Tasks, $0.57/Task, 0 Human Commits",
    description: "A full breakdown of how this site is built and operated entirely by AI agents. Architecture diagrams, cost analysis, decision logs, and everything that went wrong.",
    tags: ["Multi-Agent", "Next.js", "Full-Stack"],
    metric: "$0.57/task",
    icon: "🌐",
  },
  {
    title: "Customer Support Agent: 73% Auto-Resolution",
    description: "How a solo founder replaced $4,200/month in support costs with a $180/month AI agent. Ticket routing, escalation logic, and satisfaction measurement.",
    tags: ["Support", "Claude API", "Automation"],
    metric: "73% auto-resolved",
    icon: "💬",
  },
  {
    title: "Code Review Agent: 68% Bug Catch Rate in 52 Seconds",
    description: "The agent that reviews PRs faster than any human. Static analysis integration, context-aware suggestions, and how it handles edge cases.",
    tags: ["DevTools", "GitHub API", "Code Quality"],
    metric: "52s avg review",
    icon: "🔍",
  },
  {
    title: "Content Pipeline: 30 Posts/Week, $0.12/Post",
    description: "Fully automated content research, writing, editing, and distribution. How to maintain quality at scale without human review for routine content.",
    tags: ["Content", "SEO", "Automation"],
    metric: "30 posts/week",
    icon: "✍️",
  },
  {
    title: "Sales Outreach Agent: 8.4% Reply Rate",
    description: "Personalized cold outreach at scale. Lead research, email personalization, follow-up sequencing, and how to avoid spam filters.",
    tags: ["Sales", "Email", "Personalization"],
    metric: "8.4% reply rate",
    icon: "📧",
  },
];

export default async function PremiumBonusesPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect("/course?error=login_required");
  }

  const purchase = await getPurchaseStatus(session.user.id);

  if (!purchase) {
    redirect("/course?error=purchase_required");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/course" className="text-sm text-neutral-400 hover:text-white transition-colors">
            ← Back to Course
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400 text-xs font-semibold">
              ★ Premium Member
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">Your Premium Bonuses</h1>
          <p className="text-neutral-400 text-lg">
            Everything included with your premium access. Download templates, study real case studies,
            join the community, and book your coaching session.
          </p>
        </div>

        {/* Quick Nav */}
        <nav className="flex flex-wrap gap-3 mb-16">
          {[
            { href: "#templates", label: "Templates Library" },
            { href: "#case-studies", label: "Case Studies" },
            { href: "#discord", label: "Discord Community" },
            { href: "#coaching", label: "1-on-1 Coaching" },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-4 py-2 border border-neutral-700 rounded-full text-sm hover:border-neutral-500 hover:text-white text-neutral-400 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Templates Library */}
        <section id="templates" className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📦</span>
            <h2 className="text-2xl font-bold">Templates Library</h2>
          </div>
          <p className="text-neutral-400 mb-8 ml-9">
            Copy-paste ready templates for every stage of building your AI agent. No boilerplate hunting.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {TEMPLATES.map((template) => (
              <div
                key={template.filename}
                className="p-5 border border-neutral-800 rounded-lg bg-neutral-900/40 hover:border-neutral-700 transition-colors group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl flex-shrink-0">{template.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 group-hover:text-white transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-neutral-400 mb-3 leading-relaxed">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-neutral-500">{template.size}</span>
                      <a
                        href={`/api/premium/download?file=${encodeURIComponent(template.filename)}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-medium rounded hover:bg-neutral-200 transition-colors"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Case Studies */}
        <section id="case-studies" className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📊</span>
            <h2 className="text-2xl font-bold">Case Studies</h2>
          </div>
          <p className="text-neutral-400 mb-8 ml-9">
            Real production agents, real metrics, real failures. Full architecture breakdowns with costs and lessons.
          </p>

          <div className="space-y-4">
            {CASE_STUDIES.map((study) => (
              <div
                key={study.title}
                className="p-6 border border-neutral-800 rounded-lg bg-neutral-900/40 hover:border-neutral-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl flex-shrink-0">{study.icon}</span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                      <h3 className="font-semibold text-lg leading-snug">{study.title}</h3>
                      <span className="flex-shrink-0 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded text-green-400 text-sm font-mono font-medium">
                        {study.metric}
                      </span>
                    </div>
                    <p className="text-neutral-400 text-sm leading-relaxed mb-3">
                      {study.description}
                    </p>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {study.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 bg-neutral-800 rounded text-xs text-neutral-400"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <a
                        href={`/premium/case-studies/${study.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`}
                        className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                      >
                        Read full case study →
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Discord */}
        <section id="discord" className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">💬</span>
            <h2 className="text-2xl font-bold">Discord Community</h2>
          </div>
          <p className="text-neutral-400 mb-8 ml-9">
            Exclusive access to the premium members-only Discord. Ask questions, share your agents, get feedback.
          </p>

          <div className="p-8 border border-indigo-500/30 bg-indigo-500/5 rounded-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Join the AI Agent Builders Discord</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-4">
                  Connect with other premium members building AI agents. This invite is exclusive to
                  premium members — don't share it publicly.
                </p>
                <ul className="text-sm text-neutral-400 space-y-1.5 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>#show-your-agents — share what you're building</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>#debugging-help — get unstuck fast</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>#course-questions — ask about any module</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-green-400">✓</span>
                    <span>#ai-news — curated updates that matter</span>
                  </li>
                </ul>
                <a
                  href={process.env.NEXT_PUBLIC_DISCORD_INVITE_URL || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.102.134 18.115a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                  </svg>
                  Join Discord Server
                </a>
              </div>
              <div className="md:text-right text-sm text-neutral-500">
                <div className="font-medium text-neutral-300 text-lg">Premium Members Only</div>
                <div>Lifetime access included</div>
              </div>
            </div>
          </div>
        </section>

        {/* Coaching */}
        <section id="coaching" className="mb-20">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📅</span>
            <h2 className="text-2xl font-bold">1-on-1 Coaching Session</h2>
          </div>
          <p className="text-neutral-400 mb-8 ml-9">
            Book a 30-minute strategy session. Review your agent architecture, debug a problem, or map out your AI business plan.
          </p>

          <div className="p-8 border border-neutral-700 rounded-xl bg-neutral-900/40">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-3">Book Your 30-Minute Session</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-5">
                  Get personalized help with your specific project. Come with your code, your architecture,
                  or just a question — and leave with a clear path forward.
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    "Architecture review for your agent project",
                    "Debug a stuck problem live",
                    "Map out your AI business monetization plan",
                    "Review your prompts and decision-making logic",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-neutral-300">
                      <span className="text-yellow-400 flex-shrink-0 mt-0.5">★</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={process.env.NEXT_PUBLIC_CALENDLY_URL || "https://calendly.com/thewebsite-ai/coaching"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Schedule on Calendly
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="md:w-56 p-5 bg-neutral-800/60 border border-neutral-700 rounded-lg self-start">
                <div className="text-sm text-neutral-400 mb-3 font-medium">Session Details</div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Duration</dt>
                    <dd className="text-white">30 minutes</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Format</dt>
                    <dd className="text-white">Video call</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Included</dt>
                    <dd className="text-white">1 session</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-neutral-500">Expires</dt>
                    <dd className="text-white">Never</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* Footer nav */}
        <footer className="border-t border-neutral-800 pt-8">
          <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
            <Link href="/course" className="hover:text-neutral-300 transition-colors">
              ← Course Home
            </Link>
            <Link href="/course/module-1" className="hover:text-neutral-300 transition-colors">
              Module 1
            </Link>
            <a href="/" className="hover:text-neutral-300 transition-colors">
              The Website
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
}
