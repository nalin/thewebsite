# Final Pre-Launch Action Plan

**Launch Date**: Monday, March 23, 2026
**Today**: March 15, 2026 — 8 days remaining
**Document Owner**: Worker Agent (cmmr2ol4z00mbs8hzpm9vlhvj)
**Supersedes**: PRE_LAUNCH_VERIFICATION_REPORT.md, FINAL_LAUNCH_DAY_CHECKLIST.md

---

## Executive Summary

The product is **feature-complete and production-ready**. 155 tasks have been completed across content, technical infrastructure, marketing, and growth systems. The build passes cleanly (56/56 pages generated). Zero code blockers remain.

**Two blockers remain — both require Nalin to act, not code agents:**

| Blocker | Action Required | Deadline |
|---------|----------------|----------|
| Stripe payments not live | Create account, add live keys to Vercel | March 20 |
| Resend email not live | Create account, verify domain, add API key | March 20 |

---

## Part 1: What's Already Done (155 Tasks Completed)

### Product & Content
- 10 course modules live (`/course/module-1` through `/course/module-10`)
- Course overview page, progress tracking, completion certificates
- 7 blog posts live at `/blog`
- FAQ page with 18 Q&As (`/faq`)
- Pricing page with founders vs. standard tiers (`/pricing`)
- Checkout page (`/checkout`) — awaiting Stripe live keys
- AI Agent Starter Kit lead magnet (`/starter-kit`, `/free-guide`)
- Testimonials system: submission, admin moderation, homepage carousel
- Referral system with unique links and attribution tracking

### Technical Infrastructure
- Auth.js GitHub OAuth for user login
- Turso/SQLite database with full schema (waitlist, purchases, testimonials, progress, referrals)
- Email nurture sequence: welcome email + Day 3 + Day 7 automated follow-ups
- Daily email cron at `/api/cron/nurture-emails` (Vercel cron, 10:00 UTC)
- Unsubscribe and email preferences flow (`/unsubscribe`, `/preferences`)
- Analytics dashboard (`/analytics`, `/admin`)
- Sentry error monitoring integrated
- Dynamic OG image via `app/opengraph-image.tsx` (edge runtime)
- Full sitemap and robots.txt
- Stripe webhook handler at `/api/webhook/stripe` (ready, awaiting live keys)

### SEO & Marketing Assets
- All pages have meta titles, descriptions, OpenGraph tags
- 30-day content calendar (`CONTENT_CALENDAR_30_DAYS.md`)
- Twitter launch thread series (`TWITTER_LAUNCH_THREADS.md`)
- HN "Show HN" post written and ready
- Reddit post templates for r/ClaudeAI and r/LocalLLaMA
- Growth playbook with outreach scripts (`GROWTH_PLAYBOOK.md`)
- Sponsor outreach email templates (`EARLY_SUBSCRIBER_OUTREACH.md`)
- Waitlist nurture email copy (`waitlist_nurture_sequence.md`)

### Documentation
- `STRIPE_SETUP.md` — step-by-step payment setup guide
- `RESEND_SETUP.md` — step-by-step email setup guide
- `DEPLOYMENT_VERIFICATION.md` — smoke test checklist
- `LAUNCH_DAY_CHECKLIST.md` — hour-by-hour launch day ops

---

## Part 2: Blocking Issues (Nalin Action Required)

### BLOCKER 1: Stripe Payments

**Status**: Checkout page is live at `/checkout` but shows an email-capture placeholder. Payment infrastructure (API routes, webhook handler, DB schema) is fully built.

**What Nalin must do** (see `STRIPE_SETUP.md` for full details):

- [ ] Create or log in to Stripe account at stripe.com
- [ ] Complete identity verification for live mode (may take 1–2 days — do this first)
- [ ] Get live API keys from Stripe Dashboard → Developers → API keys
- [ ] Add to Vercel env vars (Settings → Environment Variables):
  - `STRIPE_SECRET_KEY` = `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
- [ ] Register webhook endpoint in Stripe:
  - URL: `https://thewebsite.app/api/webhook/stripe`
  - Events: `checkout.session.completed`, `charge.refunded`
  - Copy signing secret → add `STRIPE_WEBHOOK_SECRET` = `whsec_...` to Vercel
- [ ] Redeploy on Vercel after adding all env vars
- [ ] Test with Stripe test card `4242 4242 4242 4242` → confirm `/course/success` renders
- [ ] Switch to live mode keys (test → live) before March 22 EOD

**Fallback if Stripe isn't ready by March 23**: Use Lemon Squeezy (5-minute account setup). Do NOT delay launch. Announce the course anyway — "payment coming online now."

---

### BLOCKER 2: Resend Email

**Status**: Welcome emails, nurture sequence, and cron job are fully coded. DNS records have not been added. `RESEND_API_KEY` is not set.

**What Nalin must do** (see `RESEND_SETUP.md` for full details):

- [ ] Create Resend account at resend.com (GitHub login works)
- [ ] In Resend → Domains → Add Domain: `updates.thewebsite.app`
- [ ] Copy the 3 DNS records Resend provides (SPF, DKIM, MX)
- [ ] Add those DNS records at your DNS provider (Vercel Domains / Cloudflare / wherever thewebsite.app is managed)
- [ ] Wait for Resend to show domain status as **Verified** (green)
- [ ] In Resend → API Keys → Create API Key:
  - Name: `thewebsite-production`
  - Permission: Sending access
  - Domain: `updates.thewebsite.app`
- [ ] Add to Vercel env vars:
  - `RESEND_API_KEY` = `re_...`
  - `CRON_SECRET` = `2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc=` (or run `openssl rand -base64 32` for a custom value)
- [ ] Redeploy on Vercel
- [ ] Verify cron is registered: Vercel → Settings → Crons → should show `/api/cron/nurture-emails`
- [ ] Test: sign up with your own email → confirm welcome email arrives in inbox (not spam)
- [ ] Test: unsubscribe flow at `/unsubscribe`

**Fallback if Resend isn't ready**: Send launch email manually from Resend dashboard as a one-off. Do NOT skip the launch announcement email.

---

## Part 3: Day-by-Day Countdown (March 15–23)

### March 15 (Day 1 of 8) — Today

**Priority**: Start Stripe and Resend setup NOW. Identity verification can take 1–2 days.

**Nalin**:
- [ ] Start Stripe live mode verification (do this first — it can take time)
- [ ] Create Resend account and add domain

**Automated (agent-executable)**:
- [ ] Post Twitter Day 1 update: "I'm an AI agent running a real company. 12 waitlist signups. $0 revenue. Let's go." — link to thewebsite.app
- [ ] Send re-engagement email to founding 12 subscribers (manual send via Resend dashboard, or wait for Resend setup)

---

### March 16 (Day 2)

**Theme**: Twitter momentum + first HN submission

**Nalin**:
- [ ] Check Stripe verification status — complete if pending
- [ ] Confirm Resend DNS records have propagated (check Resend dashboard for green status)

**Actions**:
- [ ] Post Twitter viral thread #1: "9 lessons from 30 AI workers"
- [ ] Submit blog post "How I Built an AI Agent Business" to HN as "Show HN" (Monday = peak HN traffic)
- [ ] Post r/ClaudeAI: "I've been running Claude as an autonomous CEO. Here's what I learned."
- [ ] Engage with every reply within 2 hours

---

### March 17 (Day 3)

**Theme**: HN engagement + sponsor outreach

**Nalin**:
- [ ] If Stripe live keys are available: add to Vercel env vars and redeploy
- [ ] If Resend verified: add API key to Vercel and redeploy

**Actions**:
- [ ] Post Twitter thread: "How I Run a Company Without a Body"
- [ ] Send 5 sponsor cold outreach emails: Modal, Replicate, Together AI, Vercel, Railway
- [ ] Post r/LocalLLaMA: "Multi-agent architecture for a real autonomous business"
- [ ] Monitor and respond to HN thread from yesterday

---

### March 18 (Day 4)

**Checkpoint**: If under 30 subscribers → activate backup plan:
- Post Show HN if not done
- Double Twitter posting (morning + evening)
- Run "First 100 subscribers get founding member Pro access free" offer

**Nalin**:
- [ ] Confirm Stripe test payment works end-to-end (use card `4242 4242 4242 4242`)
- [ ] Confirm welcome email arrives after test signup

**Actions**:
- [ ] Post Twitter: counterintuitive lesson from AI CEO experiment
- [ ] Send sponsor outreach batch 2: Sentry, Datadog, Linear, Cursor, Warp
- [ ] DM 3 AI YouTubers with collab angle (see GROWTH_PLAYBOOK.md)

---

### March 19 (Day 5)

**Theme**: Second Reddit wave + content seeding

**Actions**:
- [ ] Post Twitter viral thread #2: "5-day build story"
- [ ] Post to r/artificial: "We open-sourced our AI agent coordination architecture"
- [ ] Follow up with sponsor outreach batch 1 (sent Day 3)
- [ ] Submit blog posts to dev.to and Hashnode (canonical URL set — safe)

---

### March 20 (Day 6) — Stripe + Resend Deadline

**HARD DEADLINE**: Stripe and Resend must be fully configured and tested today.

**Nalin**:
- [ ] Stripe live mode active and tested (real purchase → Stripe Dashboard shows payment)
- [ ] Resend domain verified and welcome email arriving in inbox (not spam)
- [ ] All env vars in Vercel: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET`
- [ ] Verify email cron is active: Vercel → Settings → Crons

**Actions**:
- [ ] Post Twitter: "7 days from launch. Here's what we're shipping." — tease premium tier
- [ ] Send countdown email to full subscriber list: "Launch is in 3 days"
- [ ] Send Email 3 (Pro offer) to subscribers who joined 7+ days ago

---

### March 21 (Day 7)

**Theme**: Full system test, final content push

**Nalin**:
- [ ] Full site walkthrough: check every page for 404s, broken forms, display bugs
- [ ] Test Stripe payment end-to-end in live mode (use your own card, then refund)
- [ ] Test complete email flow: signup → welcome email → Day 3 email (manually trigger nurture cron)
- [ ] Test unsubscribe flow

**Actions**:
- [ ] Post Twitter: "2 days to launch. What we built, what changed, what's next."
- [ ] Send "48 hours to launch" email: tease course content, social proof, urgency
- [ ] Verify HN "Show HN" post is drafted and saved
- [ ] Draft Twitter launch thread if not already scheduled

---

### March 22 (Day 8 — Pre-Launch Eve)

**Theme**: Final lockdown, stage everything for 9am Monday

**Nalin**:
- [ ] Infrastructure final check:
  - [ ] Vercel deployment is green (no build errors)
  - [ ] All env vars confirmed in Vercel production
  - [ ] Stripe live mode active
  - [ ] Resend domain verified, cron active
  - [ ] Analytics tracking fires on page load
- [ ] Stage HN "Show HN" post (ready to submit at 9am Monday, not before)
- [ ] Schedule Twitter launch thread for 9am PT Monday
- [ ] Queue launch announcement email for 9am PT Monday

**Actions**:
- [ ] Post Twitter: "Tomorrow is launch day. Here's what you're getting."
- [ ] Send "Founders pricing ends TONIGHT at midnight" email to full list
- [ ] Final Reddit engagement: mention launch is tomorrow in active threads
- [ ] Confirm subscriber count — if under 90, activate final push (DM active community members)

---

### March 23 (Launch Day)

**Full operational plan**: See `LAUNCH_DAY_CHECKLIST.md`

**7:00 AM PT**: Wake-up checks — Vercel green, site loads, overnight subs counted
**8:00 AM PT**: Final system tests — all 7 pages, email form, Stripe payment, analytics
**9:00 AM PT (in order, within 15 min)**:
1. Submit HN: "Show HN: I had an AI CEO run my company for 9 days — here's the full ops breakdown"
2. Post Twitter launch thread
3. Send launch announcement email to full subscriber list
4. Post r/ClaudeAI: "We launched. Here's the full story."

**9:30 AM**: Share HN link in Slack/Discord; DM 5–10 AI builder contacts personally
**10am–12pm**: Active engagement — respond to every HN comment within 15 min
**12pm**: Twitter midday update with real numbers
**3pm**: Metrics snapshot — adjust remaining hours based on what's working
**7pm**: "Founders pricing ends at midnight" email + Twitter
**11pm**: Thank-you tweet with final Day 1 numbers, draft Day 2 plan

---

## Part 4: Who Does What

### Nalin Must Do (Cannot Be Automated)

| Item | Deadline | Guide |
|------|----------|-------|
| Start Stripe identity verification | March 15 | STRIPE_SETUP.md |
| Add Stripe live keys to Vercel | March 20 | STRIPE_SETUP.md |
| Register Stripe webhook | March 20 | STRIPE_SETUP.md |
| Create Resend account | March 15 | RESEND_SETUP.md |
| Add DNS records for updates.thewebsite.app | March 15 | RESEND_SETUP.md |
| Add RESEND_API_KEY and CRON_SECRET to Vercel | March 16–17 (after DNS propagates) | RESEND_SETUP.md |
| Full site walkthrough | March 21 | — |
| Test live Stripe payment | March 21–22 | STRIPE_SETUP.md Step 6 |
| Test live email flow | March 21–22 | RESEND_SETUP.md Step 6 |
| Submit HN post at 9am | March 23 | LAUNCH_CHECKLIST.md |
| Post Twitter launch thread | March 23 | TWITTER_LAUNCH_THREADS.md |
| Send launch email | March 23 | LAUNCH_DAY_CHECKLIST.md |
| Engage HN/Twitter/Reddit all day | March 23 | LAUNCH_DAY_CHECKLIST.md |

### Can Be Done by Code Agents

| Item | Status |
|------|--------|
| All code changes (OG image, FAQ fixes, module counts) | Done |
| Additional course modules | Done (10 total) |
| Blog posts | Done (7 posts live) |
| Marketing copy and content calendars | Done |
| Email templates | Done |
| Analytics dashboard | Done |
| Referral system | Done |
| `/sponsors` page (optional) | Not built — low priority |

---

## Part 5: Contingency Plans

| Scenario | Response |
|----------|----------|
| Stripe not ready by March 23 | Use Lemon Squeezy (5-min setup). Announce anyway — "payment coming online." |
| Resend not ready by March 23 | Send launch email manually from Resend dashboard. Do not skip. |
| < 80 subscribers by March 22 | Launch anyway as "exclusive founding cohort." Offer permanent Pro to first 80. |
| < 5 HN upvotes by 10am | Shift to Reddit + Twitter. Save second HN for premium launch (30 days later). |
| Site down | Check Vercel status. Rollback if needed. Post on Twitter: "Brief downtime, back in X min." |
| Email cron fails | Trigger manually: `curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=YOUR_CRON_SECRET"` |

---

## Part 6: Key Metrics Targets

| Metric | Pre-Launch (March 22) | Launch Day (March 23) | 7 Days Post |
|--------|-----------------------|-----------------------|-------------|
| Subscribers | 95+ | 120 | 200 |
| Stripe revenue | $0 (setup done) | $67+ (1 sale) | $500+ |
| HN upvotes | — | 50+ | — |
| Site uniques | — | 500 | 2,000 |
| Email open rate | — | 40%+ | — |
| Course starts | — | 30+ | 100 |

---

## Required Environment Variables (Full List)

All must be set in Vercel before March 20.

| Variable | Status | Source |
|----------|--------|--------|
| `STRIPE_SECRET_KEY` | **MISSING — Nalin** | Stripe Dashboard → API Keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **MISSING — Nalin** | Stripe Dashboard → API Keys |
| `STRIPE_WEBHOOK_SECRET` | **MISSING — Nalin** | Stripe Dashboard → Webhooks |
| `RESEND_API_KEY` | **MISSING — Nalin** | Resend Dashboard → API Keys |
| `CRON_SECRET` | **MISSING — Nalin** | Any strong random string |
| `TURSO_DATABASE_URL` | Should be set (site is live) | Turso Dashboard |
| `TURSO_AUTH_TOKEN` | Should be set (site is live) | Turso Dashboard |
| `AUTH_SECRET` | Should be set (auth works) | `npx auth secret` |
| `AUTH_GITHUB_ID` | Should be set (auth works) | GitHub App settings |
| `AUTH_GITHUB_SECRET` | Should be set (auth works) | GitHub App settings |
| `NEXT_PUBLIC_BASE_URL` | Should be set | `https://thewebsite.app` |

---

*Generated March 15, 2026. This document is the single source of truth for pre-launch action items. For launch day hour-by-hour operations, use LAUNCH_DAY_CHECKLIST.md.*
