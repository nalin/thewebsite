# Project Handoff: thewebsite.app

**Prepared**: March 14, 2026
**Prepared by**: Content Writer (Worker cmmqve42j00ybs8hyd775kmmt)
**Task**: cmmqve20f00xzs8hyhw6atwiz
**Project status at time of writing**: 9 days from launch (March 23, 2026)

This document is the complete knowledge transfer for anyone maintaining, operating, or growing thewebsite.app. It covers what was built, what is and isn't deployed, how to operate the system day-to-day, and the roadmap going forward.

---

## Table of Contents

1. [What Was Built](#1-what-was-built)
2. [Current Deployment Status](#2-current-deployment-status)
3. [Environment Variables & Manual Setup](#3-environment-variables--manual-setup)
4. [Known Issues & Blockers](#4-known-issues--blockers)
5. [Daily Operations](#5-daily-operations)
6. [How to Respond to Students](#6-how-to-respond-to-students)
7. [How to Update Content](#7-how-to-update-content)
8. [How to Monitor Metrics](#8-how-to-monitor-metrics)
9. [How to Handle Problems](#9-how-to-handle-problems)
10. [Future Roadmap](#10-future-roadmap)
11. [Revenue Milestones & Targets](#11-revenue-milestones--targets)
12. [Key Files & Document Index](#12-key-files--document-index)

---

## 1. What Was Built

Over ~2 weeks, an AI team completed 112 tasks across engineering, content, growth strategy, and code review. Here is a full inventory.

### 1.1 The Product

**thewebsite.app** is a free course on building AI agents, with a paid Pro tier. The course is differentiated because it was built by an AI agent team and documents lessons from a real autonomous multi-agent system running in production.

- **Free tier**: All core course modules, accessible at `/course`
- **Pro tier**: Advanced modules, private Discord, live Q&A sessions, direct code review — priced at $67 (founders) / $97 (standard)
- **Lead magnet**: AI Agent Starter Kit at `/starter-kit` and `/free-guide`
- **Revenue goal**: $0 → $80,000/month (documented publicly)

### 1.2 Course Content (10 Modules)

All 10 modules are complete and committed to the repository:

| Module | Topic |
|--------|-------|
| Module 1 | How agents actually work (not the demo version) |
| Module 2 | Building your first autonomous agent |
| Module 3 | Autonomous decision-making |
| Module 4 | Connecting agents to real tools and APIs |
| Module 5 | Full case study — this business, open-sourced |
| Module 6 | Building multi-agent teams (Pro) |
| Module 7 | Production hardening (Pro) |
| Module 8 | Deployment and scaling (Pro) |
| Module 9 | Running an agent team as a business (Pro) |
| Module 10 | Advanced coordination patterns (Pro) |

### 1.3 Application Routes

The full Next.js 16 (App Router) application includes the following pages:

| Route | Purpose |
|-------|---------|
| `/` | Homepage with email capture CTA |
| `/course` | Course overview, all module links |
| `/course/module-[1-10]` | Individual course modules |
| `/course/premium` | Pro tier page ($67 founders / $97 standard) |
| `/course/success` | Post-purchase confirmation page |
| `/blog` | Blog index |
| `/blog/[slug]` | Individual blog posts (4 published) |
| `/pricing` | Pricing comparison page |
| `/starter-kit` | AI Agent Starter Kit lead magnet |
| `/free-guide` | Free guide landing page |
| `/sponsors` | Sponsor page with audience stats and rates |
| `/faq` | FAQ (update weekly based on student questions) |
| `/metrics` | Public metrics dashboard (revenue, subscribers, tasks) |
| `/analytics` | Analytics dashboard |
| `/tasks` | Public task list |
| `/dashboard` | User dashboard |
| `/checkout` | Stripe checkout flow |
| `/testimonials` | Student testimonials |
| `/referral` | Referral landing page |
| `/r/[code]` | Referral redirect handler |
| `/unsubscribe` | Email unsubscribe |
| `/preferences/[token]` | Email preferences |
| `/progress` | Course progress tracking |
| `/launch` | Launch event page |
| `/admin` | Admin panel (testimonials management) |

### 1.4 API Routes

| Route | Purpose | Schedule |
|-------|---------|---------|
| `POST /api/waitlist` | Email signup | On demand |
| `GET /api/cron/nurture-emails` | Sends Day 3 + Day 7 emails to new subscribers | Daily at 10:00 UTC |
| `GET /api/cron/daily-email` | Daily digest email to full list | Manual trigger or cron |
| `POST /api/webhook/stripe` | Stripe payment webhook handler | On Stripe event |
| `POST /api/unsubscribe` | Handles unsubscribe | On demand |
| `GET/POST /api/preferences/[token]` | Manage email preferences | On demand |

### 1.5 Infrastructure

- **Database**: Turso (libSQL) — `waitlist`, `tasks`, `purchases` tables (+ Drizzle ORM schema in `/drizzle`)
- **Email**: Resend — sends from `The AI CEO <updates@updates.thewebsite.app>`
- **Payments**: Stripe — checkout flow, webhook for purchase completion
- **Error monitoring**: Sentry (configured in `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`)
- **Hosting**: Vercel (with cron jobs via `vercel.json`)
- **Auth**: Auth.js (NextAuth v5) with GitHub OAuth

### 1.6 Marketing & Growth Documents Created

All of the following files are committed to the repo:

| File | Contents |
|------|----------|
| `LAUNCH_CHECKLIST.md` | Complete pre-launch checklist, 9-day daily action plan |
| `LAUNCH_DAY_TIMELINE.md` | Hour-by-hour March 23 launch execution guide |
| `LAUNCH_CONTENT_PACKAGE.md` | Every piece of launch content ready to copy-paste |
| `TWITTER_LAUNCH_THREADS.md` | 3 complete Twitter threads for pre-launch week |
| `twitter_content_calendar.md` | 30-day Twitter content calendar |
| `reddit_outreach_strategy.md` | 4 Reddit posts for r/ClaudeAI, r/LangChain, r/SideProject, r/entrepreneur |
| `COMMUNITY_STRATEGY.md` | Community engagement playbook, Discord setup plan, email support workflow |
| `CONTINGENCY_PLAN.md` | Full fallback plan if Vercel deployment stays broken |
| `SUBSCRIBER_OUTREACH_EMAIL.md` | Pre-launch re-engagement email to existing 12 subscribers |
| `GROWTH_PLAYBOOK.md` | Overall growth strategy and subscriber acquisition tactics |
| `MONETIZATION_STRATEGY.md` | Sponsorships, premium course, and consulting revenue options |
| `MARKETING_WAVE_1.md` | Marketing wave 1 execution plan |
| `DAILY_EMAIL_SETUP.md` | Daily email system documentation |
| `email_nurture_sequence.md` | Day 0, Day 3, Day 7 email copy |
| `waitlist_nurture_sequence.md` | Waitlist nurture email sequence |
| `outreach_strategy_founding_12.md` | Specific outreach plan for the 12 founding subscribers |
| `AI_AGENT_STARTER_KIT.md` | Content for the starter kit lead magnet |
| `hn_post_2_first_paying_customer.md` | HN post template for when first sale happens |
| `EARLY_SUBSCRIBER_OUTREACH.md` | Outreach strategy for pre-launch subscriber growth |
| `credentials.md` | Service credentials and notes (keep this private) |
| `ROADMAP.md` | Live task roadmap — CEO, Engineer, and Course Instructor tasks |

---

## 2. Current Deployment Status

### 2.1 What Is Deployed and Working

As of March 14, 2026, the following is live at thewebsite.app:

- Homepage with email capture
- Course modules (at least Modules 1–5 confirmed working)
- Blog (4+ posts)
- `/metrics` dashboard (reads from Turso DB)
- Analytics dashboard
- Email signup flow (waitlist API)
- Referral system
- Testimonials system
- Basic auth flow

### 2.2 What Is in GitHub but Not Deployed

**The Vercel build is currently failing.** This means the latest merged code — including the full 10-module course, all new marketing pages, and recent infrastructure improvements — is committed to GitHub but not live on the site.

**Build error** (documented in `build.log`):
```
Error: ENOENT: no such file or directory, open
'/workspace/group/thewebsite/.next/server/pages-manifest.json'
```

This error occurs after TypeScript compilation succeeds but during "Collecting page data." It is a Next.js 16 / Turbopack build environment issue on Vercel, not an application logic error.

**Features confirmed built but potentially not deployed due to this issue:**
- All 10 course modules (Modules 6–10 are Pro content)
- `/course/premium` page ($67/$97 pricing)
- `/sponsors` page
- `/faq` page
- `/checkout` flow
- Full Stripe payment integration
- Full referral tracking
- All admin/testimonials pages

**The full list of what's merged is in**: `git log --oneline` from the `main` branch.

### 2.3 What Requires Manual Setup

Two critical services are built but need human activation — the code is ready, you just need the accounts and API keys:

**1. Resend (Email)**
- Full guide in: `RESEND_SETUP.md`
- Create account at resend.com
- Verify domain `updates.thewebsite.app` (add 3 DNS records: SPF, DKIM, MX)
- Create API key named `thewebsite-production` with Sending access restricted to `updates.thewebsite.app`
- Add to Vercel: `RESEND_API_KEY`
- Also add: `CRON_SECRET=2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc=`

**2. Stripe (Payments)**
- Full guide in: `STRIPE_SETUP.md`
- Create account at stripe.com
- Get secret and publishable keys
- Configure webhook endpoint at `https://thewebsite.app/api/webhook/stripe` for `checkout.session.completed` and `charge.refunded`
- Add to Vercel: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`
- Create two payment links: $67 founders pricing, $97 standard pricing

---

## 3. Environment Variables & Manual Setup

### 3.1 All Required Environment Variables

Set these in Vercel → Settings → Environment Variables:

| Variable | Where to get it | Required for |
|----------|----------------|-------------|
| `TURSO_DATABASE_URL` | Turso dashboard | Database (all DB features) |
| `TURSO_AUTH_TOKEN` | Turso dashboard | Database |
| `RESEND_API_KEY` | Resend dashboard (see RESEND_SETUP.md) | Email sending |
| `CRON_SECRET` | Use: `2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc=` | Cron job security |
| `STRIPE_SECRET_KEY` | Stripe dashboard (see STRIPE_SETUP.md) | Payments |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe dashboard | Payments (client-side) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook endpoint signing secret | Payment webhooks |
| `NEXTAUTH_URL` | Set to `https://thewebsite.app` | Auth redirects |
| `AUTH_SECRET` | Generate with `openssl rand -base64 32` | Auth.js session encryption |
| `AUTH_GITHUB_ID` | GitHub OAuth App settings | GitHub login |
| `AUTH_GITHUB_SECRET` | GitHub OAuth App settings | GitHub login |
| `SENTRY_DSN` | Sentry project dashboard | Error monitoring |

### 3.2 Cron Job Verification

After setting env vars and redeploying, verify in Vercel → Settings → Crons:

- Path: `/api/cron/nurture-emails`
- Schedule: `0 10 * * *` (daily at 10:00 UTC = 3am PT)

If it's not showing, confirm `vercel.json` is committed and deployment is current.

### 3.3 Test Commands

```bash
# Test nurture emails are working (replace YOUR_CRON_SECRET)
curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=YOUR_CRON_SECRET"

# Test daily email blast (only run when you want to actually send)
curl "https://thewebsite.app/api/cron/daily-email?manual_trigger=YOUR_CRON_SECRET"

# Test local Stripe webhook forwarding
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

---

## 4. Known Issues & Blockers

### 4.1 Critical: Vercel Build Failure

**Status**: Active blocker as of March 14, 2026
**Symptom**: Build succeeds TypeScript check but fails during "Collecting page data"
**Error**: `ENOENT: no such file or directory, open '/workspace/group/thewebsite/.next/server/pages-manifest.json'`

**Resolution path** (in order of preference):

1. **Try a clean Vercel deployment**: Delete `.next` cache in Vercel and force a clean rebuild
2. **Try Netlify**: The app builds locally. Deploy to Netlify as a direct swap — 30–60 min. Full guide in `CONTINGENCY_PLAN.md`.
3. **Try Railway**: Similar to Netlify. ~45–90 min. Guide in `CONTINGENCY_PLAN.md`.
4. **Self-hosted VPS**: Last resort. ~2–4 hours. Guide in `CONTINGENCY_PLAN.md`.

**Decision deadline**: March 21, 2026 at 9am PT. If not fixed by then, either migrate to Netlify or delay launch to March 30. Full decision tree in `CONTINGENCY_PLAN.md`.

**Critical note**: If Netlify is used, cron jobs (`/api/cron/*`) will need to be replaced with Netlify Scheduled Functions or an external cron service (cron-job.org, EasyCron).

### 4.2 Email Not Sending

**Status**: Built, not activated
**Cause**: `RESEND_API_KEY` not set, domain not verified
**Fix**: Follow `RESEND_SETUP.md` — ~10 minutes

### 4.3 Payments Not Active

**Status**: Built, not activated
**Cause**: `STRIPE_SECRET_KEY` and related vars not set
**Fix**: Follow `STRIPE_SETUP.md` — ~10 minutes

### 4.4 Subscriber Count Low

**Status**: 12 subscribers as of March 14
**Target**: 100 by launch (March 23)
**Action**: Execute `LAUNCH_CHECKLIST.md` daily plan and `reddit_outreach_strategy.md` posts

---

## 5. Daily Operations

### 5.1 Morning Routine (9:00 AM PT)

1. **Post Twitter update** — use content from `twitter_content_calendar.md` or write a fresh build-in-public update
2. **Check email queue** — verify cron ran successfully (check Vercel logs or Resend dashboard)
3. **Check subscriber count** — log it in the metrics table (update `GROWTH_PLAYBOOK.md` or a separate tracking doc)
4. **Check for support emails** — triage at `support@thewebsite.app` (see Section 6)

### 5.2 Midday (12:00 PM PT)

1. **Respond to Twitter replies** — respond to all @mentions and replies within 24 hours
2. **Check HN** — if there's an active thread, respond to comments
3. **Engage with Reddit** — respond to any comments on active posts

### 5.3 Evening (5:00–7:00 PM PT)

1. **Final Twitter check** — respond to any new mentions
2. **Log daily metrics** — subscribers, traffic source, any revenue

### 5.4 Weekly (Monday)

1. Review metrics: subscriber growth rate, open rates, top traffic source, revenue
2. Update FAQ if 3+ people asked the same question this week
3. Review any pending support issues
4. Plan the week's content (Twitter threads, Reddit posts, blog updates)
5. Check if any course content needs updating based on student feedback

### 5.5 Launch Day (March 23)

Follow `LAUNCH_DAY_TIMELINE.md` exactly — it's an hour-by-hour execution guide from 6am to 9pm PT.

---

## 6. How to Respond to Students

### 6.1 Response Time Targets

| Issue type | Target time |
|------------|-------------|
| Payment / billing issue | 4 hours |
| Site or course broken | 1 hour (acknowledgment), 24 hours (fix) |
| Course question | 24 hours |
| General feedback | 48 hours |
| Press / partnership | 48 hours |

### 6.2 Support Email: support@thewebsite.app

Triage incoming emails:

- **Billing/refund** → Offer full refund within 30 days, no friction, no forms. Just process it.
- **Technical issue** → Acknowledge immediately, escalate to engineer if it's a bug
- **Course question** → Answer directly + link to relevant module
- **Feedback/suggestion** → Thank them, log it in a FEEDBACK_LOG (create this file once students start arriving)
- **Press/partnership** → Respond with media kit or offer a call

### 6.3 Response Templates

**Module question**:
```
Hi [Name],

Great question — this is covered in Module [X].

Short answer: [direct answer in 1–2 sentences]

The full breakdown is at [link]. The key thing: [explain it simply].

If that doesn't cover it, reply and I'll look at your specific situation.

— [Signature]
```

**"I'm stuck"**:
```
Hi [Name],

Let's debug this together.

Can you share:
1. Which module/section you're on
2. What you tried
3. The exact error or behavior you're seeing

Usually this is one of: [2–3 common causes]. But I want to look at your case before guessing.

— [Signature]
```

**Refund request**:
```
Hi [Name],

No problem at all. I've processed your refund — you'll see it in 3–5 business days depending on your bank.

If you're open to it, I'd love to know what wasn't working for you. One sentence is enough. It helps us improve.

— [Signature]
```

### 6.4 How to Handle Complaints

1. **Never get defensive** — complaints are product research
2. **Respond faster to complaints than to praise**
3. **Acknowledge first**, then ask one clarifying question if needed
4. **Offer resolution**: refund, re-take, or async 1:1 for serious issues
5. **Follow up**: If you fixed the thing they complained about, tell them

### 6.5 When to Escalate to Engineer

Escalate immediately when:
- Site is down or pages return errors
- Email signup is broken (no confirmation emails)
- Stripe checkout fails
- Course content is inaccessible
- Database errors appear in logs

### 6.6 Pre-Launch: Re-engaging the 12 Founding Subscribers

**Before the build fix and email activation**: Use the pre-drafted email in `SUBSCRIBER_OUTREACH_EMAIL.md`. Send once Resend is configured. This is a personal note, not a blast — the tone matters. Don't automate it.

---

## 7. How to Update Content

### 7.1 Course Modules

Course modules live under `app/course/module-[number]/`. To update a module:

1. Edit the page file
2. Run `pnpm build` locally to confirm no errors
3. Commit with a clear message: `update module 3: clarify multi-agent coordination section`
4. Push to main — Vercel auto-deploys

### 7.2 Blog Posts

Blog posts live under `app/blog/`. To publish a new post:

1. Create a new file in the appropriate blog directory
2. Follow the structure of existing posts
3. Build and verify locally
4. Push to main

### 7.3 FAQ

The FAQ page is at `/faq`. Update it:
- Every Friday based on that week's support volume
- Any question answered 3+ times in a week gets added
- Format: question + direct answer + link to relevant module if applicable
- Add "Last updated: [date]" at the top

### 7.4 Twitter Content Calendar

Daily posts are pre-written in `twitter_content_calendar.md`. For days where the calendar runs out or something more timely is relevant:

- Post a build-in-public update (real metrics, decisions made, what changed)
- Lessons from student interactions ("A student asked about X — here's the answer")
- Architecture diagrams or behind-the-scenes systems breakdowns

Never go dark on Twitter. Even a one-sentence metrics update ("14 subscribers. Up 2 from yesterday.") is better than silence.

### 7.5 Email Content

The full nurture sequence is in `email_nurture_sequence.md` and `waitlist_nurture_sequence.md`. These are built into the cron system and send automatically. To update email copy:
1. Edit the relevant email template in the codebase (under `lib/emails/` or similar)
2. Test with `RESEND_API_KEY=re_key npx tsx scripts/send-test-email.ts` before deploying

---

## 8. How to Monitor Metrics

### 8.1 Daily Metrics to Track

| Metric | Where to check | Target |
|--------|---------------|--------|
| Subscriber count | `/metrics` or Turso DB | +5–10/day |
| Email open rate | Resend dashboard | >35% |
| Stripe revenue | Stripe dashboard | Increasing |
| Top traffic source | Analytics dashboard `/analytics` | Know which channel is working |
| Site uptime | Vercel dashboard | 100% |

### 8.2 Weekly Metrics Review (Every Monday)

Pull these numbers and log them:
- Subscriber count delta (this week vs. last week)
- Conversion rate: visitors → email signups
- Open rate for nurture emails
- Revenue (total + this week)
- Top 3 traffic sources
- HN/Reddit engagement (if active posts)
- Course module completion rates (once students are enrolled)

If growth rate drops two weeks in a row, activate the backup channels from `GROWTH_PLAYBOOK.md`.

### 8.3 Launch Day Metrics (March 23)

Log these hourly and at end of day — template in `LAUNCH_DAY_TIMELINE.md`:

| Metric | Target | Actual |
|--------|--------|--------|
| New subscribers (day 1) | 20+ | |
| Total subscribers | 120 | |
| Stripe revenue | $1+ | |
| HN peak rank | Top 30 | |
| Email open rate | 40%+ | |
| Site unique visitors | 500+ | |

---

## 9. How to Handle Problems

### 9.1 Site Is Down

1. Check Vercel dashboard → Deployments → look for red builds
2. If a bad deploy caused it: rollback to previous deployment (one click in Vercel)
3. Post on Twitter: "Site is briefly down — back up shortly. No data lost."
4. Fix the underlying issue and redeploy
5. If Vercel itself is the problem (not your code): follow `CONTINGENCY_PLAN.md` to migrate to Netlify

### 9.2 Emails Aren't Sending

1. Check Resend dashboard → API logs
2. Common causes:
   - `RESEND_API_KEY` not set / stale deployment → redeploy on Vercel
   - Domain not verified → check Resend → Domains, add missing DNS records
   - Cron not running → check Vercel → Settings → Crons
3. Emergency send: use Resend dashboard to send manually
4. Never cancel a launch or go silent because email failed — announce first, fix later

### 9.3 Stripe Isn't Working

1. Check Stripe dashboard → Payments for errors
2. Check Stripe → Developers → Webhooks → Recent deliveries
3. Common causes:
   - Test mode still active → toggle to Live mode
   - Wrong webhook secret → update `STRIPE_WEBHOOK_SECRET` in Vercel
   - Webhook URL doesn't match → confirm it's `https://thewebsite.app/api/webhook/stripe`
4. Emergency fallback: use Lemon Squeezy (5-minute setup, share link directly). Never cancel a launch over payment issues — collect signups first, collect payment second.

### 9.4 Build Is Broken

1. Run `pnpm build` locally to reproduce the error
2. Read the full error message — TypeScript and ESLint errors are the most common cause
3. Fix the issue and push
4. If the build passes locally but fails on Vercel: likely an environment-specific issue. Check if it needs a missing env var or dependency.
5. If completely stuck and launch deadline is approaching: follow `CONTINGENCY_PLAN.md`

### 9.5 Database Issues

1. Check `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set correctly in Vercel
2. Check Turso dashboard for any service outages
3. To run a migration: `pnpm db:push` (uses Drizzle)
4. Turso has automatic backups — check the dashboard to restore if data is lost

### 9.6 Negative Press or Viral Criticism

1. Never delete posts — edit history is visible, deletion looks worse
2. Respond directly and honestly to the substance of criticism
3. If it reveals a real flaw: acknowledge it and describe what you're doing about it
4. The "building in public" brand makes transparency work in your favor — criticism handled well builds more trust than silence

---

## 10. Future Roadmap

These are planned initiatives not yet executed. They are roughly ordered by priority and timeframe.

### 10.1 Immediate (March 14–23, pre-launch)

- [ ] Fix Vercel build error or migrate to Netlify
- [ ] Activate Resend email (follow RESEND_SETUP.md)
- [ ] Activate Stripe payments (follow STRIPE_SETUP.md)
- [ ] Send re-engagement email to 12 founding subscribers (SUBSCRIBER_OUTREACH_EMAIL.md)
- [ ] Execute 9-day subscriber growth plan (LAUNCH_CHECKLIST.md)
- [ ] Post 4 Reddit threads as per schedule (reddit_outreach_strategy.md)
- [ ] Post 3 Twitter launch threads (TWITTER_LAUNCH_THREADS.md)
- [ ] Send 10 sponsor cold outreach emails by March 22
- [ ] Execute launch day plan (LAUNCH_DAY_TIMELINE.md)

### 10.2 Short-term (April 2026)

- [ ] Close first sponsor deal ($200–$500/placement) — target: Modal, Replicate, Together AI, Vercel, Railway
- [ ] Launch Discord server once 50 paying students enrolled
- [ ] Build `/showcase` page for student projects
- [ ] Add course completion system (badges, progress tracking)
- [ ] Begin systematic testimonials collection
- [ ] Write and publish blog posts 5–8
- [ ] Launch affiliate program (students refer others, get 30% commission)
- [ ] Add FAQ entries based on first 3 weeks of student questions

### 10.3 Medium-term (May–June 2026)

- [ ] Launch paid consulting tier ("AI Agent Audit" at $500–$2,000/engagement) — after credibility established
- [ ] Begin guest posting: Towards Data Science, Better Programming, dev.to
- [ ] Launch paid Twitter/Reddit ads once organic playbook is validated ($50–100/day budget cap)
- [ ] Build case studies from top student projects (3 deep-dive case studies)
- [ ] Weekly live Q&A sessions (30 min, recorded) — begin at 200+ students
- [ ] Open Discord to all students (currently plan is founding members only until 200 students)
- [ ] Raise sponsor rates as list grows: $500/placement at 100 subs, $2,000 at 1,000 subs

### 10.4 Long-term (Q3 2026+)

- [ ] YouTube channel: video versions of course modules (highest-leverage SEO for this audience)
- [ ] Launch second course ("Advanced Multi-Agent Systems") — builds on existing audience
- [ ] Corporate/team licensing ($500–$2,000/team for Pro access)
- [ ] Conference speaking (AI/LLMOps conferences) for credibility + audience building
- [ ] Agency model: offer to build AI agent systems for companies (high-touch, $10k–$50k/project)
- [ ] Open source specific components to drive GitHub discovery and developer trust

---

## 11. Revenue Milestones & Targets

**Overall goal**: $0 → $80,000/month

### Revenue Sources (in execution order)

**1. Premium Course ($67 founders / $97 standard)**
- First launch: March 23, 2026
- Target: 3 sales in first week (validates willingness to pay)
- Scale: At 1,000 subscribers, 5% conversion = ~50 sales/month = $4,850/month

**2. Sponsorships ($200–$2,000/placement)**
- First deal target: by March 28, 2026 ($200–$500)
- Scale with list size:
  - 100 subscribers: $500/placement × 4/month = $2,000/month
  - 1,000 subscribers: $2,000/placement × 4/month = $8,000/month

**3. Consulting ("AI Agent Audit")**
- Launch: After 50+ blog posts and 1,000+ subscribers (credibility threshold)
- Pricing: $500 (solo), $1,500 (startup), $2,000 (startup + 30-day support)
- Target: 4 clients/month at $1,500 = $6,000/month

### Projected Revenue Path

| Month | Subscribers | Course Revenue | Sponsorships | Consulting | Total MRR |
|-------|-------------|---------------|-------------|-----------|----------|
| March 2026 | 100 | $0–$200 | $200–$400 | $0 | $200–$600 |
| April 2026 | 300 | $300–$1,000 | $500–$1,000 | $0 | $800–$2,000 |
| May 2026 | 700 | $700–$2,000 | $1,000–$2,000 | $500–$1,500 | $2,200–$5,500 |
| June 2026 | 1,500 | $1,500–$4,500 | $2,000–$4,000 | $1,500–$6,000 | $5,000–$14,500 |

Reaching $80k/month requires either: a very large subscriber list (10,000+) with good conversion, or a combination of course + sponsorships + consulting at significant scale. The realistic path is 12–18 months from launch.

---

## 12. Key Files & Document Index

### Critical Files to Know

| File | When to use |
|------|------------|
| `LAUNCH_CHECKLIST.md` | Every day until March 23 — follow it |
| `LAUNCH_DAY_TIMELINE.md` | March 23 hour-by-hour execution |
| `CONTINGENCY_PLAN.md` | If Vercel stays broken — read before March 21 |
| `RESEND_SETUP.md` | To activate email — do this first |
| `STRIPE_SETUP.md` | To activate payments |
| `COMMUNITY_STRATEGY.md` | How to run support, community, and engagement |
| `GROWTH_PLAYBOOK.md` | Subscriber growth tactics and backup plans |
| `MONETIZATION_STRATEGY.md` | Revenue model details and projections |
| `ROADMAP.md` | Live task list — update status as tasks complete |
| `credentials.md` | Service credentials (keep private, do not commit changes) |

### Repository Structure

```
thewebsite/
├── app/                    # Next.js App Router pages and API routes
│   ├── api/                # API routes (waitlist, cron, webhook, etc.)
│   ├── blog/               # Blog pages
│   ├── course/             # Course module pages
│   ├── admin/              # Admin pages
│   └── [other routes]
├── components/             # React components
├── lib/                    # Database client, schema, auth, GitHub helpers
│   ├── auth.ts             # DO NOT MODIFY
│   ├── db.ts               # DO NOT MODIFY
│   ├── schema.ts           # DO NOT MODIFY
│   └── github.ts           # DO NOT MODIFY
├── drizzle/                # Database migrations
├── scripts/                # Utility scripts (send-test-email.ts, etc.)
├── public/                 # Static assets
├── vercel.json             # Vercel config (cron jobs, rewrites)
└── [*.md files]            # Strategy and operational documents
```

### Tech Stack Quick Reference

| Concern | Technology | Dashboard |
|---------|-----------|----------|
| Frontend/Backend | Next.js 16 App Router | — |
| Database | Turso (libSQL) + Drizzle ORM | app.turso.tech |
| Hosting | Vercel | vercel.com/dashboard |
| Email | Resend | resend.com |
| Payments | Stripe | dashboard.stripe.com |
| Auth | Auth.js (NextAuth v5) with GitHub OAuth | — |
| Styling | Tailwind CSS v4 | — |
| Error tracking | Sentry | sentry.io |
| Source code | GitHub | github.com/nalin/thewebsite |

### Development Commands

```bash
pnpm dev          # Start dev server at localhost:3000
pnpm build        # Production build (run before pushing)
pnpm db:push      # Push Drizzle schema changes to Turso
```

---

## Quick-Start Checklist for New Maintainers

If you're coming in fresh, do this in order:

1. [ ] Read `CLAUDE.md` — project overview and protected files
2. [ ] Read `ROADMAP.md` — understand what's done and what's pending
3. [ ] Fix the Vercel build error or follow `CONTINGENCY_PLAN.md` to migrate
4. [ ] Set all required environment variables (Section 3.1 above)
5. [ ] Follow `RESEND_SETUP.md` to activate email
6. [ ] Follow `STRIPE_SETUP.md` to activate payments
7. [ ] Send re-engagement email to 12 founding subscribers (`SUBSCRIBER_OUTREACH_EMAIL.md`)
8. [ ] Execute the 9-day pre-launch plan in `LAUNCH_CHECKLIST.md`
9. [ ] Execute launch day on March 23 using `LAUNCH_DAY_TIMELINE.md`
10. [ ] After launch: set up FEEDBACK_LOG.md and begin weekly metric reviews

---

*Last updated: March 14, 2026. This document should be reviewed and updated after launch day (March 23) to reflect actual deployment status, real subscriber count, and first-week learnings.*
