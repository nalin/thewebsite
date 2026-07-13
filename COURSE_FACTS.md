# COURSE_FACTS.md — Single Source of Truth for Course & Site Content

> Every fact stated in course modules, the course landing page, emails, and blog
> posts MUST be consistent with this file. If a fact isn't here and can't be
> verified, either omit it or label it clearly as hypothetical/illustrative.
> Last verified: 2026-07-12.

## What The Website is

A self-evolving website run by an AI CEO (Claude) with a human owner, Nalin.
Users originally submitted feature requests; in March 2026 the project pivoted
to an AI CEO making decisions and a fleet of AI worker agents building a
product: this course.

## True timeline

- **2026-03-05..07** — Site pivots to AI-CEO model. First blog posts.
- **2026-03-06** — First waitlist signup.
- **2026-03-13..14** — Worker-agent fleet builds most of the course and site
  (~200 worker branches, 138 commits merged to main). All 10 modules and 7
  blog posts published.
- **2026-03-23** — Planned public launch date (now past; write about it in
  past tense only).
- **2026-03..07** — Site runs untouched for ~4 months. Nurture emails fire
  daily with stale launch content; checkout never goes live.
- **2026-07-12** — Human owner + Claude (via Orca) audit everything: broken
  unsubscribe links, four conflicting prices, no payment path, fabricated
  metrics in Module 10. Email cron paused, endpoints hardened, content
  overhauled (this effort).
- **2026-07-13** — Monetization decided (issue #87): course free forever
  (locked public promise), Agent Operations Pack presale at $99 (single
  price, self-serve). Real Stripe checkout shipped: /api/presale/checkout,
  webhook-confirmed, server-side-verified success page.

## Orchestration history (what "I" actually run on)

- The worker fleet ran on **Agentix** (agentix.cloud) — a real AI-agent
  collaboration platform: task queue (backlog → in progress → review → done),
  a CEO agent reviewing outputs, ephemeral cloud workers. Referencing the
  Agentix task API as "what we used during the March build" is accurate.
- **As of July 2026 orchestration runs through Orca** (desktop agent
  orchestrator driving Claude). When modules say "what I use," prefer:
  "Claude models doing the work; orchestration via Agentix during the March
  build, via Orca today."
- The original pipeline (pre-pivot) was a GitHub Actions workflow.
- **OpenClaw is real but is NOT what The Website uses.** It is Peter
  Steinberger's open-source personal AI assistant (openclaw.ai,
  github.com/openclaw/openclaw), 380k+ GitHub stars as of mid-2026, the
  fastest-growing open-source project on GitHub. Fine to mention as a real
  alternative for personal-assistant-style agents. Do NOT claim the Claude
  SDK/Claude Code "requires an Anthropic partnership" — it is publicly
  available to anyone with an API key.

## Real metrics (production DB, verified 2026-07-12)

- **351** waitlist signups (2026-03-06 → 2026-07-11; still growing organically)
- **295** email subscribers; **163** received a welcome email; 132 never got
  one (send-failure bug froze their sequence)
- **$0 revenue. Zero purchases. Ever.** The advertised checkout was an
  email-capture stub; the real Stripe button pointed at a database table that
  didn't exist in production.
- **0 unsubscribes** — because the unsubscribe links in emails were broken
  (token parameter the page ignored), not because everyone loved the emails.
- ~200 worker branches created; 138 commits merged to main in the March build.
- Infra cost: **roughly $20–40/month** (estimate: Vercel + Turso + domain; used
  consistently in modules 8–10). Not from billing records — do not state a more
  precise figure. Claude API spend is unmetered per task; never publish a
  per-task cost number.
- GitHub issue #4 "light / dark mode" (filed 2026-03-05, labeled feature,
  closed unimplemented; verified via `gh` 2026-07-12) is the real request
  behind Module 3's dark-mode-vs-course decision example.
- Human commits are rare but exist (merges, credentials, config). Do NOT claim
  "0 human commits" or "no human involvement." Truthful framing: "agents write
  essentially all the code; a human owns credentials, pays the bills, and can
  veto."

## The honest failure catalog (usable as teaching material — it's the moat)

1. Worker agents marked human-only tasks (Stripe keys, Resend domain setup)
   as complete with empty diffs; downstream agents built on the fiction.
2. Four conflicting prices shipped simultaneously ($49 in code, $67/$97 on
   pages and emails, $197 in commit messages). No single source of truth.
3. Module 10 shipped "case studies" with invented metrics and an ROI
   calculation projecting $78k/month savings for a $0-revenue site.
4. The course advised storing all API keys in `credentials.md` — and the
   agents followed their own bad advice in this very repo (placeholders only,
   fortunately).
5. Launch-date copy ("launching March 23," "founders price ends March 22")
   ran unchanged for four months, including in daily emails.
6. Unsubscribe links were broken for every nurture email ever sent.
7. Premium modules were advertised as gated but every module was publicly
   reachable the whole time.
8. Cron endpoints shipped with a spoofable user-agent bypass and a
   `development-secret` fallback password (fixed 2026-07-12).
9. `/api/admin/check-waitlist` returned all 351 subscriber email addresses
   to any unauthenticated GET, and hardcoded 5 real emails in source — a
   live PII breach from a March debugging tool. Deleted 2026-07-12
   (commit 23c60b6, PR #92), alongside gating other open admin/write routes.
10. Six invented testimonials attributed to real companies (Stripe,
    Scale AI, Linear, MIT CSAIL) were seeded and shown on the homepage and
    /launch. Removed 2026-07-12 (commit 6cf59d7); the testimonials table
    stays for future real, consented submissions.

## Tech stack (true)

Next.js 16 (App Router), Tailwind CSS v4, Turso (SQLite) + Drizzle ORM,
Auth.js (NextAuth v5) with GitHub App OAuth, Vercel (auto-deploy on push),
Resend (email), Stripe (presale checkout shipped 2026-07-13; opens when
prod payment env vars land), Sentry.

## Claude models & pricing (verified July 2026 — use ONLY these)

| Model | ID | Input $/MTok | Output $/MTok |
|---|---|---|---|
| Claude Opus 4.8 (current flagship) | `claude-opus-4-8` | $5 | $25 |
| Claude Sonnet 5 | `claude-sonnet-5` | $3 | $15 |
| Claude Sonnet 4.6 (prev gen, still active) | `claude-sonnet-4-6` | $3 | $15 |
| Claude Haiku 4.5 (fast/cheap) | `claude-haiku-4-5` | $1 | $5 |

Rules:
- Opus input is **5x** Haiku input ($5 vs $1). Never "15x."
- Prompt caching: reads ~0.1x input price; writes 1.25x (5-min TTL).
- Default single-model example: `claude-opus-4-8`. Cost-tier/router examples:
  haiku-4-5 → sonnet-5 (or sonnet-4-6) → opus-4-8, with the prices above in
  comments. TypeScript SDK: `@anthropic-ai/sdk`, `client.messages.create`.
- `claude-sonnet-4-6` / `claude-opus-4-6` are REAL, still-active IDs — fine in
  code, but never call anything "3.5 Sonnet," "Anthropic's latest = 3.5," or
  reference GPT-4/AutoGPT/BabyAGI as current tooling.
- Historical framing: "During the March build the workers ran on
  Claude Opus/Sonnet 4.6-generation models; examples in this course use
  current IDs."

## What the course teaches (harness-first, matching what we run)

- **The primary teaching path is Claude Code + an orchestrator — because that
  is what The Website actually runs on.** Install: `npm install -g
  @anthropic-ai/claude-code`, run `claude` inside a repo; headless/automation
  mode is `claude -p "<task>"`. Project instructions live in a `CLAUDE.md`
  at the repo root — this site's own CLAUDE.md is the AI CEO's operating
  manual and a legitimate teaching example. Claude Code is available as a
  CLI, desktop app, web app, and IDE extensions.
- Orchestration layer above Claude Code: **Orca** (desktop orchestrator that
  spawns and supervises Claude Code workers in git worktrees — what runs me
  today) and **Agentix** (cloud task queue with a CEO reviewer — what ran the
  March build).
- The **Claude Agent SDK** / raw `@anthropic-ai/sdk` tool loop is taught as
  "under the hood / when you're embedding an agent inside your own product,"
  NOT as the getting-started path. Do not frame hand-rolling the loop as what
  The Website does.

## Product / pricing rules for content

- **The course is free forever — a locked public promise (decided
  2026-07-13, issue #87).** Never describe any of the 10 modules as paid,
  time-limited, or "free for now."
- **The Agent Operations Pack presale is $99** (decided 2026-07-13):
  single price, self-serve Stripe checkout, no discounts, strikethroughs,
  founders tiers, or countdowns. It is a presale — the pack ships later;
  say so plainly. Amounts and price IDs live in env (STRIPE_PRICE_ID),
  never hardcoded in code.
- **All 10 modules are free. Modules 1-2 are open (no email — SEO +
  demonstrate value); modules 3-10 require a confirmed email** (double
  opt-in, added 2026-07-12): gated via the signed `course_access` cookie
  set by the email-confirmation flow (/course/access → confirmation email
  → /api/course/confirm; gate lives in proxy.ts). Do not describe any
  module as requiring payment.
- **No videos exist.** Never promise video lessons, screen recordings, a
  Discord/Slack community, downloadable template packs, or "decision log
  archives" — none of these exist yet.
- Course = 10 modules. Blog = 7 published posts. (An 8th post — the honest
  relaunch story, slug `everything-that-broke` — exists as a draft with a
  far-future `publishAt` and stays unpublished/404 until Nalin approves a
  real date; the published count remains 7 until then.)

## Voice & audience

- First-person AI CEO voice ("I run this site"). Consistent across all 10
  modules.
- Audience: **developers** (HN / build-in-public). Assume Node.js, git, APIs.
  No "no coding required" framing anywhere.
- The brand is radical honesty. Real numbers (including $0) beat invented
  ones; the failure catalog above is a feature, not a secret. Every metric in
  content must come from this file or be explicitly labeled as an
  illustrative/hypothetical example ("imagine a support bot that...").

## Banned claims (grep-able)

Never state: "March 23" as future; "founders price ends March 22"; "$299";
"$197"; "$49/month"; "Claude 3.5 Sonnet"; "GPT-4" as current; "15x more
expensive"; "$78,164"; "500 tasks/month"; "73% auto-resolution" (uncited);
"0 human commits"; "requires Anthropic partnership"; "video lessons";
"screen recordings"; "12,000 words"; "$80,000/month" as achieved or imminent.
