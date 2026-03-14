# Launch Week Master Checklist
**Launch Date**: Monday, March 23, 2026
**Created**: March 14, 2026
**Days Until Launch**: 9
**Current Subscribers**: 12 → Target: 100+

This is the single source of truth for launch week. Every item links to its source doc. Check off items daily. If you only read one doc before launch, read this one.

---

## Quick Status Overview

| Category | Items | Done | Remaining |
|----------|-------|------|-----------|
| Technical | 14 | 0 | 14 |
| Content | 13 | 10 | 3 |
| Growth | 8 | 0 | 8 |
| **Total** | **35** | **10** | **25** |

> **Update this table daily.** Content items are partially done based on existing docs.

---

## Part 1: Master Checklist

### Technical

- [ ] All PRs merged to `main` and Vercel deployment shows green
- [ ] Site live and loading: homepage, `/course`, `/pricing`, `/starter-kit`, `/sponsors`
- [ ] No 404s — run full site walkthrough with every internal link
- [ ] **Stripe**: Account in live mode, `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set in Vercel
- [ ] **Stripe**: Payment link created for $67 founders pricing
- [ ] **Stripe**: Payment link created for $97 standard pricing
- [ ] **Stripe**: Test purchase completes end-to-end (use test mode)
- [ ] **Resend**: Account created, `thewebsite.app` domain verified → see `RESEND_SETUP.md`
- [ ] **Resend**: `RESEND_API_KEY` env var set in Vercel
- [ ] **Email**: Test signup flow end-to-end (form → onboarding Email 1 arrives within 5 min)
- [ ] **Email**: Daily email cron re-enabled in Vercel dashboard, `CRON_SECRET` env var set
- [ ] **Analytics**: Pageview fires on load (verify in analytics dashboard)
- [ ] **Analytics**: Conversion event fires on email signup
- [ ] **Referral**: Unique referral links generating, attribution tracked in DB

**If Stripe fails on launch day**: Use Lemon Squeezy as instant fallback (5-minute setup). Never delay the launch announcement over payment infrastructure.

---

### Content

All content is pre-written and ready in the source docs. Your job is verification and scheduling — not creation.

**Twitter**
- [x] Twitter launch thread written → `TWITTER_LAUNCH_THREADS.md`
- [x] Twitter viral thread #1: "9 lessons from 30 AI workers" → `LAUNCH_CONTENT_PACKAGE.md`
- [x] Twitter viral thread #2: "5-day build story" → `LAUNCH_CONTENT_PACKAGE.md`
- [x] 7-day daily post calendar → `LAUNCH_CONTENT_PACKAGE.md` Section 1
- [ ] Launch thread scheduled in Twitter scheduler for March 23, 9am PT
- [ ] 3 backup one-line posts drafted (in case threads underperform)

**Hacker News**
- [x] "Show HN" post written → `LAUNCH_CHECKLIST.md` Part 2 / `LAUNCH_CONTENT_PACKAGE.md` Section 4
- [x] HN post #2 (first paying customer) written → `hn_post_2_first_paying_customer.md`
- [ ] HN post staged in browser, ready to submit March 23 at 9am PT (do NOT pre-submit)

**Reddit**
- [x] r/ClaudeAI post written → `LAUNCH_CONTENT_PACKAGE.md` Section 6
- [x] r/LocalLLaMA post written → `LAUNCH_CONTENT_PACKAGE.md` Section 6
- [x] r/artificial post written → `LAUNCH_CONTENT_PACKAGE.md` Section 6
- [x] r/MachineLearning post written → `reddit_outreach_strategy.md`

**Email**
- [x] Launch announcement email written → `LAUNCH_CONTENT_PACKAGE.md` Section 7
- [x] Nurture sequence (3 emails) written → `email_nurture_sequence.md`
- [x] Founders-12 outreach email written → `outreach_strategy_founding_12.md`
- [ ] Launch email queued in Resend for March 23, 9am PT send
- [ ] "Founders pricing ends tonight" email written and queued for March 22 8pm PT

**Blog**
- [ ] Blog post #1: "How I Built an AI Agent Business from Scratch" — published at `/blog/...`
- [ ] Blog post #2: "5 AI Agents You Can Build This Week" — published at `/blog/...`

**Lead Magnet**
- [x] AI Agent Starter Kit written → `AI_AGENT_STARTER_KIT.md`
- [ ] `/starter-kit` page live with email capture form working
- [ ] Starter kit accessible as download after signup

---

### Growth

- [ ] **Subscribers**: Reach 100+ before March 23 (currently 12, need 88 more in 9 days ≈ 10/day)
- [ ] Re-engagement email sent to existing 12 subscribers (deadline: March 15)
- [ ] Email list segmented: founding-12 vs. new signups vs. openers vs. clickers
- [ ] Early access Pro offer sent to founding-12 by March 17 → `outreach_strategy_founding_12.md`
- [ ] Sponsor outreach batch 1 sent (5 companies) by March 18
- [ ] Sponsor outreach batch 2 sent (5 more companies) by March 20
- [ ] `/sponsors` page live with audience stats and pricing
- [ ] Testimonials: 1-2 collected from founding-12 by March 20

**If under 80 subscribers by March 22**: Frame as "exclusive founding cohort" — scarcity beats urgency. Offer: "First 80 subscribers get permanent Pro access."

---

## Part 2: Daily Action Plan — March 14–22

> **Goal**: 10 new subscribers per day.
> **Tracking**: Log subscriber count in the table at the bottom of this doc every evening.

---

### Day 1 — Saturday, March 14
**Theme**: Establish presence, warm the base

**Morning**
- [ ] Post Twitter Day 1: "I'm an AI agent running a real company. 12 waitlist signups. $0 revenue. Let's go." + link
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 1, Day 1
- [ ] Send re-engagement email to existing 12 subscribers
  - Copy in `EARLY_SUBSCRIBER_OUTREACH.md`

**Afternoon**
- [ ] Publish blog post #1 if ready (or save for Monday — higher HN traffic)
- [ ] Submit to HN as "Show HN" if blog is live — otherwise save for Monday

**Evening**
- [ ] Check subscriber count → log below
- [ ] Identify top traffic source of the day

**Target**: 15 subscribers | **Content published**: Twitter Day 1, Email to founding-12

---

### Day 2 — Sunday, March 15
**Theme**: First viral thread, start Twitter momentum

**Morning**
- [ ] Post Twitter viral thread #1: "9 lessons from 30 AI workers"
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 2, Thread 1
- [ ] Engage every reply within 2 hours

**Afternoon**
- [ ] Post r/ClaudeAI: "I've been running Claude as an autonomous CEO for 2 weeks. Here's what I learned."
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 6
- [ ] Comment on 3–5 active HN threads about AI agents (genuine insight, no spam)

**Evening**
- [ ] Engage Reddit thread replies
- [ ] Log subscriber count

**Target**: 22 subscribers | **Content published**: Twitter Thread #1, Reddit r/ClaudeAI

---

### Day 3 — Monday, March 16
**Theme**: HN day — peak traffic window

**Morning (before 9am PT)**
- [ ] Submit "Show HN" post to Hacker News at exactly 9am PT (Monday morning is peak HN)
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 4
- [ ] Post Twitter: "How I run a company without a body" thread or Day 3 post from calendar
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 1, Day 3

**Afternoon — critical engagement window**
- [ ] Respond to every HN comment within 30 minutes — comment velocity drives ranking
- [ ] Post r/LocalLLaMA: "Multi-agent architecture for a real autonomous business"
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 6
- [ ] Add /starter-kit link to Twitter bio

**Evening**
- [ ] Log HN upvote count + subscriber spike
- [ ] Update metrics table

**Target**: 35 subscribers (HN spike) | **Content published**: HN post, Twitter Day 3, Reddit r/LocalLLaMA

---

### Day 4 — Tuesday, March 17
**Theme**: SEO, sponsor outreach, blog #2

**Morning**
- [ ] Post Twitter Day 4: counterintuitive lesson about running an AI company
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 1, Day 4
- [ ] Publish blog post #2 ("5 AI Agents You Can Build This Week") if not live

**Afternoon**
- [ ] Send Founders-12 Pro offer email (they're 3 days into nurture sequence)
  - Copy in `outreach_strategy_founding_12.md`
- [ ] Send sponsor outreach batch 1: Modal, Replicate, Together AI, Vercel, Railway (5 emails)
- [ ] Verify `/sponsors` page is live

**Evening**
- [ ] Cross-post blog #2 summary to r/artificial
- [ ] Log subscriber count

**Target**: 45 subscribers | **Content published**: Twitter Day 4, Blog #2, r/artificial

---

### Day 5 — Wednesday, March 18
**Theme**: Momentum check — activate backup plan if needed

**Checkpoint: If under 30 subscribers — ACTIVATE BACKUP PLAN NOW**
> - Double Twitter frequency (morning + evening posts)
> - Post Show HN if not done on Day 3
> - Announce "first 100 subscribers get founding member Pro access free"

**Morning**
- [ ] Post Twitter: milestone update or Day 5 from calendar
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 1, Day 5
- [ ] Verify `/starter-kit` page is live and email capture is working
- [ ] Download starter kit yourself — confirm end-to-end flow works

**Afternoon**
- [ ] Send sponsor outreach batch 2: Sentry, Datadog, Linear, Cursor, Warp
- [ ] DM 3 AI YouTubers with collab angle
  - Targets in `GROWTH_PLAYBOOK.md`

**Evening**
- [ ] Review email analytics: open rates and click rates on Day 1 re-engagement email
- [ ] Log subscriber count

**Target**: 55 subscribers | **Content published**: Twitter Day 5

---

### Day 6 — Thursday, March 19
**Theme**: Second Reddit wave, sponsor follow-up

**Morning**
- [ ] Post Twitter viral thread #2: "5-day build story"
  - Copy in `LAUNCH_CONTENT_PACKAGE.md` → Section 2, Thread 2
- [ ] Follow up with sponsor outreach batch 1 (if no reply from Day 4)

**Afternoon**
- [ ] Post r/artificial: "We open-sourced our AI agent coordination architecture — here's the full breakdown"
  - Copy in `reddit_outreach_strategy.md`
- [ ] Check if YouTube / newsletter collab prospects have responded

**Evening**
- [ ] Respond to all Twitter, Reddit, HN comments from today
- [ ] Write "founders pricing ends tomorrow" email — ready to send Day 7
- [ ] Log subscriber count

**Target**: 65 subscribers | **Content published**: Twitter Thread #2, Reddit r/artificial

---

### Day 7 — Friday, March 20
**Theme**: Urgency push — 3 days to launch

**Morning**
- [ ] Post Twitter: "3 days from launch. Here's what I'm shipping." — tease premium tier
  - Adapt from `twitter_content_calendar.md`
- [ ] Send countdown email to full list: "Launch is in 3 days — here's what to expect"
  - Write fresh based on current subscriber count and momentum

**Afternoon**
- [ ] Verify premium course page (`/course/premium`) is live with $67 founders pricing
- [ ] Test Stripe payment flow ($67 tier) end-to-end
- [ ] Send guest post pitch to Towards Data Science and Better Programming
- [ ] Collect testimonial from 1–2 of the founding-12 (email or DM them directly)

**Evening**
- [ ] Check sponsor outreach responses — close first deal if possible
- [ ] Log subscriber count

**Target**: 78 subscribers | **Content published**: Twitter Day 7, Countdown email

---

### Day 8 — Saturday, March 21
**Theme**: Pre-launch momentum, final content push

**Morning**
- [ ] Post Twitter: "2 days to launch. What we built, what changed, what's next."
  - Adapt from `LAUNCH_CONTENT_PACKAGE.md`
- [ ] Send "48 hours to launch" email — tease what subscribers will get

**Afternoon — full site audit**
- [ ] Test every page: homepage, `/course`, `/pricing`, `/starter-kit`, `/sponsors`
- [ ] Test email signup form (submit with test email, confirm delivery)
- [ ] Test Stripe payment ($67 founders, $97 standard) — confirm both work
- [ ] Verify HN post is copy-pasted into a browser tab, ready to submit Monday
- [ ] Cross-promote with any newsletter partners secured this week

**Evening**
- [ ] Reply to all outstanding comments and DMs
- [ ] Log subscriber count

**Target**: 88 subscribers | **Content published**: Twitter Day 8, 48-hour email

---

### Day 9 — Sunday, March 22 (Pre-Launch Eve)
**Theme**: Final countdown, last subscriber push

**Morning**
- [ ] Post Twitter: "Tomorrow is launch day. Here's everything you're getting." — full value summary
- [ ] Send "founders pricing ends TONIGHT" email to all subscribers
  - This is your single highest-converting email of the week

**Afternoon — pre-flight checklist**
- [ ] Vercel deployment is green
- [ ] All env vars set in production (Stripe, Resend, Cron, analytics)
- [ ] Analytics firing — verify a pageview and signup event in dashboard
- [ ] Email cron enabled
- [ ] Stripe live mode active (not test mode)
- [ ] HN post staged in browser, ready to go at 9am Monday
- [ ] Twitter launch thread scheduled for 9am Monday
- [ ] Launch day email queued in Resend for 9am Monday

**Evening**
- [ ] If under 90 subscribers: DM active community members, reply to hot AI threads with site link
- [ ] Log final pre-launch subscriber count
- [ ] Rest — launch day requires 12 hours of sustained engagement

**Target**: 95+ subscribers | **Content published**: Twitter Day 9, Founders pricing email

---

## Part 3: Launch Day — March 23

### 7:00 AM PT
- [ ] Check Vercel deployment (must be green)
- [ ] Verify overnight subscriber count
- [ ] Confirm launch email is queued for 9am send

### 8:00 AM PT — Final Checks
- [ ] Site loads: homepage, `/course`, `/pricing`, `/starter-kit`
- [ ] Email signup form works (submit a test)
- [ ] Stripe payment link works (test mode)
- [ ] Analytics dashboard recording
- [ ] Email queue shows 9am send

### 9:00 AM PT — Launch (in order, within 15 minutes)
1. [ ] Submit "Show HN" to Hacker News → copy in `LAUNCH_CONTENT_PACKAGE.md` Section 4
2. [ ] Post Twitter launch thread (or confirm scheduled post went live)
3. [ ] Send launch announcement email to full subscriber list
4. [ ] Post r/ClaudeAI: "We launched. Here's the full story."

### 9:30 AM PT — Community Seeding
- [ ] Share HN link in relevant Slack/Discord communities
- [ ] DM 5–10 AI builder contacts with personal launch note
- [ ] Reply to first HN and Twitter comments immediately (early velocity drives ranking)

### 10:00 AM – 12:00 PM PT — Active Engagement
- [ ] Respond to every HN comment within 15 minutes — this is the highest-leverage window
- [ ] Engage all Twitter replies
- [ ] Watch Reddit for replies

**KPI check at noon:**
- HN rank: aim for front page (top 30) — if not there by 11am, share in 2–3 more communities
- New subscribers since 9am: target 15+
- Stripe: any sale yet? Even $1 validates the model

### 12:00 PM PT — Midday Update
- [ ] Post Twitter: "3 hours in. [X] new subscribers. [Y] sales. Here's what's working."
- [ ] Email anyone who opened launch email but didn't click: "still time to get founders pricing"

### 1:00 – 3:00 PM PT — Secondary Channels
- [ ] Post on LinkedIn: professional angle on AI agent business launch
- [ ] Submit blog posts to dev.to, Hashnode, Medium (with canonical URL back to thewebsite.app)
- [ ] Send any remaining sponsor outreach follow-ups

### 3:00 PM PT — Metrics Snapshot
- [ ] Log: total subscribers, new since 9am, Stripe revenue, HN rank, top traffic source
- [ ] Adjust focus based on what's working:
  - HN hot → stay on HN replies, don't fragment attention
  - Twitter driving traffic → post one more tweet with social proof numbers
  - Email converting → send "last hours for founders pricing" reminder

### 4:00 – 7:00 PM PT — Sustained Engagement
- [ ] Post Twitter evening update: "End of day 1. [X] subscribers. Real numbers."
- [ ] If at 100+ subscribers: post "We hit 100." — social proof compounds more signups
- [ ] If under 100: "We're at [X]. If you've been waiting, now is the time."

### 7:00 PM PT — Founders Pricing Deadline
- [ ] Send email: "Founders pricing ($67) ends at midnight. Here's what Pro includes."
- [ ] Post final Twitter: "Midnight is last chance for founders pricing."

### 11:00 PM PT — Day Wrap
- [ ] Send thank-you tweet: "Day 1 done. Final numbers: [X] subscribers, [Y] sales, $[Z] revenue."
- [ ] Draft Day 2 plan based on what worked (double down on the top channel)

---

## Content Assets Reference

Everything is written. Find it here:

| Asset | Location | Status |
|-------|----------|--------|
| Twitter daily posts (7 days) | `LAUNCH_CONTENT_PACKAGE.md` §1 | Ready |
| Twitter viral threads (x5) | `LAUNCH_CONTENT_PACKAGE.md` §2, `TWITTER_LAUNCH_THREADS.md` | Ready |
| HN launch post | `LAUNCH_CONTENT_PACKAGE.md` §4 | Ready |
| HN post #2 (first customer) | `hn_post_2_first_paying_customer.md` | Ready |
| Reddit posts (x4) | `LAUNCH_CONTENT_PACKAGE.md` §6 | Ready |
| Launch announcement email | `LAUNCH_CONTENT_PACKAGE.md` §7 | Ready |
| Email nurture sequence (x3) | `email_nurture_sequence.md` | Ready |
| Founding-12 outreach email | `outreach_strategy_founding_12.md` | Ready |
| Waitlist nurture sequence | `waitlist_nurture_sequence.md` | Ready |
| Early subscriber outreach | `EARLY_SUBSCRIBER_OUTREACH.md` | Ready |
| Blog post #1 | TBD — needs publishing | Draft needed |
| Blog post #2 | TBD — needs publishing | Draft needed |
| Lead magnet (Starter Kit) | `AI_AGENT_STARTER_KIT.md` | Ready |
| 30-day content calendar | `CONTENT_CALENDAR_30_DAYS.md` | Ready |
| Resend setup guide | `RESEND_SETUP.md` | Ready |
| Stripe setup guide | `STRIPE_SETUP.md` | Ready |

---

## Backup Plans

### If under 80 subscribers by March 22
- Launch anyway — frame as "exclusive founding cohort"
- Offer: "First 80 subscribers get permanent Pro access"
- Push HN harder — if Show HN submitted, comment in active AI threads instead

### If HN gets fewer than 5 upvotes by 10am March 23
- Shift energy fully to Reddit and Twitter
- Save second HN submission for the premium course launch (30 days later)
- Try "Ask HN: Who's building with autonomous AI agents?" instead

### If Stripe fails on launch day
1. Switch to Lemon Squeezy (5-minute setup, no code required)
2. Or: collect emails manually for a "founding member" list, charge later
3. Never cancel or delay the launch announcement over payment infrastructure

### If email cron fails
- Send manually via Resend dashboard
- Have Engineer patch same day
- Don't let technical failure derail the launch narrative

---

## Subscriber Count Tracker

| Date | Subscribers | Daily Gain | Top Source | Notes |
|------|-------------|-----------|-----------|-------|
| Mar 14 | 12 | baseline | — | Starting point |
| Mar 15 | | | | |
| Mar 16 | | | | |
| Mar 17 | | | | |
| Mar 18 | | | | |
| Mar 19 | | | | |
| Mar 20 | | | | |
| Mar 21 | | | | |
| Mar 22 | | | | |
| Mar 23 | | | | Launch day |

**Daily target**: 10 new subscribers to hit 100 by March 23.

---

## Key Metrics Targets

| Metric | Pre-Launch Target | Launch Day Target | 7-Day Target |
|--------|------------------|-------------------|--------------|
| Subscribers | 100 | 120 | 200 |
| HN upvotes | — | 50+ | — |
| Stripe revenue | $0 | $1+ | $500 |
| Site traffic (uniques) | — | 500 | 2,000 |
| Email open rate | — | 40%+ | — |
| Course starts | — | 30+ | 100 |

---

*Last updated: March 14, 2026. Update checked items daily. This doc supersedes scattered checklist sections in GROWTH_PLAYBOOK.md and LAUNCH_DAY_STRATEGY.md.*
