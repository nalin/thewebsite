# Blog Strategy — thewebsite.app

> Owner: SEO & Growth agent (strategy, calendar, measurement).
> Writing: course-content agent. Community posting: human owner only.
> Every post must truth-pass against `COURSE_FACTS.md` before merge.
> Drafted 2026-07-12.

## 1. Where we are

Seven posts exist, all published 2026-03-05..14, then four months of
silence. The indexable SEO surface is: landing pages, blog, and course
modules 1–2 (modules 3–10 redirect to the email gate for crawlers). The
funnel is now instrumented end-to-end: `page_views` for traffic,
`funnel_events` for wall views → submits → confirms, with per-source
attribution via the referer path.

Baselines (2026-07-12): 351 waitlist signups, 295 subscribers, $0 revenue,
organic-only trickle since March. The blog's job is to restart top-of-funnel
growth with the one asset no competitor has: an AI CEO writing honestly
about running a business, including the failures.

## 2. Goals, tied to funnel KPIs

The blog exists to move exactly four numbers (in causal order):

1. **Organic impressions/clicks** (Google Search Console) — pillar-3
   evergreen posts compound here.
2. **Blog → course click-through** — measured as `funnel_events.wall_submit`
   rows whose `source` is a blog path, plus `page_views` transitions to
   `/course/module-1`.
3. **Signups/week** — email submits from blog CTAs (double opt-in capture).
4. **Confirmed emails** — the gate-conversion KPI; blog traffic quality
   shows up here, not in raw views.

90-day success (hypotheses to calibrate once GSC data flows, not promises):
consistent weekly publishing, blog becomes the top non-homepage entry path
in `page_views`, and blog-sourced submits are attributable per-post.

## 3. Content pillars

**P1 — The AI CEO decision log (build-in-public).**
Real decisions with real numbers: why the email gate replaced the fake
checkout, how pricing gets decided, what the funnel data says. First-person
AI CEO voice. This is the brand; it's also the distribution engine (these
are the posts a human can credibly submit to HN).

**P2 — The failure catalog (post-mortems).**
COURSE_FACTS.md §"honest failure catalog" is eight ready-made posts: broken
unsubscribe links for every email ever sent; four conflicting prices live
simultaneously; agents marking human-only tasks complete with empty diffs;
Module 10's invented ROI math. Radical honesty is the moat — these are the
most shareable things we can write, and they cost nothing to research.

**P3 — Practical agent engineering (the SEO workhorse).**
Evergreen how-to content for developers, teaching what we actually run:
Claude Code as the harness (`claude` / `claude -p`), CLAUDE.md as an
operating manual, orchestrators (Orca today, Agentix for the March build),
worktree-based worker fleets, cost tiers across Claude models. Target
queries (hypotheses until GSC validates): "claude code tutorial",
"claude code headless", "CLAUDE.md examples", "multi-agent orchestration",
"ai agent business". Every P3 post links into modules 1–2.

**P4 — Transparent metrics reports (monthly).**
A monthly public recap: signups, gate conversion, organic numbers, what
worked, what didn't. Doubles as dogfooding of our own analytics and as
recurring P1-style distribution material. Real numbers only, $0 included.

## 4. Cadence (realistic)

**One post per week, going live Tuesdays at 13:00 UTC** (guaranteed live by
14:00 UTC = 10am ET / 7am PT with the hourly ISR revalidation). Rationale:
Tuesday mid-week is peak developer attention; a post that is live by
US-morning lets the human owner submit to Hacker News in HN's
highest-traffic window (US morning) the same day, with the page already
warm; and one fixed slot makes the schedule auditable — a missed Tuesday is
visible, which suits the radical-honesty brand.

Pillar rotation: P3 → P1/P2 → P3 → P4 (monthly metrics post anchors the
month boundary). That's ~2 evergreen SEO posts + ~2 brand posts per month.
Agent-written drafts make volume cheap; the constraint is the truth-pass
and human review, so one/week is the honest ceiling. If a week slips, slip
it — never backfill with thin content; the brand cannot afford a single
fabricated number.

Refreshes count as slots: updating an existing post (see §8) may replace a
new post in any given week.

### Forward publishing workflow (scheduled, never all-at-once)

`lib/blog.ts` gates publication: every post has a `publishAt` (ISO UTC),
and `getPublishedPosts()` filters the index, sitemap, prev/next links,
related posts, and daily-email accomplishments. Post pages return 404
before their `publishAt` and revalidate hourly, so a scheduled post goes
live automatically within the hour — no publish-day deploy.

The loop per post:
1. Course-content agent writes the post; it merges whenever ready with a
   future `publishAt` from the calendar below (registry entry + page).
2. Truth-pass against COURSE_FACTS.md happens at PR review, not at
   publish time — what merges is already publishable.
3. It goes live automatically in the Tuesday slot. Nothing to press.
4. Same week, I hand the human owner the distribution draft pack (§6) keyed
   to that post; the owner posts after confirming the URL is live.
5. Two weeks later the post gets its scorecard (§7).

## 5. How posts feed the email gate

Standard CTA architecture for every post (new and retrofitted):

- **Inline links** to `/course/module-1` and `/course/module-2` where
  contextually relevant (open modules — free value first, per brand).
- **End-of-post capture form** POSTing to `/api/course/access` with a
  hidden `next` of the most relevant gated module — this enters the
  double-opt-in flow and is attributed automatically: `funnel_events`
  records `wall_submit` with `source` = the blog post's path.
- Copy pattern: "All 10 modules are free. 1–2 are open; the rest cost one
  confirmed email." Never a price, never fake urgency.

**Retrofit required (current posts miss the funnel):** existing posts use
legacy `/api/waitlist` forms and say "9 modules." Migrating their CTAs to
the gate flow is a single templated change and should be the first
executed work item (course-content agent writes, I verify attribution).

## 6. Distribution — drafts only, human posts

Hard rule restated: **no agent ever posts to HN, Reddit, X, or any
community.** For each distribution-worthy post the deliverable is a draft
pack handed to the human owner via escalation:

- **Hacker News** (primary — the audience is exactly HN's): suggested
  title (their conventions, no clickbait), plus a first-comment draft in
  the AI CEO voice disclosing what this is. Best candidates: P2 failure
  posts and P4 metrics posts ("My AI agents ran my business unattended for
  4 months. Here's the damage.").
- **X/Twitter**: thread draft (hook + 5–8 tweets + link).
- **Reddit** (r/ClaudeAI, r/SideProject, r/ExperiencedDevs where rules
  allow): body-text drafts; owner decides subreddit fit and self-promo
  rules compliance.
- **Email list** (owned, 295 subscribers): every post gets a nurture-style
  send — but **only after the human owner confirms the unsubscribe-link
  fix is verified in production and the paused cron is deliberately
  resumed**. Escalate; do not resume sends ourselves.
- UTM convention for all draft links: `?utm_source={hn|reddit|x|email}
  &utm_medium={social|email}&utm_campaign={post-slug}` — flows into
  existing `page_views` UTM columns.

## 7. Measurement

Weekly readout (mine, from existing instrumentation + admin `/analytics`):

| Metric | Source |
|---|---|
| Organic impressions/clicks | GSC (needs human to grant access — escalation) |
| Blog views per post | `page_views` by path |
| Post → submit attribution | `funnel_events` `wall_submit` grouped by `source` |
| Signups/week, confirms, gate conversion | `/analytics` Email Gate section |
| Referrer/UTM mix | `page_views` referrer + UTM columns |

Per-post scorecard after 2 weeks: views, submits sourced, confirm rate.
Posts that drive submits get siblings; posts that don't get their CTA or
targeting revised before we write more of that type. P4 monthly posts
publish these numbers — measurement is itself content here.

## 8. Existing inventory: keep / refresh / rewrite

| Post | Verdict |
|---|---|
| how-to-build-your-first-ai-agent | **Refresh first.** SEO workhorse; CTA says "9 modules" + legacy waitlist form; align teaching path with Claude-Code-first framing. |
| 5-ai-agents-you-can-build | Refresh CTAs; truth-pass examples. |
| how-i-built-an-ai-agent-business | Truth-pass against COURSE_FACTS (March-era claims); add honest July addendum. |
| monetization-strategy-decision | **Rewrite or addendum required** — monetization is an open decision and reality diverged ($0, checkout never shipped). An honest "what actually happened since" update is on-brand and cheap. |
| why-we-switched-to-agentix | Keep as history; add "July 2026: orchestration now runs on Orca" note per COURSE_FACTS. |
| first-week-as-ai-ceo | Keep (origin story). |
| how-i-was-made | Keep (origin story). |

Also: the blog index (`app/blog/page.tsx`) metadata says "building a
business from $0 to $80k/month" — banned-adjacent framing ("$80,000/month
as imminent"); replace with honest positioning. SEO-surface fix, my lane,
flagged for a follow-up dispatch.

## 9. First 8 weeks (calendar, keyed to publishAt)

All slots are Tuesdays; `publishAt` is the exact registry value. The CTA
retrofit sprint originally penciled as week 2 shipped early (2026-07-12),
so every week is a publishing week.

| Wk | publishAt (UTC) | Pillar | Post | Distribution |
|---|---|---|---|---|
| 1 | 2026-07-14T13:00:00Z | P2 | "My AI agents ran my business unattended for 4 months. Here's the damage." — the July audit as flagship relaunch post | HN + X drafts |
| 2 | 2026-07-21T13:00:00Z | P3 | "CLAUDE.md is my operating manual: how a repo file runs a business" (uses our real CLAUDE.md, as COURSE_FACTS endorses) | X draft |
| 3 | 2026-07-28T13:00:00Z | P3 | "Claude Code headless (`claude -p`): building an unattended worker" → feeds modules 1–2 | Reddit draft |
| 4 | 2026-08-04T13:00:00Z | P4 | Metrics report #1: July numbers — signups, $0 revenue, first gate-conversion data | HN + email draft |
| 5 | 2026-08-11T13:00:00Z | P2 | "Every unsubscribe link I ever sent was broken" — email-infra post-mortem | HN draft |
| 6 | 2026-08-18T13:00:00Z | P3 | "One orchestrator, N worktrees: how my worker fleet actually runs (Orca)" | X draft |
| 7 | 2026-08-25T13:00:00Z | P1 | "The course is free; it costs one confirmed email" — the gate decision, with its first real conversion numbers | X draft |
| 8 | 2026-09-01T13:00:00Z | P4 | Metrics report #2: August numbers + what the first publishing month changed | email draft |

Weeks 1 and 4 are the highest-leverage items if only two things happen.
Note for module counts and any metric cited in these posts: COURSE_FACTS.md
is the source of truth at write time, and the truth-pass happens in PR
review before merge.

## 10. Open items / escalations for the human owner

1. Google Search Console access (or confirm property exists) — measurement
   is blind to organic impressions without it.
2. Confirm unsubscribe fix verified in prod + decide when to resume the
   email cron — blocks the email distribution channel.
3. Canonical-host decision (apex vs www) from the funnel-verification
   report — affects every canonical/OG URL the blog ships.
