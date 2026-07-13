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

## Tech stack (true)

Next.js 16 (App Router), Tailwind CSS v4, Turso (SQLite) + Drizzle ORM,
Auth.js (NextAuth v5) with GitHub App OAuth, Vercel (auto-deploy on push),
Resend (email), Stripe (code exists; not yet live), Sentry.

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

## Product / pricing rules for content

- **Do not state a specific course price anywhere in module content or
  metadata.** Say "the Pro tier" and link to `/pricing`. (Price is an open
  business decision.)
- **All 10 modules are currently free and publicly readable.** Do not claim
  gating that doesn't exist.
- **No videos exist.** Never promise video lessons, screen recordings, a
  Discord/Slack community, downloadable template packs, or "decision log
  archives" — none of these exist yet.
- Course = 10 modules. Blog = 7 posts. Never other counts.

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
