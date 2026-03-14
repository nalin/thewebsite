# Final Launch-Day Checklist

**Launch Date**: Monday, March 23, 2026
**Prepared By**: Worker Agent — Address Issues from Pre-Launch Verification
**Prepared**: March 14, 2026
**Based On**: PRE_LAUNCH_VERIFICATION_REPORT.md

---

## Fixes Applied (Code, Done)

| # | Issue | Fix | Status |
|---|-------|-----|--------|
| 1 | OG image missing — social share previews broken | Created `app/opengraph-image.tsx` using Next.js dynamic OG image generation (edge runtime). Removed hardcoded `/og-image.png` refs from `layout.tsx`. | ✅ Done |
| 2 | `layout.tsx` said "9-module course" (wrong) | Updated all 3 description strings to "10-module course" | ✅ Done |
| 3 | FAQ said "all 9 modules" and "Modules 6–9" for Pro | Updated to "all 10 modules" and "Modules 6–10" | ✅ Done |

---

## Manual Setup Required (Human Only)

These cannot be done by a code agent — they require account creation and environment variable configuration.

### A. Stripe — Payment Processing

**Owner**: Human (Nalin)
**Deadline**: March 20 (3 days before launch)

- [ ] Create Stripe account at stripe.com
- [ ] Complete identity verification for live mode
- [ ] Switch account to live mode
- [ ] Create product: "AI Agent Course — Pro Access"
  - One-time payment
  - Founders price: $67 (March 14–22)
  - Standard price: $97 (March 23+)
- [ ] Get live API keys from Stripe dashboard
- [ ] Add to Vercel env vars:
  - `STRIPE_SECRET_KEY` = `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
  - `STRIPE_WEBHOOK_SECRET` = from Stripe webhook config
- [ ] Test full payment flow in Stripe test mode first
- [ ] Switch checkout page from email-only placeholder to Stripe Checkout

**Fallback**: If Stripe isn't ready by launch, use [Lemon Squeezy](https://lemonsqueezy.com) (5-minute setup) or collect emails manually and charge later. Do NOT delay launch.

See: `STRIPE_SETUP.md` for detailed instructions.

---

### B. Resend — Email Delivery

**Owner**: Human (Nalin)
**Deadline**: March 20 (3 days before launch)

- [ ] Create Resend account at resend.com
- [ ] Add domain `thewebsite.app`
- [ ] Add DNS records (MX + DKIM) to your DNS provider
- [ ] Verify domain in Resend dashboard
- [ ] Get API key
- [ ] Add to Vercel env vars:
  - `RESEND_API_KEY` = `re_...`
  - `CRON_SECRET` = any strong random string (e.g. `openssl rand -hex 32`)
- [ ] Re-enable daily email cron in Vercel dashboard (Settings → Cron Jobs)
- [ ] Test: sign up with your own email, confirm welcome email arrives
- [ ] Test: unsubscribe flow works end-to-end

**Fallback**: If Resend isn't ready, send launch email manually via Resend dashboard (one-off send). Do NOT skip the launch email.

See: `RESEND_SETUP.md` for detailed instructions.

---

## Day-by-Day Pre-Launch Checklist (March 14–22)

### March 14–16 (Days 1–3) — Content & Community

- [ ] Post Twitter Day 1 update (see CONTENT_CALENDAR_30_DAYS.md)
- [ ] Send re-engagement email to founding 12 subscribers
- [ ] Submit blog post #1 to HN as "Show HN" (Monday = peak HN traffic)
- [ ] Post r/ClaudeAI thread
- [ ] Post r/LocalLLaMA thread

> Note: All 7 blog posts are already live (published March 14). Skip "publish blog post" tasks — repurpose those days for HN/Reddit submissions instead.

---

### March 17–19 (Days 4–6) — Stripe, Resend, Outreach

- [ ] Set up Stripe (see Section A above)
- [ ] Set up Resend (see Section B above)
- [ ] Send 5 sponsor cold outreach emails (Modal, Replicate, Together AI, Vercel, Railway)
- [ ] DM 3 AI YouTubers with collab angle
- [ ] Build `/sponsors` page (optional, see LAUNCH_CHECKLIST.md)

---

### March 20–21 (Days 7–8) — Test Everything

- [ ] Test Stripe payment end-to-end (test mode → live mode)
- [ ] Test email nurture sequence: signup → Email 1 → Email 2 → Email 3
- [ ] Test unsubscribe flow
- [ ] Full site walkthrough: check every page for 404s and broken forms
- [ ] Send "founders pricing ends soon" email to subscriber list
- [ ] Follow up on sponsor outreach

---

### March 22 (Day 9 — Pre-Launch Eve)

- [ ] Send "founders pricing ends TONIGHT" email
- [ ] Final infrastructure checks:
  - [ ] Vercel deployment green ✅
  - [ ] All env vars set (STRIPE, RESEND, CRON_SECRET)
  - [ ] Analytics tracking firing
  - [ ] Email cron enabled
  - [ ] Stripe live mode active
- [ ] Stage HN "Show HN" post (ready to submit at 9am Monday)
- [ ] Schedule Twitter launch thread for 9am Monday
- [ ] Queue launch day emails

---

## March 23 — Launch Day (Hour-by-Hour)

### 7:00 AM PT
- [ ] Check Vercel deployment status (must be green)
- [ ] Verify overnight subscriber count

### 8:00 AM PT — Final Checks
- [ ] Site up: homepage, course, pricing, starter-kit
- [ ] Email signup form works
- [ ] Stripe payment flow works
- [ ] Analytics dashboard recording
- [ ] Launch email queued for 9am

### 9:00 AM PT — Ignition (in order, within 15 min)
1. [ ] Submit "Show HN: I had an AI CEO run my company for 9 days" to Hacker News
2. [ ] Post Twitter launch thread
3. [ ] Send launch announcement email to full subscriber list
4. [ ] Post r/ClaudeAI: "We launched. Here's the full story."

### 9:30 AM PT — Seeding
- [ ] Share HN link in Slack/Discord communities
- [ ] DM 5–10 AI builder contacts with personal launch note
- [ ] Reply to first HN and Twitter comments immediately

### 10am–12pm PT — Active Engagement
- [ ] Monitor HN rank — respond to every comment within 15 min
- [ ] Monitor Twitter replies — like, respond, retweet
- [ ] Watch Stripe dashboard for first sales
- [ ] Check subscriber growth

**KPI check at noon**:
- HN: aim for top 30 by 11am
- New subs since 9am: 15+
- Stripe: any sales?

### 12:00 PM — Midday Update
- [ ] Post Twitter midday update with real numbers
- [ ] Email "still time for founders pricing" to openers who didn't click

### 1–3 PM — Secondary Channels
- [ ] Post on LinkedIn
- [ ] Submit blogs to dev.to, Medium (canonical URL set)
- [ ] Send sponsor follow-ups

### 3 PM — Metrics Snapshot
- [ ] Log: total subs, new subs since 9am, Stripe revenue, HN rank, top traffic source
- [ ] Adjust focus: if HN is hot → stay there; if Twitter → post social proof tweet; if email → send last-chance reminder

### 7 PM — Founders Pricing Deadline Email
- [ ] Send: "Founders pricing ($67) ends at midnight"
- [ ] Post final Twitter urgency message

### 11 PM — Day Wrap
- [ ] Send thank-you tweet with final day-1 numbers
- [ ] Log: subscribers, sales, revenue, top sources
- [ ] Draft Day 2 plan (double down on what worked)

---

## Contingency Plans

| Scenario | Response |
|----------|----------|
| Stripe not ready on launch day | Use Lemon Squeezy or collect emails manually — announce first, fix payment second |
| Email cron fails | Send manually via Resend dashboard |
| < 5 HN upvotes by 10am | Shift to Reddit + Twitter; save second HN for premium launch |
| < 80 subs by March 22 | Launch anyway as "exclusive founding cohort"; offer permanent Pro to first 80 |
| Site down | Check Vercel status; if incident, post on Twitter "brief downtime, back in minutes" |

---

## Key Metrics Targets

| Metric | Pre-Launch (March 22) | Launch Day | 7-Day Post |
|--------|-----------------------|------------|------------|
| Subscribers | 95+ | 120 | 200 |
| Stripe revenue | $0 | $67+ (1 sale) | $500+ |
| HN upvotes | — | 50+ | — |
| Site uniques | — | 500 | 2,000 |
| Email open rate | — | 40%+ | — |

---

*This checklist supersedes the pre-launch verification items. Code fixes are done. Remaining blockers (Stripe, Resend) require manual human setup — see the linked setup guides in the repo.*
