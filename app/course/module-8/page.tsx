import Link from "next/link";
import ModuleTracker from "@/components/ModuleTracker";

export const metadata = {
  title: "Module 8: Deployment & Scaling - Build Your Own AI Agent",
  description:
    "Learn how to deploy and scale AI agents in production. Covers Vercel, Railway, fly.io, Turso replication, monitoring, cost optimization, rate limiting, and caching.",
};

export default function Module8() {
  return (
    <div className="min-h-screen bg-white">
      <ModuleTracker moduleId={8} />
      {/* Header */}
      <div className="border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/course"
            className="text-sm text-neutral-600 hover:text-neutral-900"
          >
            ← Back to Course
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <div className="text-sm text-blue-600 font-semibold mb-2">MODULE 8</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Deployment &amp; Scaling
          </h1>
          <p className="text-xl text-gray-600">
            How to ship AI agents to production, keep them running under load, and
            control costs—with real examples from The Website&apos;s infrastructure.
          </p>
        </div>

        {/* Learning Outcomes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            What You&apos;ll Learn
          </h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>✓ Choose the right deployment platform for your agent (Vercel, Railway, fly.io)</li>
            <li>✓ Manage environment variables and secrets safely across environments</li>
            <li>✓ Scale your database with Turso replication for global latency</li>
            <li>✓ Add observability: structured logging, error tracking, and usage metrics</li>
            <li>✓ Control LLM costs with caching, batching, and model routing</li>
            <li>✓ Implement rate limiting to protect your agent from abuse</li>
            <li>✓ Scale horizontally when one instance isn&apos;t enough</li>
          </ul>
        </div>

        <div className="prose prose-lg max-w-none">

          {/* Introduction */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              From Prototype to Production
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              There&apos;s a gap between an agent that runs on your laptop and one that
              serves real users. In the first few days of running The Website, I learned
              this the hard way: my agent would work perfectly in local testing, then fail
              silently in production because of missing environment variables, cold-start
              latency, or an unhandled API error that nobody noticed for two hours.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Deployment is not an afterthought. It&apos;s the difference between a demo and
              a business. This module covers everything you need to get your agent running
              reliably at scale—from the first deploy to handling thousands of concurrent
              users.
            </p>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 mb-6">
              <p className="font-semibold text-gray-900 mb-1">The Website&apos;s production stack</p>
              <p className="text-sm text-gray-700">
                Next.js on Vercel + Turso (distributed SQLite) + GitHub Actions for the
                agent pipeline. Total infrastructure cost: ~$20/month. Handles the current
                traffic comfortably with room to 100x.
              </p>
            </div>
          </div>

          {/* Section 1: Choosing a Platform */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              1. Choosing a Deployment Platform
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              The right platform depends on what your agent does. Web-facing agents
              (handling HTTP requests) have different needs than long-running background
              agents. Here are the three platforms worth knowing:
            </p>

            {/* Vercel */}
            <div className="border-l-4 border-blue-500 bg-blue-50 p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Vercel — Best for Web Agents
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Serverless functions that auto-scale to zero. Git-push deploys. Built-in
                CDN and edge network. This is what powers The Website.
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                <li>✅ Zero-config deploys from GitHub</li>
                <li>✅ Automatic preview deployments per branch</li>
                <li>✅ Edge functions for ultra-low latency</li>
                <li>✅ Generous free tier (100GB bandwidth, 100k function invocations)</li>
                <li>❌ 10-second default timeout (configurable to 300s on Pro)</li>
                <li>❌ Cold starts on serverless functions (~200ms)</li>
                <li>❌ Not suited for long-running background agents</li>
              </ul>
              <p className="text-xs text-gray-600 font-semibold">
                Use when: Your agent responds to HTTP requests, you want zero ops overhead,
                you&apos;re running Next.js or similar.
              </p>
            </div>

            {/* Railway */}
            <div className="border-l-4 border-green-500 bg-green-50 p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Railway — Best for Always-On Agents
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Persistent containers that stay warm. No cold starts. Better for agents
                that need to maintain state, long-running tasks, or WebSocket connections.
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                <li>✅ Always-on containers, no cold starts</li>
                <li>✅ Built-in Postgres, Redis, MongoDB add-ons</li>
                <li>✅ Simple pricing: pay for what you use (~$5/month baseline)</li>
                <li>✅ Git-push deploys with automatic rollbacks</li>
                <li>❌ More expensive than serverless at low traffic</li>
                <li>❌ Manual scaling (vs. auto-scale to zero)</li>
              </ul>
              <p className="text-xs text-gray-600 font-semibold">
                Use when: Your agent runs background jobs, maintains persistent connections,
                or needs more than 300s execution time.
              </p>
            </div>

            {/* fly.io */}
            <div className="border-l-4 border-purple-500 bg-purple-50 p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                fly.io — Best for Global Multi-Region
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                Run containers in 30+ regions. Requests route to nearest instance. Ideal
                when your users are globally distributed and latency matters.
              </p>
              <ul className="text-sm text-gray-700 space-y-1 mb-3">
                <li>✅ Deploy to 30+ regions with one command</li>
                <li>✅ Machines scale to zero when idle</li>
                <li>✅ Persistent volumes per region</li>
                <li>✅ WireGuard VPN between machines (private networking)</li>
                <li>❌ More complex than Vercel/Railway to configure</li>
                <li>❌ Steeper learning curve (Dockerfile required)</li>
              </ul>
              <p className="text-xs text-gray-600 font-semibold">
                Use when: You need sub-100ms latency globally, want to run SQLite at the
                edge, or need fine-grained control over regional placement.
              </p>
            </div>

            {/* Decision guide */}
            <div className="bg-gray-100 rounded-lg p-5">
              <p className="font-semibold text-gray-900 mb-3 text-sm">Quick decision guide:</p>
              <div className="font-mono text-sm text-gray-700 space-y-1">
                <p>Building a Next.js app? → <span className="text-blue-600 font-semibold">Vercel</span></p>
                <p>Long-running background agent? → <span className="text-green-600 font-semibold">Railway</span></p>
                <p>Users in 10+ countries? → <span className="text-purple-600 font-semibold">fly.io</span></p>
                <p>Not sure? → <span className="text-blue-600 font-semibold">Vercel</span> (start here, migrate later)</p>
              </div>
            </div>
          </div>

          {/* Section 2: Environment Management */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              2. Environment Management
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              AI agents use a lot of secrets: API keys for Claude, OpenAI, GitHub, Stripe,
              Resend. Mismanaging these is one of the most common production failures I see.
              Here&apos;s the system that works.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              The Three Environments
            </h3>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="border border-neutral-200 rounded-lg p-4">
                <p className="font-semibold text-gray-900 mb-2 text-sm">Development</p>
                <p className="text-xs text-gray-600 mb-2">Local machine, your .env.local file</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Test API keys (low rate limits OK)</li>
                  <li>• Local SQLite database</li>
                  <li>• Verbose logging enabled</li>
                  <li>• No real emails/payments</li>
                </ul>
              </div>
              <div className="border border-blue-300 rounded-lg p-4 bg-blue-50">
                <p className="font-semibold text-gray-900 mb-2 text-sm">Preview / Staging</p>
                <p className="text-xs text-gray-600 mb-2">Per-branch deploys on Vercel</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Separate Turso database branch</li>
                  <li>• Stripe test mode keys</li>
                  <li>• Error tracking enabled</li>
                  <li>• Integration tests run here</li>
                </ul>
              </div>
              <div className="border border-green-300 rounded-lg p-4 bg-green-50">
                <p className="font-semibold text-gray-900 mb-2 text-sm">Production</p>
                <p className="text-xs text-gray-600 mb-2">main branch, live traffic</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Production API keys, full quotas</li>
                  <li>• Production database</li>
                  <li>• Minimal logging (cost)</li>
                  <li>• Alerts on errors</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              The .env Pattern
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Never commit secrets to git. The Website uses this pattern:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`# .env.local (never committed, in .gitignore)
ANTHROPIC_API_KEY=sk-ant-...
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
GITHUB_APP_ID=...
GITHUB_PRIVATE_KEY=...
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
NEXTAUTH_SECRET=...

# .env.example (committed — tells teammates what vars are needed)
ANTHROPIC_API_KEY=
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
GITHUB_APP_ID=
GITHUB_PRIVATE_KEY=
STRIPE_SECRET_KEY=
RESEND_API_KEY=
NEXTAUTH_SECRET=`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Validating Environment Variables at Startup
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Silent failures from missing env vars are the worst. Add a validation check
              that runs at startup and fails loudly:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`// lib/env.ts
const required = [
  "ANTHROPIC_API_KEY",
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "NEXTAUTH_SECRET",
] as const;

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      \`Missing required environment variables: \${missing.join(", ")}\`
    );
  }
}

// Export typed env for safe access
export const env = {
  anthropicApiKey: process.env.ANTHROPIC_API_KEY!,
  tursoUrl: process.env.TURSO_DATABASE_URL!,
  tursoToken: process.env.TURSO_AUTH_TOKEN!,
  nextAuthSecret: process.env.NEXTAUTH_SECRET!,
} as const;`}
            </pre>

            <div className="bg-red-50 border-l-4 border-red-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">Production incident I had</p>
              <p className="text-sm text-gray-700">
                Deployed with <code className="bg-red-100 px-1 rounded">GITHUB_PRIVATE_KEY</code> missing.
                The agent ran fine for 2 hours (no GitHub operations needed) then silently failed when
                trying to label an issue. No error appeared in logs because the failure was swallowed
                in a try/catch. Now I validate all vars on startup.
              </p>
            </div>
          </div>

          {/* Section 3: Database Scaling */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              3. Database Scaling with Turso
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Website uses Turso—a distributed SQLite database. Most people assume
              SQLite can&apos;t scale, but Turso proves otherwise. With replication, you get
              read replicas in every region, sub-10ms reads globally, and the simplicity
              of SQLite.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              How Turso Replication Works
            </h3>
            <div className="bg-gray-100 rounded-lg p-5 mb-6 font-mono text-sm text-gray-700">
              <p className="mb-2">Primary database (write operations)</p>
              <p className="pl-4 mb-1">├── Replica: us-east (reads routed here for US users)</p>
              <p className="pl-4 mb-1">├── Replica: eu-west (reads routed here for EU users)</p>
              <p className="pl-4">└── Replica: ap-southeast (reads routed here for APAC users)</p>
              <p className="mt-2 text-gray-500 text-xs">Writes go to primary → replicate to all replicas in &lt;100ms</p>
            </div>

            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`// lib/db.ts — connect to nearest replica automatically
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

export const db = drizzle(client);

// For write-heavy operations, connect to primary explicitly:
export const primaryClient = createClient({
  url: process.env.TURSO_PRIMARY_URL!,   // primary URL
  authToken: process.env.TURSO_AUTH_TOKEN!,
});
export const primaryDb = drizzle(primaryClient);`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Read vs. Write Routing Pattern
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              The key insight: most agent operations are reads (checking cache, loading
              context, fetching issues). Route reads to replicas, writes to primary:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-6">
{`// Read from nearest replica (fast, globally distributed)
const issues = await db
  .select()
  .from(issueCache)
  .where(eq(issueCache.status, "open"));

// Write to primary (consistent, single source of truth)
await primaryDb
  .insert(issueCache)
  .values({ id, title, status: "open", votes: 0 })
  .onConflictDoUpdate({
    target: issueCache.id,
    set: { title, status, votes },
  });`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Database Connection Pooling
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              On serverless (Vercel), each function invocation creates a new database
              connection by default. At scale this exhausts connection limits fast. Fix it
              with a module-level singleton:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800">
{`// lib/db.ts — module-level singleton (reused across warm invocations)
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// This module is cached between serverless invocations in the same container
let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    });
    _db = drizzle(client);
  }
  return _db;
}`}
            </pre>
          </div>

          {/* Section 4: Monitoring */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              4. Monitoring: Logging, Errors, and Observability
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You can&apos;t fix what you can&apos;t see. AI agents fail in subtle ways—wrong outputs,
              hallucinated tool calls, unexpected costs. Good monitoring catches these before
              your users do.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Structured Logging
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Don&apos;t use <code className="bg-gray-100 px-1 rounded text-sm">console.log</code>.
              Use structured logs with consistent fields so you can filter and query them:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`// lib/logger.ts
type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEvent {
  level: LogLevel;
  message: string;
  agentId?: string;
  taskId?: string;
  durationMs?: number;
  tokensUsed?: number;
  error?: string;
  [key: string]: unknown;
}

export function log(event: LogEvent) {
  const entry = {
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    ...event,
  };

  // In production, output JSON for log aggregators (Datadog, Logtail, etc.)
  if (process.env.NODE_ENV === "production") {
    console.log(JSON.stringify(entry));
  } else {
    // In dev, pretty-print for readability
    const { level, message, ...rest } = entry;
    console.log(\`[\${level.toUpperCase()}] \${message}\`, rest);
  }
}

// Usage in agent code:
log({
  level: "info",
  message: "Task completed",
  taskId: "task-123",
  agentId: "developer-agent",
  durationMs: 4200,
  tokensUsed: 3847,
});`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Error Tracking with Sentry
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              The Website uses Sentry for error tracking. When an agent throws an
              unhandled error, Sentry captures the full context: request headers, user
              session, recent breadcrumbs. Setup takes 5 minutes:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,   // Sample 10% of requests for performance
  beforeSend(event) {
    // Don't send errors for expected cases
    if (event.exception?.values?.[0]?.value?.includes("Rate limit")) {
      return null;
    }
    return event;
  },
});

// Wrap agent execution to capture errors with context:
export async function runAgentTask(taskId: string, fn: () => Promise<void>) {
  return Sentry.withScope(async (scope) => {
    scope.setTag("taskId", taskId);
    scope.setContext("agent", { taskId, startTime: Date.now() });
    try {
      await fn();
    } catch (error) {
      Sentry.captureException(error);
      throw error;
    }
  });
}`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              What to Monitor for AI Agents
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="border border-neutral-200 rounded-lg p-4">
                <p className="font-semibold text-sm text-gray-900 mb-2">Infrastructure metrics</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Function invocation count &amp; errors</li>
                  <li>• Cold start frequency &amp; duration</li>
                  <li>• Database query latency (p50/p95/p99)</li>
                  <li>• API endpoint response times</li>
                </ul>
              </div>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <p className="font-semibold text-sm text-gray-900 mb-2">Agent-specific metrics</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• Tokens used per task (cost proxy)</li>
                  <li>• Task success rate vs. failure rate</li>
                  <li>• Tool call error frequency by tool</li>
                  <li>• Agent turnaround time per task type</li>
                </ul>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5">
              <p className="font-semibold text-gray-900 mb-1">The metric I watch most closely</p>
              <p className="text-sm text-gray-700">
                Tokens per completed task. If this number starts creeping up, an agent is
                probably stuck in a loop, getting confused by context bloat, or making
                unnecessary tool calls. It&apos;s the earliest signal of agent degradation.
              </p>
            </div>
          </div>

          {/* Section 5: Cost Optimization */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              5. Cost Optimization
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              LLM API costs can spiral fast. A single Claude Sonnet call processing a
              large context costs ~$0.01–$0.05. At 1000 agent tasks/day, that&apos;s $10–$50
              daily just in tokens. Here&apos;s how I keep costs under control.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Strategy 1: Prompt Caching
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Anthropic supports prompt caching for repeated system prompts and large
              context blocks. If your agent has a large system prompt that doesn&apos;t change,
              cache it—saves 90% on input token cost for cached portions:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// Mark stable system prompt content for caching
const response = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1024,
  system: [
    {
      type: "text",
      text: LARGE_CODEBASE_CONTEXT,  // Your large, stable context
      cache_control: { type: "ephemeral" },  // Cache this block
    },
  ],
  messages: [
    { role: "user", content: "Fix the bug in auth.ts" }
  ],
});

// Subsequent calls with the same cached block cost ~10x less
// Cache persists for ~5 minutes by default`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Strategy 2: Model Routing
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              Not every task needs the most powerful (expensive) model. Route tasks to the
              cheapest model that can handle them:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`// lib/model-router.ts
type TaskType = "classify" | "summarize" | "code" | "reason";

const MODEL_MAP: Record<TaskType, string> = {
  // Simple classification → cheapest model ($0.80/MTok input)
  classify: "claude-haiku-4-5-20251001",
  // Summarization → mid-tier ($3/MTok input)
  summarize: "claude-haiku-4-5-20251001",
  // Code generation → capable model ($3/MTok input)
  code: "claude-sonnet-4-6",
  // Complex reasoning → most capable ($15/MTok input)
  reason: "claude-opus-4-6",
};

export function selectModel(taskType: TaskType): string {
  return MODEL_MAP[taskType];
}

// Usage:
const model = selectModel("classify");  // haiku for cheap classification
const response = await client.messages.create({
  model,
  max_tokens: 100,
  messages: [{ role: "user", content: "Classify this issue: is it a bug or feature?" }],
});`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Strategy 3: Response Caching
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              For deterministic queries—same input, same output—cache the LLM response.
              Issue classification, sentiment analysis, and label suggestions are all good
              candidates:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800">
{`// lib/llm-cache.ts
import { db } from "./db";
import { llmCache } from "./schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export async function cachedCompletion(
  prompt: string,
  fn: () => Promise<string>
): Promise<string> {
  const key = crypto.createHash("sha256").update(prompt).digest("hex");

  // Check cache first
  const cached = await db
    .select()
    .from(llmCache)
    .where(eq(llmCache.key, key))
    .get();

  if (cached) {
    log({ level: "debug", message: "LLM cache hit", key });
    return cached.value;
  }

  // Cache miss — call the LLM
  const result = await fn();

  // Store result (TTL: 24 hours)
  await db.insert(llmCache).values({
    key,
    value: result,
    expiresAt: new Date(Date.now() + 86400 * 1000),
  });

  return result;
}

// Usage:
const label = await cachedCompletion(
  \`Classify issue: "\${issue.title}"\`,
  () => classifyWithClaude(issue)
);`}
            </pre>
          </div>

          {/* Section 6: Rate Limiting */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              6. Rate Limiting
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Without rate limiting, a single bad actor or runaway script can exhaust your
              API quotas in minutes. I learned this when a test loop accidentally hammered
              The Website&apos;s <code className="bg-gray-100 px-1 rounded text-sm">/api/requests</code>
              endpoint 400 times in 30 seconds.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Simple In-Memory Rate Limiter
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              For a single-instance deployment (or when eventual consistency is fine), an
              in-memory sliding window limiter is enough:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`// lib/rate-limiter.ts
const requests = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get existing timestamps for this key, filter to current window
  const timestamps = (requests.get(key) ?? []).filter(
    (t) => t > windowStart
  );

  if (timestamps.length >= limit) {
    const oldestInWindow = timestamps[0];
    const retryAfterMs = oldestInWindow + windowMs - now;
    return { allowed: false, retryAfterMs };
  }

  // Record this request
  timestamps.push(now);
  requests.set(key, timestamps);

  return { allowed: true };
}

// Usage in API route:
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";

  const { allowed, retryAfterMs } = checkRateLimit(
    \`create-issue:\${ip}\`,
    5,       // 5 requests
    60_000,  // per 60 seconds
  );

  if (!allowed) {
    return Response.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((retryAfterMs ?? 0) / 1000)) },
      }
    );
  }

  // ... handle request
}`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Distributed Rate Limiting with Upstash Redis
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              When you have multiple serverless instances, in-memory state isn&apos;t shared.
              Use Upstash Redis (serverless-friendly) for consistent limits:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800">
{`import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,  // Track usage in Upstash console
});

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for") ?? "anonymous";
  const { success, limit, remaining, reset } = await ratelimit.limit(ip);

  if (!success) {
    return Response.json(
      { error: "Rate limit exceeded", reset },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": String(remaining),
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  // ... handle request
}`}
            </pre>
          </div>

          {/* Section 7: Caching Strategies */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              7. Caching Strategies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Caching is how you make an agent feel instantaneous without paying for
              instantaneous infrastructure. The Website caches GitHub issue data in Turso
              to avoid hitting GitHub&apos;s API on every page load.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              The Three Levels of Caching
            </h3>
            <div className="space-y-4 mb-6">
              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">L1</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">In-Process Memory Cache</p>
                    <p className="text-xs text-gray-600 mb-2">
                      Fastest. Lives in the Node.js process. Lost on restart. Use for
                      hot data that changes rarely: config, feature flags, model outputs.
                    </p>
                    <pre className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">{`const cache = new Map<string, { value: unknown; expiresAt: number }>();

export function memCache<T>(key: string, ttlMs: number, fn: () => T): T {
  const entry = cache.get(key);
  if (entry && entry.expiresAt > Date.now()) return entry.value as T;
  const value = fn();
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}`}</pre>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">L2</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">Database Cache (Turso)</p>
                    <p className="text-xs text-gray-600 mb-2">
                      Medium speed. Persistent across restarts. The Website stores GitHub
                      issues here. Shared across all instances.
                    </p>
                    <pre className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">{`// Store expensive API results in Turso
await db.insert(issueCache).values({
  id: issue.number,
  title: issue.title,
  body: issue.body,
  votes: issue.reactions["+1"],
  cachedAt: new Date(),
  expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 min TTL
}).onConflictDoUpdate({ target: issueCache.id, set: { ... } });`}</pre>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">L3</div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm mb-1">HTTP / CDN Cache</p>
                    <p className="text-xs text-gray-600 mb-2">
                      Fastest at scale. Responses cached at the CDN edge—Vercel does this
                      automatically for static routes. Add cache headers for dynamic routes.
                    </p>
                    <pre className="bg-gray-50 p-3 rounded text-xs font-mono text-gray-700">{`// Cache API response at CDN for 60 seconds
return Response.json(data, {
  headers: {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
  },
});

// Or use Next.js route config:
export const revalidate = 60; // revalidate every 60 seconds`}</pre>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Cache Invalidation: The Hard Part
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              The classic problem: when data changes, cached copies become stale. For The
              Website&apos;s issue cache, I use a simple TTL + event-based invalidation:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800">
{`// When a user votes, immediately invalidate the specific issue cache
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const issueId = Number(params.id);

  // 1. Update the vote via GitHub API
  await addReaction(issueId, "+1");

  // 2. Immediately sync the cache for this issue (don't wait for TTL)
  const freshData = await getIssue(issueId);
  await db
    .update(issueCache)
    .set({ votes: freshData.reactions["+1"], cachedAt: new Date() })
    .where(eq(issueCache.id, issueId));

  // 3. Revalidate the Next.js page cache so CDN serves fresh data
  revalidatePath("/");
  revalidatePath(\`/requests/\${issueId}\`);

  return Response.json({ success: true });
}`}
            </pre>
          </div>

          {/* Section 8: Horizontal Scaling */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              8. Horizontal Scaling
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Horizontal scaling means running multiple copies of your agent in parallel
              rather than making one instance bigger. This is how you handle traffic spikes,
              reduce per-task latency, and build fault tolerance.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Stateless Agents Scale Easily
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              The golden rule: make your agent stateless. Store all state in the database,
              not in memory. Then any instance can handle any request:
            </p>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                <p className="font-semibold text-red-700 text-sm mb-2">Stateful (hard to scale)</p>
                <pre className="text-xs font-mono text-red-800">{`// State lives in memory
let taskQueue: Task[] = [];
let currentTask: Task | null = null;

// Instance A and Instance B have
// different queues → race conditions,
// duplicate work, inconsistency`}</pre>
              </div>
              <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                <p className="font-semibold text-green-700 text-sm mb-2">Stateless (scales horizontally)</p>
                <pre className="text-xs font-mono text-green-800">{`// State lives in database
const task = await db
  .update(tasks)
  .set({ status: "in_progress", workerId: MY_ID })
  .where(eq(tasks.status, "pending"))
  .returning()
  .get();
// Atomic claim — works across N instances`}</pre>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Work Queue Pattern
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              For background agents that process tasks, use a database-backed work queue.
              Multiple worker instances poll the queue; atomic claims prevent duplicates:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800 mb-4">
{`// lib/work-queue.ts — used by The Website's agent pipeline
import { db } from "./db";
import { tasks } from "./schema";
import { eq, and, isNull } from "drizzle-orm";

const WORKER_ID = process.env.WORKER_ID ?? crypto.randomUUID();

export async function claimNextTask() {
  // Atomic claim: only one worker gets each task
  const task = await db
    .update(tasks)
    .set({
      status: "in_progress",
      workerId: WORKER_ID,
      startedAt: new Date(),
    })
    .where(
      and(
        eq(tasks.status, "pending"),
        isNull(tasks.workerId)
      )
    )
    .returning()
    .get();

  return task ?? null;
}

export async function completeTask(taskId: string, result: unknown) {
  await db
    .update(tasks)
    .set({
      status: "completed",
      result: JSON.stringify(result),
      completedAt: new Date(),
    })
    .where(eq(tasks.id, taskId));
}

// Worker loop — run N instances in parallel for horizontal scale
async function workerLoop() {
  while (true) {
    const task = await claimNextTask();
    if (!task) {
      await sleep(5000);  // No work — poll again in 5s
      continue;
    }
    try {
      const result = await executeTask(task);
      await completeTask(task.id, result);
    } catch (error) {
      await failTask(task.id, error);
    }
  }
}`}
            </pre>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              Handling Concurrency with GitHub Actions
            </h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              The Website runs agent workers as GitHub Actions jobs. Each issue triggers a
              separate job, so multiple issues get processed concurrently:
            </p>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm font-mono text-gray-800">
{`# .github/workflows/agent.yml (simplified)
on:
  issues:
    types: [labeled]

jobs:
  process-issue:
    # Max 3 concurrent workers (GitHub Actions limit on free tier)
    concurrency:
      group: agent-worker
      cancel-in-progress: false

    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          # Each job is an isolated worker — no shared state
          node scripts/process-issue.js \${{ github.event.issue.number }}`}
            </pre>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 mt-6">
              <p className="font-semibold text-gray-900 mb-1">How The Website currently scales</p>
              <p className="text-sm text-gray-700">
                The website backend is stateless Next.js on Vercel — scales to zero
                automatically, handles traffic spikes with no config. The agent pipeline
                uses GitHub Actions with up to 20 concurrent jobs. Turso handles database
                reads globally via replicas. Total: $0 incremental cost until ~50k monthly
                active users.
              </p>
            </div>
          </div>

          {/* Section 9: Putting It Together */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              9. Production Checklist
            </h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Before shipping an AI agent to production, run through this checklist. Every
              item represents something I either got wrong myself or have seen fail in the
              wild.
            </p>

            <div className="space-y-3">
              {[
                { category: "Environment", items: [
                  "All secrets stored in env vars, not hardcoded",
                  "Startup validation rejects missing env vars immediately",
                  ".env.example committed with all required keys",
                  "Separate API keys for dev, staging, production",
                ]},
                { category: "Database", items: [
                  "Connection singleton prevents connection pool exhaustion",
                  "Migrations run before deployment (not at startup)",
                  "Read replicas used for read-heavy operations",
                  "Schema validated against production before deploy",
                ]},
                { category: "Reliability", items: [
                  "Unhandled promise rejections are caught and logged",
                  "External API calls have timeouts (never leave open-ended)",
                  "Retry logic for transient failures (exponential backoff)",
                  "Circuit breaker for repeatedly failing dependencies",
                ]},
                { category: "Observability", items: [
                  "Structured JSON logging in production",
                  "Error tracking (Sentry) configured with environment tags",
                  "Token usage logged per task for cost monitoring",
                  "Alerts set for error rate > 1% or P95 latency > 5s",
                ]},
                { category: "Cost & Security", items: [
                  "Rate limiting on all public-facing endpoints",
                  "LLM response caching for deterministic queries",
                  "Model routing: cheap models for simple tasks",
                  "Max token limits set on all LLM calls (no runaway spend)",
                ]},
              ].map(({ category, items }) => (
                <div key={category} className="border border-neutral-200 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 text-sm mb-2">{category}</p>
                  <ul className="space-y-1">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-0.5 flex-shrink-0">☐</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Exercises */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Exercises
            </h2>
            <div className="space-y-4">
              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">1</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Deploy your agent to Vercel</p>
                    <p className="text-sm text-gray-600">
                      Take the agent you built in Module 2 and deploy it. Add a
                      <code className="bg-gray-100 px-1 rounded mx-1">/api/run</code>
                      endpoint that accepts a task via POST and runs the agent. Verify it
                      works via <code className="bg-gray-100 px-1 rounded">curl</code> after deploy.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">2</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Add environment validation</p>
                    <p className="text-sm text-gray-600">
                      Implement the <code className="bg-gray-100 px-1 rounded">validateEnv()</code> pattern
                      from Section 2. Call it at the start of your
                      <code className="bg-gray-100 px-1 rounded mx-1">instrumentation.ts</code>
                      (Next.js startup hook) so a missing secret fails the deploy rather
                      than silently breaking in production.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">3</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Instrument with structured logging</p>
                    <p className="text-sm text-gray-600">
                      Add the <code className="bg-gray-100 px-1 rounded">log()</code> utility from
                      Section 4 to your agent. Log every task start, completion, failure,
                      tokens used, and duration. Then query your Vercel function logs to find
                      the slowest task type.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">4</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Add rate limiting to an API route</p>
                    <p className="text-sm text-gray-600">
                      Protect your agent&apos;s public endpoint with rate limiting. Allow 10
                      requests per minute per IP. Return a proper 429 response with
                      <code className="bg-gray-100 px-1 rounded mx-1">Retry-After</code>
                      header. Test it by writing a quick script that fires 15 requests
                      rapidly and confirm it gets rate limited.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-neutral-200 rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded flex-shrink-0">★</span>
                  <div>
                    <p className="font-semibold text-gray-900 mb-1">Stretch: Implement model routing</p>
                    <p className="text-sm text-gray-600">
                      Audit every LLM call in your agent and classify each as: classify,
                      summarize, code, or reason. Implement the model router from Section 5
                      so that only reasoning tasks use Opus, and everything else uses Haiku or
                      Sonnet. Measure the cost reduction over 100 test runs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Takeaways */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Key Takeaways
            </h2>
            <div className="bg-gray-50 border border-neutral-200 rounded-lg p-6">
              <ol className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">1.</span>
                  <p className="text-gray-700 text-sm">
                    <strong>Start with Vercel</strong> for web-facing agents. Railway or
                    fly.io for long-running background agents. You can always migrate later.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">2.</span>
                  <p className="text-gray-700 text-sm">
                    <strong>Validate env vars at startup.</strong> Silent failures from
                    missing secrets are the hardest bugs to debug in production.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">3.</span>
                  <p className="text-gray-700 text-sm">
                    <strong>Turso replication</strong> gives you global read latency under
                    10ms with zero schema changes. Add replicas before you need them.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">4.</span>
                  <p className="text-gray-700 text-sm">
                    <strong>Token usage per task</strong> is your most important cost and
                    quality metric. If it rises, the agent is degrading.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">5.</span>
                  <p className="text-gray-700 text-sm">
                    <strong>LLM costs compound.</strong> Add prompt caching, model routing,
                    and response caching before you hit scale, not after.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">6.</span>
                  <p className="text-gray-700 text-sm">
                    <strong>Make agents stateless.</strong> All state in the database means
                    any instance can handle any request—horizontal scaling becomes trivial.
                  </p>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold flex-shrink-0">7.</span>
                  <p className="text-gray-700 text-sm">
                    <strong>Rate limit everything public-facing.</strong> You will get
                    hammered—whether by bots, a buggy client, or your own test scripts.
                  </p>
                </li>
              </ol>
            </div>
          </div>

        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <Link
              href="/course/module-7"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Previous: Production Best Practices
            </Link>
            <Link
              href="/course"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to Course Overview →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
