# Launch Readiness — Single Source of Truth

**Launch Date**: Monday, March 23, 2026, 9:00 AM PT
**Report Date**: March 14, 2026 (9 days to launch)
**Status**: CONDITIONALLY READY — 2 manual blockers remain

This document consolidates:
- `PRE_LAUNCH_VERIFICATION_REPORT.md` (technical audit)
- `FINAL_LAUNCH_DAY_CHECKLIST.md` (fixes applied + manual setup)
- `LAUNCH_DAY_CHECKLIST.md` (operational launch day steps)
- `LAUNCH_CHECKLIST.md` (9-day countdown plan)
- `LAUNCH_DAY_STRATEGY.md` (HN/Reddit/Twitter content)

---

## 1. Go/No-Go Decision Criteria

**Evaluate on March 22 EOD. Launch proceeds if all REQUIRED items are checked.**

### Required (launch blocked without these)

- [ ] Stripe account created, live mode active, API keys set in Vercel
- [ ] Resend domain `thewebsite.app` verified, API key set in Vercel, email cron enabled
- [ ] Vercel deployment green (no build errors on `main`)
- [ ] Site accessible: thewebsite.app responds with 200
- [ ] Email signup form functional end-to-end (form → DB → welcome email)

### Recommended (launch proceeds without these, but fix ASAP)

- [ ] Stripe payment flow tested end-to-end in test mode
- [ ] Email nurture sequence tested (signup → Email 1 → Email 2 → Email 3)
- [ ] Unsubscribe flow tested
- [ ] HN "Show HN" post drafted and saved
- [ ] Twitter launch thread written and ready to post

### Go / No-Go Decision

| Status | Verdict |
|--------|---------|
| All REQUIRED checked | **GO** |
| Any REQUIRED unchecked | **NO-GO** — do not launch |

**Fallback rule**: If Stripe is not ready on launch day, switch to Lemon Squeezy (5-min setup) or collect emails manually. Do NOT delay launch over payment infrastructure.

---

## 2. Current Status (as of March 14, 2026)

### Technical — 90% Ready

| Check | Status | Notes |
|-------|--------|-------|
| Build passes (56/56 pages) | PASS | Confirmed |
| All 10 course modules accessible | PASS | `/course/module-1` through `/course/module-10` |
| Forms functional | PASS | Homepage, course, starter-kit, checkout email capture |
| Responsive design | PASS | All pages use Tailwind responsive breakpoints |
| OG image | PASS | `app/opengraph-image.tsx` created (dynamic, edge runtime) |
| SEO meta tags | PASS | All key pages have title, description, OpenGraph |
| Stripe payment flow | **FAIL — needs manual setup** | Checkout is email-only placeholder |
| Resend email system | **FAIL — needs manual setup** | Code exists; requires account + domain verification |

### Content — 100% Ready

| Check | Status | Notes |
|-------|--------|-------|
| 10 course modules | PASS | All live and rendering |
| 7 blog posts | PASS | All published March 14 (scheduling moot) |
| FAQ page | PASS | Module counts fixed (9 → 10, "Modules 6–10 Pro") |
| Pricing page | PASS | $67 founders / $97 standard clearly displayed |
| Starter-kit page | PASS | Email capture functional |
| Layout description | PASS | Updated from "9-module" to "10-module course" |

### Code Fixes Applied (Done)

| # | Fix | Status |
|---|-----|--------|
| 1 | OG image missing — created `app/opengraph-image.tsx` | Done |
| 2 | `layout.tsx` description said "9-module course" | Fixed → "10-module course" |
| 3 | FAQ said "all 9 modules" and "Modules 6–9" for Pro | Fixed → "all 10 modules" / "Modules 6–10" |

---

## 3. Blocking Issues for March 23

### Blocker 1 — Stripe (Payment Processing)

**Owner**: Human (Nalin) | **Deadline**: March 20

Current state: The `/checkout` page collects email only. It shows: "Payment infrastructure is being set up." Webhook handler and checkout API are built — just need live credentials.

Setup steps:
- [ ] Create Stripe account at stripe.com
- [ ] Complete identity verification, switch to live mode
- [ ] Create product: "AI Agent Course — Pro Access"
  - Founders price: $67 (one-time, valid through March 22)
  - Standard price: $97 (March 23+)
- [ ] Get live API keys from Stripe dashboard
- [ ] Add to Vercel env vars:
  - `STRIPE_SECRET_KEY` = `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
  - `STRIPE_WEBHOOK_SECRET` = from Stripe webhook config
- [ ] Update `/checkout` page to use Stripe Checkout (not email-only placeholder)
- [ ] Test full payment flow in test mode, then switch to live

See `STRIPE_SETUP.md` for detailed instructions.

**Fallback if not ready**: Lemon Squeezy (5-minute setup) or manual email collection. Never cancel launch over payment infrastructure.

---

### Blocker 2 — Resend (Email Delivery)

**Owner**: Human (Nalin) | **Deadline**: March 20

Current state: Email infrastructure is fully built (nurture sequence, daily cron, unsubscribe flow) but Resend account and domain verification are required.

Setup steps:
- [ ] Create Resend account at resend.com
- [ ] Add domain `thewebsite.app`
- [ ] Add DNS records (MX + DKIM) to DNS provider
- [ ] Verify domain in Resend dashboard
- [ ] Add to Vercel env vars:
  - `RESEND_API_KEY` = `re_...`
  - `CRON_SECRET` = any strong random string (`openssl rand -hex 32`)
- [ ] Re-enable daily email cron in Vercel dashboard (Settings → Cron Jobs)
- [ ] Test: sign up with own email, confirm welcome email arrives
- [ ] Test: unsubscribe flow works end-to-end

See `RESEND_SETUP.md` for detailed instructions.

**Fallback if cron fails on launch day**: Send launch email manually via Resend dashboard. Do not skip the launch email.

---

## 4. Manual Setup Items Summary

Both setup items require human action — code agents cannot complete them.

| Item | Owner | Deadline | Fallback |
|------|-------|----------|---------|
| Stripe account + live keys + checkout page update | Human | March 20 | Lemon Squeezy or email collection |
| Resend account + domain verify + cron enable | Human | March 20 | Manual send via Resend dashboard |

---

## 5. Pre-Launch Countdown (March 14–22)

> Blog posts are already live (all 7 published March 14). Repurpose Days 4 and 8 for HN/Reddit submissions rather than blog publishing.

### March 14–16 (Days 1–3) — Community & Content

- [ ] Post Twitter Day 1 update
- [ ] Send re-engagement email to existing 12 subscribers
- [ ] Submit blog post #1 to HN as "Show HN" (Monday = peak HN traffic)
- [ ] Post r/ClaudeAI thread: "I've been running Claude as an autonomous CEO for 2 weeks"
- [ ] Post r/LocalLLaMA thread: "Multi-agent architecture for a real autonomous business"

### March 17–19 (Days 4–6) — Stripe, Resend, Outreach

- [ ] **Set up Stripe** (see Blocker 1 above)
- [ ] **Set up Resend** (see Blocker 2 above)
- [ ] Send 5 sponsor cold outreach emails (Modal, Replicate, Together AI, Vercel, Railway)
- [ ] DM 3 AI YouTubers with collab angle
- [ ] Post Twitter viral threads (#1: "9 lessons from 30 AI workers", #2: "5-day build story")
- [ ] Post r/entrepreneur: "The real economics of running a business with AI agents"
- [ ] Post r/SideProject: launch story angle

### March 20–21 (Days 7–8) — Test Everything

- [ ] Test Stripe payment end-to-end (test mode → live mode)
- [ ] Test email nurture sequence: signup → Email 1 → Email 2 → Email 3
- [ ] Test unsubscribe flow
- [ ] Full site walkthrough: check every page for 404s and broken forms
- [ ] Send "founders pricing ends soon" email to subscriber list
- [ ] Follow up on sponsor outreach
- [ ] Draft and save HN "Show HN" post (see template in `LAUNCH_CHECKLIST.md`)
- [ ] Write and schedule Twitter launch thread for 9am March 23

### March 22 (Day 9 — Pre-Launch Eve)

- [ ] **GO/NO-GO decision** — verify all REQUIRED criteria from Section 1
- [ ] Send "founders pricing ends TONIGHT" email
- [ ] Final infrastructure checks:
  - [ ] Vercel deployment green
  - [ ] `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` set
  - [ ] `RESEND_API_KEY`, `CRON_SECRET` set
  - [ ] Email cron enabled in Vercel dashboard
  - [ ] Analytics tracking firing
  - [ ] Stripe live mode active
- [ ] Stage HN "Show HN" post (ready to submit at 9am Monday)
- [ ] Schedule Twitter launch thread for 9am Monday
- [ ] Queue launch day emails in Resend

---

## 6. Launch Day — March 23

### 7:00 AM PT
- [ ] Check Vercel deployment status (must be green)
- [ ] Load thewebsite.app — confirm homepage renders
- [ ] Check subscriber count in `/admin`
- [ ] Confirm launch email is staged in Resend, ready for 9am

### 8:00 AM PT — Final System Tests
- [ ] `/` loads correctly
- [ ] `/course` loads — all 10 modules listed
- [ ] `/pricing` shows $67 founders / $97 standard
- [ ] `/checkout` loads — Stripe Checkout works (run a $1 test charge, then void)
- [ ] `/faq`, `/starter-kit`, `/blog` load
- [ ] Email signup form: submit test email → confirm welcome email arrives
- [ ] Unsubscribe flow: test email → confirm it unsubscribes cleanly
- [ ] Analytics: load homepage in incognito → confirm pageview in `/admin`

### 9:00 AM PT — Launch Ignition (execute in order, within 15 min)

1. [ ] Submit "Show HN: I had an AI CEO run my company for 9 days — here's the full ops breakdown" to Hacker News
2. [ ] Post Twitter launch thread (or publish scheduled post)
3. [ ] Send launch announcement email to full subscriber list via Resend
4. [ ] Post to r/ClaudeAI: "We launched. Here's the full story."

### 9:30 AM PT — Seeding
- [ ] Share HN link in relevant Slack/Discord communities
- [ ] DM 5–10 AI builder contacts with personal launch note
- [ ] Reply to first HN and Twitter comments immediately (velocity matters for HN ranking)

### 10:00 AM – 12:00 PM PT — Active Engagement
- [ ] Monitor HN — respond to every comment within 15 min
- [ ] Monitor Twitter thread — like and respond to replies
- [ ] Monitor Reddit — engage authentically
- [ ] Watch Stripe dashboard for first sales
- [ ] Watch subscriber growth (refresh `/admin`)

**KPI checkpoint at noon:**

| Metric | Target |
|--------|--------|
| HN rank | Top 30 by 11am |
| New subscribers since 9am | 15+ |
| Stripe sales | Any (even 1 validates model) |

### 12:00 PM PT — Midday Update
- [ ] Post Twitter midday update with real numbers
- [ ] Send re-engagement email to anyone who opened launch email but didn't click

### 1:00 – 3:00 PM PT — Secondary Channels
- [ ] Post on LinkedIn
- [ ] Submit blog posts to dev.to and Hashnode (canonical URL set — safe to cross-post)
- [ ] Send remaining sponsor outreach follow-ups

### 3:00 PM PT — Metrics Snapshot

| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 120+ | |
| New subscribers since 9am | 20+ | |
| Stripe revenue | $1+ | |
| HN rank at peak | Top 30 | |
| Top traffic source | | |

**Decision tree**:
- HN trending → stay on HN replies, don't fragment attention
- Twitter driving traffic → post additional tweet with real-time social proof
- Email converting → send "last hours for founders pricing" reminder early

### 7:00 PM PT — Founders Pricing Deadline
- [ ] Send email: "Founders pricing ($67) ends at midnight"
- [ ] Post final Twitter: "Midnight is the last chance for founders pricing"

### 11:00 PM PT — Day Wrap
- [ ] Post thank-you tweet with final day-1 numbers
- [ ] Log: subscribers, sales, revenue, top traffic source
- [ ] Draft Day 2 plan (double down on what worked)

---

## 7. Contingency Plans

| Scenario | Response |
|----------|----------|
| Stripe not ready on launch day | Use Lemon Squeezy (5-min setup) or collect emails manually — announce first, fix payment second |
| Email cron fails | Send manually via Resend dashboard — do not let email failure stop the launch |
| < 5 HN upvotes by 10am | Shift energy to Reddit and Twitter; save second HN for pro tier launch |
| < 80 subs by March 22 | Launch anyway — frame as "exclusive founding cohort"; offer permanent Pro to first 80 |
| Site down | Check Vercel dashboard; post on Twitter "brief downtime, back in minutes"; do not go silent |

---

## 8. Key Metrics Targets

| Metric | Pre-Launch (March 22) | Launch Day | 7-Day Post |
|--------|-----------------------|------------|------------|
| Subscribers | 95+ | 120 | 200 |
| Stripe revenue | $0 | $67+ (1 sale) | $500+ |
| HN upvotes | — | 50+ | — |
| Site uniques | — | 500 | 2,000 |
| Email open rate | — | 40%+ | — |
| Course starts | — | 30+ | 100 |

---

## 9. Key Links (bookmark before launch)

| Resource | URL |
|----------|-----|
| Site | thewebsite.app |
| Vercel dashboard | vercel.com/dashboard |
| Stripe dashboard | dashboard.stripe.com |
| Resend dashboard | resend.com |
| Site analytics | thewebsite.app/admin |
| HN submit | news.ycombinator.com/submit |

---

## 10. Supporting Documents

| Document | Purpose |
|----------|---------|
| `STRIPE_SETUP.md` | Step-by-step Stripe account and integration setup |
| `RESEND_SETUP.md` | Step-by-step Resend account and domain setup |
| `LAUNCH_DAY_STRATEGY.md` | Ready-to-post copy for HN, Reddit, Twitter |
| `CONTENT_CALENDAR_30_DAYS.md` | Post-launch content schedule |
| `GROWTH_PLAYBOOK.md` | Community engagement playbook and templates |
| `DEPLOYMENT_VERIFICATION.md` | Smoke tests and deployment verification |

---

*This document is the single source of truth for launch readiness. All other launch documents are preserved for reference but this file governs the Go/No-Go decision and launch execution. Last updated: March 14, 2026.*
