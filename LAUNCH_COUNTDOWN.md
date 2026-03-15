# Launch Countdown — March 14 to March 23, 2026

**Launch Date**: Monday, March 23, 2026 — 9:00 AM PT
**Audience target**: 100+ subscribers at launch
**Revenue target**: First paying customer on Day 0
**Reference docs**: LAUNCH_CHECKLIST.md · LAUNCH_DAY_CHECKLIST.md · PRE_LAUNCH_VERIFICATION_REPORT.md

---

## How to Use This Checklist

- Work through each day's tasks in order of category: Technical → Content → Marketing → Tests
- Mark items `[x]` as completed
- **Automated** tasks run without human intervention (cron jobs, CI/CD, GitHub Actions)
- **Manual** tasks require a human or agent to actively execute them
- Log subscriber count daily in the metrics row at the bottom of each day
- If a day's success criteria are not met, activate the backup plan before moving to the next day

---

## Milestone Overview

| Date | Day | Milestone |
|------|-----|-----------|
| March 14 | Day -9 | Countdown begins — audit complete, baseline established |
| March 16 | Day -7 | **Final testing complete** — all critical flows verified |
| March 20 | Day -3 | **All systems verified** — Stripe + Resend live, no blockers |
| March 22 | Day -1 | **Launch announcement prepared** — all content queued |
| March 23 | Day  0 | **LAUNCH** |

---

## Day -9 — Saturday, March 14

**Theme**: Baseline audit, warm the existing list, establish Day 1 presence

### Technical
- [ ] **[Manual]** Confirm Vercel deployment is green on `main` branch
- [ ] **[Manual]** Verify all 10 course modules load: `/course/module-1` through `/course/module-10`
- [ ] **[Manual]** Confirm `pnpm build` passes locally with zero errors
- [ ] **[Manual]** Identify the 4 launch blockers from PRE_LAUNCH_VERIFICATION_REPORT.md (OG image, Stripe, Resend, FAQ copy)
- [ ] **[Manual]** Create Resend account at resend.com — begin domain verification for `thewebsite.app`
- [ ] **[Manual]** Create Stripe account — do NOT activate live mode yet; test mode only today

### Content
- [ ] **[Manual]** Publish blog post: "How I Built an AI Agent Business from Scratch" (if not already live)
- [ ] **[Manual]** Confirm all 7 blog posts render without errors at `/blog`
- [ ] **[Manual]** Review starter-kit page at `/starter-kit` — verify email capture form is visible

### Marketing
- [ ] **[Manual]** Post Twitter Day 1 update: "I'm an AI agent running a real company. 12 waitlist signups. $0 revenue. Let's go." — link to thewebsite.app
- [ ] **[Manual]** Send re-engagement email to all 12 existing subscribers (see script in GROWTH_PLAYBOOK.md)
- [ ] **[Manual]** Send onboarding Email 1 to any subscribers who haven't received it

### Tests
- [ ] **[Manual]** Submit a test email to the homepage waitlist form — verify 200 response
- [ ] **[Automated]** Confirm daily email cron is enabled in Vercel dashboard (check Vercel → Settings → Cron Jobs)
- [ ] **[Manual]** Verify unsubscribe flow: use the test email, confirm clean unsubscribe

### Success Criteria
- Vercel build: green
- All 10 course modules: loading
- Existing 12 subscribers: re-engagement email sent
- Twitter: 1 post live
- Subscriber count EOD target: **15**

---

## Day -8 — Sunday, March 15

**Theme**: First viral content push, start building Twitter momentum

### Technical
- [ ] **[Manual]** Continue Resend domain verification — check DNS propagation for `thewebsite.app` MX/TXT records
- [ ] **[Manual]** Create `/public/og-image.png` (1200×630px, dark background with site name + tagline) — this is a CRITICAL blocker for launch social sharing
- [ ] **[Manual]** Deploy OG image to production — verify it loads at `thewebsite.app/og-image.png`
- [ ] **[Manual]** Paste site URL into Twitter Card Validator (developer.twitter.com/en/docs/twitter-for-websites/cards/guides/troubleshooting-cards) — confirm preview renders

### Content
- [ ] **[Manual]** Prepare blog post #2 ("5 AI Agents You Can Build This Week") for submission to HN/Reddit — post is already live, prepare the submission copy
- [ ] **[Manual]** Draft HN "Show HN" post — review the template in LAUNCH_CHECKLIST.md, personalize the body

### Marketing
- [ ] **[Manual]** Post Twitter viral thread #1: "9 lessons from 30 AI workers" — most shareable content of the week
- [ ] **[Manual]** Engage with every reply within 2 hours of posting
- [ ] **[Manual]** Comment on 3–5 active HN threads about AI agents (value-add comments, link only when directly relevant)

### Tests
- [ ] **[Manual]** Test OG image renders on Twitter, LinkedIn, and Slack preview (paste link in each)
- [ ] **[Manual]** Confirm homepage loads cleanly in mobile viewport (Chrome DevTools)

### Success Criteria
- OG image: deployed and verified in Twitter Card Validator
- Twitter thread #1: posted
- HN post draft: saved and ready
- Subscriber count EOD target: **22**

---

## Day -7 — Monday, March 16 ⭐ MILESTONE: Final Testing Complete

**Theme**: HN peak traffic day — submit Show HN, verify all core flows

### Technical
- [ ] **[Manual]** Run full end-to-end test suite: `pnpm test` (or equivalent)
- [ ] **[Manual]** Run production build: `pnpm build` — zero errors required
- [ ] **[Manual]** Test email signup → welcome email flow end-to-end (requires Resend to be live; if not, document as blocker)
- [ ] **[Manual]** Verify `/pricing` page shows $67 founders / $97 standard — both CTAs link correctly
- [ ] **[Manual]** Verify `/checkout` page loads — document payment status (placeholder or Stripe live)
- [ ] **[Manual]** Check Vercel Function logs for any errors in the last 24 hours

### Content
- [ ] **[Manual]** Submit "Show HN" to Hacker News (Monday = peak HN traffic day) — use exact title from LAUNCH_CHECKLIST.md
- [ ] **[Manual]** Monitor HN thread every 2 hours; respond to all comments within 30 minutes
- [ ] **[Manual]** Post Twitter thread: "How I Run a Company Without a Body" (see content calendar)

### Marketing
- [ ] **[Manual]** Post to r/LocalLLaMA: "Multi-agent architecture for a real autonomous business"
- [ ] **[Manual]** Add `/starter-kit` link to Twitter bio if not already there
- [ ] **[Manual]** Log HN upvote count at 9am, 11am, 1pm, 3pm — record in metrics table

### Tests
- [ ] **[Manual]** Test all 10 course module pages load without errors
- [ ] **[Manual]** Test `/faq` page loads
- [ ] **[Manual]** Test `/starter-kit` email capture: submit form → verify success state
- [ ] **[Automated]** Confirm CI/CD pipeline passes on `main` branch (check GitHub Actions)

### Success Criteria
- `pnpm build`: green, zero errors
- `pnpm test`: all tests passing
- HN submission: live
- All 10 course modules: verified loading
- Subscriber count EOD target: **35** (HN day spike expected)

---

## Day -6 — Tuesday, March 17

**Theme**: Sponsor outreach begins, second Reddit wave

### Technical
- [ ] **[Manual]** Complete Resend setup: domain `thewebsite.app` verified, `RESEND_API_KEY` set in Vercel env vars
- [ ] **[Manual]** Set `CRON_SECRET` env var in Vercel production
- [ ] **[Manual]** Test: submit waitlist signup → confirm welcome email arrives in inbox
- [ ] **[Manual]** Fix FAQ module count copy: update `app/faq/page.tsx` to say "Modules 1–5 (free), Modules 6–10 (Pro)"
- [ ] **[Manual]** Fix `app/layout.tsx` description: change "9-module course" to "10-module course"
- [ ] **[Manual]** Deploy fixes and confirm production build is green

### Content
- [ ] **[Manual]** Follow up on any HN comments from Day -7 thread
- [ ] **[Manual]** Post r/ClaudeAI thread: "I've been running Claude as an autonomous CEO for 2 weeks. Here's what I learned."
- [ ] **[Manual]** Cross-post blog #2 ("5 AI Agents") summary to r/artificial

### Marketing
- [ ] **[Manual]** Write and send first batch of 5 sponsor cold outreach emails (targets: Modal, Replicate, Together AI, Vercel, Railway)
- [ ] **[Manual]** Post Twitter: counterintuitive lesson from running an AI company (Day 2 content from calendar)
- [ ] **[Manual]** Check email open rates for the re-engagement email sent Day -9 — note which links got clicks

### Tests
- [ ] **[Manual]** Verify `RESEND_API_KEY` is set: trigger a test signup and confirm email delivery
- [ ] **[Manual]** Check Vercel logs for any cron job errors

### Success Criteria
- Resend: fully configured, welcome email confirmed delivered
- FAQ copy: fixed and deployed
- Sponsor outreach batch 1: sent (5 emails)
- Subscriber count EOD target: **45**

---

## Day -5 — Wednesday, March 18

**Theme**: Momentum checkpoint — assess trajectory, activate backup plan if needed

> **Checkpoint**: If under 30 subscribers — ACTIVATE BACKUP PLAN
> - Double Twitter posting (morning + evening)
> - Run "First 100 subscribers get founding member Pro access free" offer
> - Submit Show HN if not already done

### Technical
- [ ] **[Manual]** Begin Stripe setup: create account, configure product ($67 founders, $97 standard)
- [ ] **[Manual]** Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Vercel env vars (test mode keys first)
- [ ] **[Manual]** Test Stripe checkout in test mode: complete a test purchase → confirm `/course/success` renders
- [ ] **[Manual]** Verify `/starter-kit` page is converting (check form submission analytics)
- [ ] **[Manual]** Check Sentry for any unhandled errors in the last 48 hours

### Content
- [ ] **[Manual]** Verify lead magnet download funnel works end-to-end from `/starter-kit`
- [ ] **[Manual]** Engage with r/ClaudeAI and r/artificial threads from yesterday — respond to questions

### Marketing
- [ ] **[Manual]** Post Twitter: "5 days from launch. Here's what I'm shipping." — tease premium tier
- [ ] **[Manual]** Send sponsor outreach batch 2 (5 more companies: Sentry, Datadog, Linear, Cursor, Warp)
- [ ] **[Manual]** DM 3 AI YouTubers with collab angle (see GROWTH_PLAYBOOK.md for contact list)
- [ ] **[Manual]** Post value-add comments in 3–5 active HN or Reddit AI threads (no spam, real insights only)

### Tests
- [ ] **[Manual]** Test Stripe checkout flow in test mode — full end-to-end
- [ ] **[Manual]** Review email open rates for Welcome Email 1 sent to new subscribers
- [ ] **[Manual]** Assess whether signup rate is on track for 100 by March 23

### Success Criteria
- Stripe: test mode configured, test purchase successful
- YouTuber outreach: 3 DMs sent
- Subscriber count EOD target: **55**

---

## Day -4 — Thursday, March 19

**Theme**: Final content push, second viral thread

### Technical
- [ ] **[Manual]** Complete Stripe live mode setup: activate live mode, generate live API keys
- [ ] **[Manual]** Update Vercel env vars with live Stripe keys (keep test keys in a separate `.env.local` file)
- [ ] **[Manual]** Build or verify `/sponsors` page at `/sponsors` — audience stats, pricing, CTA
- [ ] **[Manual]** Create OG image for `/pricing` and `/checkout` pages (unique previews improve social sharing)
- [ ] **[Manual]** Verify daily email cron is running: check Vercel → Cron Jobs → last execution timestamp

### Content
- [ ] **[Manual]** Post Twitter viral thread #2: "5-day build story" narrative arc
- [ ] **[Manual]** Follow up with sponsor outreach from Day -6 (send follow-up if no reply in 48h)

### Marketing
- [ ] **[Manual]** Post to r/artificial: "We open-sourced our AI agent coordination architecture — here's the breakdown"
- [ ] **[Manual]** Submit blog posts to additional distribution channels: dev.to, Hashnode (set canonical URL to thewebsite.app)
- [ ] **[Manual]** Check if YouTube / newsletter collab prospects have responded — follow up if needed
- [ ] **[Manual]** Send guest post pitch to Towards Data Science and Better Programming

### Tests
- [ ] **[Manual]** Run Stripe test in live mode: use a real card for a $1 test charge, then immediately refund
- [ ] **[Manual]** Verify Stripe webhook at `/api/webhook/stripe` is receiving events (check Stripe dashboard → Webhooks)
- [ ] **[Manual]** Confirm Vercel production env vars are complete: run through the full list in LAUNCH_CHECKLIST.md §Infrastructure

### Success Criteria
- Stripe: live mode active, live test charge successful
- `/sponsors` page: live
- All Vercel env vars: confirmed set
- Subscriber count EOD target: **65**

---

## Day -3 — Friday, March 20 ⭐ MILESTONE: All Systems Verified

**Theme**: Urgency push — send countdown email, verify every system is go

### Technical
- [ ] **[Manual]** Run complete system verification checklist (all items from PRE_LAUNCH_VERIFICATION_REPORT.md §4 Prioritized Action Items)
- [ ] **[Manual]** Confirm: `STRIPE_SECRET_KEY` (live), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (live), `RESEND_API_KEY`, `CRON_SECRET` — all set in Vercel production
- [ ] **[Manual]** Build and deploy: `pnpm build` → push to `main` → Vercel auto-deploy → confirm green
- [ ] **[Manual]** Complete `/course/premium` page if not already live (Pro course landing with $67 price)
- [ ] **[Manual]** Verify Stripe payment link or `/api/checkout` endpoint processes payments in live mode

### Content
- [ ] **[Manual]** Write and finalize the launch announcement email (subject: "The course is live. Here's what we built.")
- [ ] **[Manual]** Write and finalize the "founders pricing ends tonight" email (for Day -1)
- [ ] **[Manual]** Write and finalize the "midday update" email template for launch day

### Marketing
- [ ] **[Manual]** Post Twitter: "3 days from launch. Here's what I'm shipping." — tease premium tier and pricing
- [ ] **[Manual]** Send Email 3 (Pro offer, $67 founders pricing) to all subscribers who signed up 7+ days ago
- [ ] **[Manual]** Send countdown email to full list: "Launch is in 3 days"
- [ ] **[Manual]** Check sponsor outreach responses — close first deal if possible

### Tests
- [ ] **[Manual]** End-to-end Stripe test in live mode: complete purchase → verify `/course/success` → check Stripe dashboard
- [ ] **[Manual]** End-to-end email test: submit new waitlist signup → verify Email 1 arrives within 5 minutes
- [ ] **[Manual]** Test unsubscribe link in welcome email — confirm clean removal
- [ ] **[Manual]** Re-run PRE_LAUNCH_VERIFICATION_REPORT.md audit manually — all 4 original blockers must be resolved

### Success Criteria
- All 4 original blockers: RESOLVED (OG image, Stripe live, Resend live, FAQ copy fixed)
- Launch announcement email: written and saved in Resend drafts
- Stripe live purchase: successful
- Email welcome flow: confirmed working end-to-end
- Subscriber count EOD target: **78**

---

## Day -2 — Saturday, March 21

**Theme**: Final content push, pre-launch momentum, full site audit

### Technical
- [ ] **[Manual]** Full site walkthrough — visit every page, check for 404s, broken forms, display bugs:
  - [ ] `/` — homepage loads, hero renders, email form visible
  - [ ] `/course` — all 10 modules listed
  - [ ] `/course/module-1` through `/course/module-10` — all load
  - [ ] `/pricing` — $67 founders / $97 standard shows correctly
  - [ ] `/checkout` — Stripe checkout loads (not placeholder)
  - [ ] `/faq` — correct module counts (1–5 free, 6–10 Pro)
  - [ ] `/starter-kit` — email form works
  - [ ] `/blog` — all 7 posts listed
  - [ ] `/sponsors` — page loads
- [ ] **[Manual]** Check Vercel deployment logs for any recent errors
- [ ] **[Automated]** Verify GitHub Actions CI is passing on `main` branch

### Content
- [ ] **[Manual]** Publish final pre-launch blog post or course content update if any remain
- [ ] **[Manual]** Confirm HN "Show HN" post is drafted and saved — do NOT submit yet (save for 9am Monday)
- [ ] **[Manual]** Confirm Twitter launch thread is written and ready to post/schedule for 9am Monday

### Marketing
- [ ] **[Manual]** Post Twitter: "2 days to launch. What we built, what changed, what's next." — build anticipation
- [ ] **[Manual]** Send "48 hours to launch" subscriber email — tease what's coming, link to `/pricing`
- [ ] **[Manual]** Cross-promote with any newsletter partners secured during outreach
- [ ] **[Manual]** Reply to all outstanding Twitter, Reddit, and HN comments

### Tests
- [ ] **[Manual]** Test email signup flow end-to-end one final time
- [ ] **[Manual]** Test Stripe payment flow end-to-end (live mode)
- [ ] **[Manual]** Test unsubscribe flow
- [ ] **[Manual]** Verify analytics dashboard at `/admin` is recording pageviews
- [ ] **[Manual]** Paste site URL into Twitter Card Validator one more time — confirm OG image still renders
- [ ] **[Manual]** Load site on mobile device (not emulator) — confirm no visual breakage

### Success Criteria
- Full site audit: zero 404s, zero broken forms
- HN post: drafted and saved, not yet submitted
- Twitter thread: written and scheduled/ready
- All email templates: finalized
- Subscriber count EOD target: **88**

---

## Day -1 — Sunday, March 22 ⭐ MILESTONE: Launch Announcement Prepared

**Theme**: Final countdown — queue everything, rest before sustained launch engagement

### Technical
- [ ] **[Manual]** Final infrastructure check — all items must be green before bed:
  - [ ] Vercel deployment: green, no build errors
  - [ ] Stripe: live mode active, webhook receiving events
  - [ ] Resend: domain verified, email sending confirmed
  - [ ] `CRON_SECRET`: set in Vercel
  - [ ] Daily email cron: enabled in Vercel dashboard
  - [ ] Analytics: pageviews recording in `/admin`
  - [ ] OG image: renders in Twitter Card Validator
- [ ] **[Manual]** Set Stripe founders pricing to expire after 50 purchases or March 22 midnight — whichever comes first
- [ ] **[Manual]** Confirm rollback plan: identify the last known-good Vercel deployment hash in case of emergency rollback

### Content
- [ ] **[Manual]** Stage the launch announcement email in Resend — ready to send at 9am Monday
- [ ] **[Manual]** Stage the "founders pricing ends TONIGHT" email for 7pm Monday
- [ ] **[Manual]** Schedule Twitter launch thread for 9am Monday PT (or confirm manual posting plan)
- [ ] **[Manual]** Write Day 2 contingency plan — what to do if HN fails to gain traction

### Marketing
- [ ] **[Manual]** Post Twitter: "Tomorrow is launch day. Here's what you're getting." — full value summary
- [ ] **[Manual]** Send "founders pricing ends TONIGHT" email to all subscribers
- [ ] **[Manual]** One final Reddit post in an active AI thread — mention launch is tomorrow
- [ ] **[Manual]** DM any active community members who have engaged with content this week — personal heads-up

### Tests
- [ ] **[Manual]** Run through the full LAUNCH_DAY_CHECKLIST.md §Pre-Launch Gate Check — all items must be checked
- [ ] **[Manual]** Do a dry run of the 9am launch sequence (HN → Twitter → Email → Reddit) — know exactly what you'll click, in what order, and how long it will take

### Success Criteria
- Infrastructure gate check: all green
- Launch announcement email: staged in Resend, ready to send
- Twitter thread: scheduled or ready to post manually
- HN post: drafted, ready to copy-paste
- Subscriber count EOD target: **95+**
- Mental state: rested, not scrambling

---

## Day 0 — Monday, March 23 ⭐ LAUNCH DAY

**Theme**: Execute with precision, engage for 12 hours, celebrate

> Full hour-by-hour plan in LAUNCH_DAY_CHECKLIST.md. Summary below.

### Technical
- [ ] **[Manual]** 7:00 AM: Check Vercel deployment — must be green
- [ ] **[Manual]** 7:00 AM: Verify subscriber count overnight
- [ ] **[Manual]** 8:00 AM: Test all critical pages (/, /course, /pricing, /checkout, /faq, /starter-kit, /blog)
- [ ] **[Manual]** 8:00 AM: Test email signup form — confirm success and welcome email delivery
- [ ] **[Manual]** 8:00 AM: Complete a $1 Stripe test charge, void it immediately — confirm live mode is working
- [ ] **[Manual]** 8:00 AM: Verify analytics is recording

### Content
- [ ] **[Manual]** 9:00 AM: Submit "Show HN: I had an AI CEO run my company for 9 days" to Hacker News
- [ ] **[Manual]** 9:00 AM: Publish Twitter launch thread (or confirm scheduled post is live)
- [ ] **[Manual]** 9:00 AM: Send launch announcement email to full subscriber list
- [ ] **[Manual]** 9:00 AM: Post on r/ClaudeAI: "We launched. Here's the full story."
- [ ] **[Manual]** 12:00 PM: Post Twitter midday update with real numbers
- [ ] **[Manual]** 4:00 PM: Post Twitter evening update with real numbers

### Marketing
- [ ] **[Manual]** 9:30 AM: Share HN link in relevant Slack/Discord communities
- [ ] **[Manual]** 9:30 AM: DM 5–10 AI builder contacts with personal note
- [ ] **[Automated]** Nurture sequence Email 2 auto-queues for subscribers who joined 3 days ago
- [ ] **[Manual]** 7:00 PM: Send "founders pricing ($67) ends at midnight" final email
- [ ] **[Manual]** 7:00 PM: Post final Twitter: "Midnight is the last chance for founders pricing."
- [ ] **[Manual]** 1:00 PM: Post on LinkedIn with professional angle
- [ ] **[Manual]** 1:00 PM: Cross-post blog to dev.to and Hashnode

### Tests
- [ ] **[Manual]** 10:00 AM: KPI check — HN rank, new subscriber count, Stripe dashboard
- [ ] **[Manual]** 3:00 PM: Full metrics snapshot (see LAUNCH_DAY_CHECKLIST.md §3:00 PM)
- [ ] **[Automated]** Sentry error monitoring active — alert on any 5xx errors
- [ ] **[Manual]** 9:00 PM: Log final Day 1 metrics

### Success Criteria
- Site: up and responding for all 12 hours of active launch
- HN: submitted at 9am PT
- Email: sent to full list
- Subscribers gained today: 20+
- Total subscribers: 120+
- Stripe revenue: $1+ (at least one sale)
- Launch announcement: out on all channels

---

## Automation vs Manual Summary

| Category | Automated | Manual |
|----------|-----------|--------|
| CI/CD (build verification) | GitHub Actions on every push | — |
| Vercel deployment | Auto-deploys on `main` push | Triggering push |
| Daily nurture email cron | Vercel Cron (CRON_SECRET required) | Enable in dashboard; monitor |
| Email nurture sequence | Resend sends Email 2 (Day 3), Email 3 (Day 7) automatically | Write copy; trigger Email 1 manually |
| Analytics (pageview tracking) | Fires on page load | Review in `/admin` |
| Sentry error alerts | Fires on unhandled errors | Configure alert thresholds |
| Stripe webhook processing | `/api/webhook/stripe` handles events | Monitor in Stripe dashboard |
| HN submission | — | Manual copy-paste at 9am |
| Twitter launch thread | Pre-schedule via TweetDeck/Buffer | Write copy; schedule |
| Email campaigns (launch, founders) | — | Stage in Resend; send manually |
| Reddit posts | — | Manual |
| Sponsor outreach | — | Manual |
| Subscriber count logging | — | Manual daily review |

---

## Daily Metrics Tracker

| Date | Day | Subscribers | New Today | Top Source | Stripe Revenue | Notes |
|------|-----|-------------|-----------|------------|----------------|-------|
| Mar 14 | -9 | | | | — | |
| Mar 15 | -8 | | | | — | |
| Mar 16 | -7 | | | | — | |
| Mar 17 | -6 | | | | — | |
| Mar 18 | -5 | | | | — | |
| Mar 19 | -4 | | | | — | |
| Mar 20 | -3 | | | | — | |
| Mar 21 | -2 | | | | — | |
| Mar 22 | -1 | | | | — | |
| Mar 23 |  0 | | | | | LAUNCH |

**Targets**: 15 → 22 → 35 → 45 → 55 → 65 → 78 → 88 → 95 → 120+

---

## Blocker Escalation

If any of these are not resolved by their deadline, escalate immediately:

| Blocker | Deadline | Status |
|---------|----------|--------|
| OG image deployed | March 15 (Day -8) | [ ] |
| Resend domain verified | March 17 (Day -6) | [ ] |
| Stripe test mode working | March 18 (Day -5) | [ ] |
| Stripe live mode active | March 19 (Day -4) | [ ] |
| All PRE_LAUNCH blockers resolved | March 20 (Day -3) | [ ] |
| Full site audit clean | March 21 (Day -2) | [ ] |
| Infrastructure gate check green | March 22 (Day -1) | [ ] |

---

*This document is the countdown companion to LAUNCH_CHECKLIST.md (strategic plan + HN template) and LAUNCH_DAY_CHECKLIST.md (hour-by-hour Day 0 operations). Created March 15, 2026.*
