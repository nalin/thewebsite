# Launch Checklist & Final Prep Plan

**Launch Date**: Monday, March 23, 2026
**Author**: Growth Strategist
**Created**: March 14, 2026
**Status**: Executing — 9 days to launch

---

## Part 1: Master Launch Checklist

### Infrastructure & Technical

- [ ] All PRs merged to `main`
- [ ] Site deployed and working (verify at thewebsite.app)
- [ ] Vercel deployment shows green (no build errors)
- [ ] Stripe account created and in live mode
- [ ] Stripe API keys added to Vercel env vars (`STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`)
- [ ] Stripe payment link created for $67 founders pricing
- [ ] Stripe payment link created for $97 standard pricing
- [ ] Resend account created and domain `thewebsite.app` verified
- [ ] Resend API key added to Vercel env vars (`RESEND_API_KEY`)
- [ ] Daily email cron re-enabled (verify in Vercel dashboard)
- [ ] Email cron secret set (`CRON_SECRET` env var)
- [ ] Analytics tracking working (verify pageview fires on load)
- [ ] Conversion event fires on email signup
- [ ] Referral system live (unique referral links, attribution tracking)
- [ ] Source tracking on signups (utm_source / referrer captured in DB)

### Product & Content

- [ ] All 5 course modules accessible and rendering correctly
- [ ] `/course` overview page updated (any new modules or premium teaser added)
- [ ] Premium tier page (`/course/premium`) built with $67 founders pricing
- [ ] `/starter-kit` lead magnet page live with email capture
- [ ] `/sponsors` page live with audience stats and pricing
- [ ] Pricing page live at `/pricing`
- [ ] Blog post: "How I Built an AI Agent Business from Scratch" published
- [ ] Blog post: "5 AI Agents You Can Build This Week" published
- [ ] Lead magnet available for download (prompt library, architecture template, checklist)
- [ ] Unsubscribe flow working (test with test email)
- [ ] All internal links working (no 404s)

### Email & Communications

- [ ] 100+ subscribers confirmed in database
- [ ] Launch announcement email written and reviewed
- [ ] Early bird email written ("founders pricing ends tonight — March 22")
- [ ] Re-engagement email sent to existing 12 subscribers (by March 15)
- [ ] Nurture sequence Email 1 triggering on new signups
- [ ] Nurture sequence Email 2 queued (Day 3 after signup)
- [ ] Nurture sequence Email 3 queued (Day 7 — Pro offer)

### Marketing Content (Pre-Built, Ready to Publish)

- [ ] HN "Show HN" post written and reviewed (see template below)
- [ ] Reddit post for r/ClaudeAI written (see GROWTH_PLAYBOOK.md)
- [ ] Reddit post for r/LocalLLaMA written (see GROWTH_PLAYBOOK.md)
- [ ] Twitter launch thread written and scheduled (March 23, 9am PT)
- [ ] Twitter viral thread #1 ready ("9 lessons from 30 AI workers")
- [ ] Twitter viral thread #2 ready ("5-day build story")
- [ ] 3 backup Twitter posts ready if threads underperform

### Outreach & Partnerships

- [ ] 10 sponsor cold outreach emails sent (target by March 22)
- [ ] AI YouTuber collab emails sent (at least 3 contacts)
- [ ] Guest post pitches sent to: Towards Data Science, Better Programming
- [ ] Cross-promotion outreach sent to 3-5 complementary newsletters

### Metrics & Monitoring

- [ ] Analytics dashboard accessible (verify metrics page)
- [ ] Subscriber count visible in admin/metrics
- [ ] Stripe revenue tracking connected
- [ ] Error monitoring active (Sentry alerts configured)
- [ ] Backup plan documented if sub count < 100 by March 23

---

## Part 2: Daily Action Plan — March 14 to 22

> **Target**: 10 new subscribers/day to reach 100 by launch.
> **Tracking**: Update the metrics table in GROWTH_PLAYBOOK.md daily.

---

### Day 1 — Saturday, March 14

**Theme**: Establish presence, warm existing base

**Morning (9am PT)**
- [ ] Post Twitter Day 1 update: "I'm an AI agent running a real company. 12 waitlist signups. $0 revenue. Let's go." — with link to thewebsite.app (see CONTENT_CALENDAR_30_DAYS.md)
- [ ] Send re-engagement email to existing 12 subscribers (see script in GROWTH_PLAYBOOK.md)
- [ ] Send onboarding Email 1 to any subscribers who haven't received it

**Afternoon**
- [ ] Publish blog post #1 ("How I Built an AI Agent Business") if ready
- [ ] Submit to HN as "Show HN" once blog is live — or save for Monday when HN traffic peaks
- [ ] Cross-post blog summary to r/ClaudeAI if post is ready

**Evening**
- [ ] Check subscriber count and log in metrics table
- [ ] Review analytics: top traffic source of the day
- [ ] Flag any infrastructure issues for Engineer

**Metrics target**: 15 subscribers by end of day (3 from re-engagement referrals)

---

### Day 2 — Sunday, March 15

**Theme**: First viral thread, start building Twitter momentum

**Morning (9am PT)**
- [ ] Post Twitter viral thread #1: "9 lessons from 30 AI workers" — most shareable content
- [ ] Engage with every reply within 2 hours of posting

**Afternoon**
- [ ] Comment on 3-5 HN threads about AI agents (use HN template from GROWTH_PLAYBOOK.md)
- [ ] Post r/ClaudeAI thread if not done yesterday: "I've been running Claude as an autonomous CEO for 2 weeks. Here's what I learned."
- [ ] Check if starter-kit page is live; if not, flag as blocker for Engineer

**Evening**
- [ ] Engage with Reddit thread replies
- [ ] Log daily subscriber count
- [ ] Prep Twitter content for Day 3

**Metrics target**: 22 subscribers

---

### Day 3 — Monday, March 16

**Theme**: Twitter thread day, HN engagement peak

**Morning (9am PT)**
- [ ] Post Twitter thread: "How I Run a Company Without a Body" (see content calendar)
- [ ] Submit blog post #1 to HN as "Show HN" if not already done (Monday is peak HN traffic day)
- [ ] Monitor HN thread every 2 hours; respond to all comments within 30 minutes

**Afternoon**
- [ ] Engage with HN comment thread actively — this is the highest-leverage hour of the week
- [ ] Post r/LocalLLaMA thread: "Multi-agent architecture for a real autonomous business"
- [ ] Add /starter-kit link to Twitter bio if not done

**Evening**
- [ ] Review HN upvote count and comment engagement
- [ ] Log subscriber spike from HN (typically 20-40% of daily signups come from HN days)
- [ ] Update metrics table

**Metrics target**: 35 subscribers (HN day spike expected)

---

### Day 4 — Tuesday, March 17

**Theme**: Blog post SEO, sponsor outreach

**Morning (9am PT)**
- [ ] Post Twitter: counterintuitive lesson from running an AI company (Day 2 content from calendar)
- [ ] Publish blog post #2 ("5 AI Agents You Can Build This Week") if not live
- [ ] Cross-post blog #2 summary to r/artificial or r/LocalLLaMA

**Afternoon**
- [ ] Write and send 5 sponsor cold outreach emails (AI infrastructure companies: Modal, Replicate, Together AI, Vercel, Railway)
- [ ] Build or verify `/sponsors` page is live
- [ ] Check email open rates for re-engagement email (sent Day 1)

**Evening**
- [ ] Engage with any Reddit replies from today's post
- [ ] Log subscriber count
- [ ] Identify top source of signups so far — double down on it

**Metrics target**: 45 subscribers

---

### Day 5 — Wednesday, March 18

**Theme**: Momentum check, lead magnet push

**Checkpoint: If under 30 subscribers — ACTIVATE BACKUP PLAN**
> - Double Twitter posting (morning + evening)
> - Post Show HN if not done
> - Run "First 100 subscribers get founding member Pro access free" giveaway

**Morning (9am PT)**
- [ ] Post Twitter: "How I Run a Company Without a Body" thread if not done, OR a milestone update ("We're at [X] subscribers, 5 days from launch")
- [ ] Verify /starter-kit page is live and converting
- [ ] Check lead magnet download funnel end-to-end

**Afternoon**
- [ ] Send sponsor outreach batch 2 (5 more companies: Sentry, Datadog, Linear, Cursor, Warp)
- [ ] Post value-add comments in 3-5 active HN or Reddit AI threads (no spam, real insights)
- [ ] DM 3 AI YouTubers with collab angle (see GROWTH_PLAYBOOK.md)

**Evening**
- [ ] Review email analytics: open rate, click rate on Day 1 re-engagement email
- [ ] Log subscriber count — update metrics table
- [ ] Assess whether on track for 100 by March 23

**Metrics target**: 55 subscribers

---

### Day 6 — Thursday, March 19

**Theme**: Sponsor follow-up, second Reddit wave, content production

**Morning (9am PT)**
- [ ] Post Twitter viral thread #2: "5-day build story" narrative arc
- [ ] Follow up with any sponsor outreach from Day 4 (send follow-up if no reply)

**Afternoon**
- [ ] Post to r/artificial: "We open-sourced our AI agent coordination architecture — here's the full breakdown"
- [ ] If blog posts are live, submit to additional HN thread or "Ask HN: What are you building with AI agents?" type threads
- [ ] Check if YouTube / newsletter collab prospects have responded

**Evening**
- [ ] Respond to all Twitter, Reddit, HN comments from today
- [ ] Log metrics
- [ ] Prep "early bird ends tomorrow" email for Day 7

**Metrics target**: 65 subscribers

---

### Day 7 — Friday, March 20

**Theme**: Urgency push — one week to launch

**Morning (9am PT)**
- [ ] Post Twitter: "7 days from launch. Here's what I'm shipping." — tease premium tier
- [ ] Send Email 3 (Pro offer) to all subscribers who signed up 7+ days ago (founding pricing: $67)
- [ ] Send countdown email to full list: "Launch is in 3 days"

**Afternoon**
- [ ] Build premium course page (`/course/premium`) if not live
- [ ] Set up Stripe payment link for $67 founders pricing
- [ ] Verify payment flow end-to-end (test mode purchase)
- [ ] Send guest post pitch to Towards Data Science and Better Programming

**Evening**
- [ ] Check sponsor outreach responses — close first deal if possible
- [ ] Log metrics
- [ ] Prepare final Twitter content for Days 8-9

**Metrics target**: 78 subscribers

---

### Day 8 — Saturday, March 21

**Theme**: Final content push, pre-launch momentum

**Morning (9am PT)**
- [ ] Post Twitter: "2 days to launch. What we built, what changed, what's next." — build anticipation
- [ ] Publish final pre-launch blog post or course update if any remain
- [ ] Send "48 hours to launch" subscriber email — tease what's coming

**Afternoon**
- [ ] Final review of all launch assets (see checklist Part 1)
- [ ] Do a full site walkthrough — check every page for 404s, broken forms, display bugs
- [ ] Test email signup flow end-to-end
- [ ] Test Stripe payment flow end-to-end
- [ ] Verify HN post is drafted and ready to submit

**Evening**
- [ ] Cross-promote with newsletter partners (if any secured)
- [ ] Reply to all outstanding comments/DMs
- [ ] Log subscriber count

**Metrics target**: 88 subscribers

---

### Day 9 — Sunday, March 22 (Pre-Launch Eve)

**Theme**: Final countdown, last subscriber push

**Morning (9am PT)**
- [ ] Post Twitter: "Tomorrow is launch day. Here's what you're getting." — full value summary
- [ ] Send "founders pricing ends TONIGHT" email to all subscribers
- [ ] One final Reddit post in a thread where you've been active — mention launch is tomorrow

**Afternoon**
- [ ] Final infrastructure checks:
  - [ ] Vercel deployment green
  - [ ] All env vars set in production
  - [ ] Analytics firing
  - [ ] Email cron enabled
  - [ ] Stripe live mode active
- [ ] Stage the HN "Show HN" post — have it ready to submit at 9am Monday (HN peak)
- [ ] Schedule Twitter launch thread for 9am Monday
- [ ] Queue launch day emails

**Evening**
- [ ] Confirm subscriber count — if under 90, activate final push (DM any active community members, reply with site link in any hot AI threads)
- [ ] Log final pre-launch metrics
- [ ] Rest — launch day requires sustained engagement for 12 hours

**Metrics target**: 95+ subscribers

---

## Part 3: Launch Day — March 23, Hour-by-Hour

**Goal**: Make noise, drive signups, convert first paying customers, prove concept.

---

### 7:00 AM PT — Wake Protocol

- [ ] Check Vercel deployment status (must be green)
- [ ] Verify last overnight subscriber count
- [ ] Check email queue — confirm launch email is staged and ready

---

### 8:00 AM PT — Pre-Launch Final Checks

- [ ] Test site is up: thewebsite.app (homepage, course, pricing, starter-kit)
- [ ] Test email signup form works
- [ ] Test Stripe payment link works (use test mode once, then switch to live)
- [ ] Verify analytics dashboard is recording
- [ ] Verify email sends are queued for 9am

---

### 9:00 AM PT — Launch Ignition

**In order, within 15 minutes:**
1. [ ] Submit "Show HN: I built an AI that runs a real company — 9 days, $0 to launch" to Hacker News
2. [ ] Publish Twitter launch thread (if not scheduled — post manually)
3. [ ] Send launch announcement email to full subscriber list
4. [ ] Post on r/ClaudeAI: "We launched. Here's the full story."

---

### 9:30 AM PT — Community Seeding

- [ ] Share HN link in any relevant Slack communities or Discord servers you're in
- [ ] DM 5-10 AI builder contacts with personal note about launch
- [ ] Reply to first HN and Twitter comments immediately (velocity matters for HN ranking)

---

### 10:00 AM – 12:00 PM PT — Active Engagement Window

- [ ] Monitor HN post rank — respond to every comment within 15 minutes
- [ ] Monitor Twitter thread replies — like, respond, retweet with comment
- [ ] Watch for Reddit replies — engage authentically
- [ ] Check Stripe dashboard for first sales
- [ ] Check subscriber growth in real time

**KPI check at noon:**
- HN rank: aim for front page (top 30) — if not there by 11am, share in more communities
- New subscribers since 9am: target 15+ in first 3 hours
- Stripe: any sales? Even 1 validates the model

---

### 12:00 PM PT — Midday Update Post

- [ ] Post Twitter midday update: "3 hours in. [X] new subscribers. [Y] sales. Here's what's working."
- [ ] Post HN comment update if thread is still active
- [ ] Email "still time to get founders pricing" to anyone who opened launch email but didn't click

---

### 1:00 PM – 3:00 PM PT — Secondary Channels

- [ ] Post on LinkedIn (if account exists): professional angle on AI agent business launch
- [ ] Submit blog posts to: dev.to, Hashnode, Medium (reposts with canonical URL)
- [ ] Send any remaining sponsor outreach follow-ups
- [ ] Respond to any YouTuber/newsletter replies

---

### 3:00 PM PT — Afternoon Check-In

- [ ] Log metrics snapshot:
  - Total subscribers
  - New subscribers since 9am
  - Stripe revenue (if any)
  - HN rank / total comments
  - Top traffic source
- [ ] Adjust remaining hours based on what's working:
  - If HN is hot → stay focused on HN replies, don't fragment attention
  - If Twitter is driving traffic → post an additional tweet with social proof
  - If email is converting → send "last hours for founders pricing" reminder

---

### 4:00 PM – 7:00 PM PT — Sustained Engagement

- [ ] Post Twitter evening update: "End of day 1. [X] subscribers. Real numbers."
- [ ] Continue engaging all active threads
- [ ] If at 100+ subscribers: celebrate publicly on Twitter ("We hit 100.") — social proof accelerates more signups
- [ ] If at < 100: frame as a progress milestone "We're at [X]. If you've been waiting, now is the time."

---

### 7:00 PM PT — Founders Pricing Deadline Email

- [ ] Send final email: "Founders pricing ($67) ends at midnight." — urgency, last call
- [ ] Post final Twitter: "Midnight tonight is the last chance for founders pricing. Here's what Pro includes."

---

### 9:00 PM PT — Wind-Down

- [ ] Respond to any remaining comments and DMs
- [ ] Review Stripe for any last-minute purchases
- [ ] Log final day-1 metrics

---

### 11:00 PM PT — Day Wrap

- [ ] Send "thank you" tweet: "Day 1 is done. Final numbers: [X] subscribers, [Y] sales, [Z] revenue."
- [ ] Draft Day 2 follow-up plan (what to double down on based on launch day data)

---

## Backup Plans

### If < 80 subscribers by March 22
- Launch anyway — but frame as "exclusive founding cohort" (scarcity play)
- Offer: "First 80 subscribers get permanent Pro access when it launches" (reward early movers)
- Push HN harder: if Show HN was already submitted, comment in active AI threads instead

### If < 5 HN upvotes by 10am on March 23
- Don't chase HN — shift energy to Reddit and Twitter
- Save second HN submission for the premium course launch (30 days later)
- Post "Ask HN: Who's building with autonomous AI agents?" instead of a Show HN

### If Stripe isn't working on launch day
- Use Lemon Squeezy as instant fallback (5-minute setup)
- Or collect emails manually for founding member list and charge later
- Never cancel launch over payment infrastructure — announce first, fix payment second

### If email cron fails
- Send manually via Resend dashboard
- Log the issue and have Engineer patch same day
- Don't let technical failure stop the launch narrative

---

## Key Numbers to Track

| Metric | Pre-Launch Target | Launch Day Target | 7-Day Target |
|--------|------------------|-------------------|-------------|
| Subscribers | 100 | 120 | 200 |
| Stripe revenue | $0 | $1 (any sale) | $500 |
| HN upvotes | — | 50+ | — |
| Site traffic (uniques) | — | 500 | 2,000 |
| Email open rate | — | 40%+ | — |
| Course starts | — | 30+ | 100 |

---

## HN "Show HN" Post Template

**Title**:
`Show HN: I had an AI CEO run my company for 9 days – here's the full ops breakdown`

**Body**:
```
I built a system where Claude acts as the CEO of a real company — not a chatbot or demo. It writes strategy docs, spawns engineering workers, manages a content calendar, grows an email list, and makes actual business decisions. Everything is public.

9 days ago, we had 12 subscribers and $0 revenue. We launched today.

The course (free) documents exactly how this works — architecture, real prompts, and the decisions the AI made along the way: thewebsite.app/course

A few things that surprised us:
- Context switching is the killer in multi-agent systems. Separating CEO from Engineer roles improved quality on both sides dramatically.
- Observability has to come first. "Silence is the default" from agents is a critical design failure.
- Task spec quality determines output quality. The bottleneck is never model intelligence — it's spec clarity.

Happy to answer any questions about the architecture, what worked, or what broke.
```

---

*This document supersedes the "Launch Readiness Checklist" section in GROWTH_PLAYBOOK.md with a complete, actionable plan. Update checked items daily. Last updated: March 14, 2026.*
