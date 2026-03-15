# Launch Day Runbook — March 23, 2026

**Status**: Authoritative operational guide
**Launch Date**: Monday, March 23, 2026
**Launch Time**: 9:00 AM PT (primary ignition)
**Author**: Worker Agent — synthesized from all pre-launch docs
**Last Updated**: March 15, 2026

> This runbook is the single source of truth for launch operations. It synthesizes and supersedes LAUNCH_DAY_CHECKLIST.md, FINAL_LAUNCH_DAY_CHECKLIST.md, LAUNCH_DAY_STRATEGY.md, and PRE_LAUNCH_VERIFICATION_REPORT.md. Reference those files for deeper context; operate from this one.

---

## Table of Contents

1. [Pre-Launch Checklist (March 14–22)](#1-pre-launch-checklist-march-1422)
2. [Launch Day Hour-by-Hour (March 23)](#2-launch-day-hour-by-hour-march-23)
3. [Post-Launch Monitoring (March 24+)](#3-post-launch-monitoring-march-24)
4. [Escalation Procedures](#4-escalation-procedures)
5. [Contact Information and Resources](#5-contact-information-and-resources)

---

## 1. Pre-Launch Checklist (March 14–22)

### Infrastructure Setup — Due March 20

These require human action (cannot be automated). Block all other pre-launch tasks on these.

#### A. Stripe — Payment Processing

**Owner**: Nalin (human)
**Deadline**: March 20

- [ ] Create Stripe account at stripe.com
- [ ] Complete identity verification and switch to live mode
- [ ] Create product: "AI Agent Course — Pro Access"
  - Founders price: **$67** (valid through March 22 midnight)
  - Standard price: **$97** (from March 23 onward)
- [ ] Get live API keys from Stripe Dashboard → Developers → API keys
- [ ] Add to Vercel environment variables:
  - `STRIPE_SECRET_KEY` = `sk_live_...`
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
  - `STRIPE_WEBHOOK_SECRET` = from Stripe → Developers → Webhooks
- [ ] Test full payment flow end-to-end in Stripe test mode
- [ ] Switch checkout page from email-only placeholder to Stripe Checkout
- [ ] Redeploy to Vercel and verify `/checkout` processes payments

**Fallback if not ready by March 23**: Use Lemon Squeezy (5-minute setup) or collect payment emails manually. Do NOT delay launch for Stripe.

See: `STRIPE_SETUP.md`

---

#### B. Resend — Email Delivery

**Owner**: Nalin (human)
**Deadline**: March 20

- [ ] Create Resend account at resend.com
- [ ] Add domain `thewebsite.app` under Domains
- [ ] Add DNS records (MX + DKIM) provided by Resend to your DNS provider
- [ ] Verify domain in Resend dashboard (allow up to 24 hours for DNS propagation)
- [ ] Create API key in Resend dashboard
- [ ] Add to Vercel environment variables:
  - `RESEND_API_KEY` = `re_...`
  - `CRON_SECRET` = run `openssl rand -hex 32` to generate
  - `NEXT_PUBLIC_BASE_URL` = `https://thewebsite.app`
- [ ] Re-enable daily email cron in Vercel dashboard (Settings → Cron Jobs)
- [ ] Test: submit your own email at thewebsite.app → confirm welcome email arrives in inbox (not spam)
- [ ] Test: complete the unsubscribe flow from the welcome email

**Fallback if not ready by March 23**: Send launch email manually from the Resend dashboard one-off. Do NOT skip the launch email.

See: `RESEND_SETUP.md` and `DAILY_EMAIL_SETUP.md`

---

### Content and Community — March 14–22

#### March 14–16 (Days 1–3)

- [ ] Post Twitter Day 1 update (see `CONTENT_CALENDAR_30_DAYS.md` — Week 1 schedule)
- [ ] Send re-engagement email to the original 12 founding subscribers if not yet done
- [ ] Submit to r/SideProject on March 21 — post copy in `LAUNCH_DAY_STRATEGY.md`
- [ ] Submit to r/entrepreneur on March 22 — post copy in `LAUNCH_DAY_STRATEGY.md`

> Note: All 7 blog posts are already live as of March 14. "Publish blog post" tasks from the original calendar are already complete. Repurpose those days for Reddit/HN submissions instead.

#### March 17–19 (Days 4–6)

- [ ] Set up Stripe (see Section A above)
- [ ] Set up Resend (see Section B above)
- [ ] Send 5 sponsor cold outreach emails (Modal, Replicate, Together AI, Vercel, Railway)
- [ ] DM 3 AI YouTubers with collab angle — pitch free course as resource

#### March 20–21 (Days 7–8)

- [ ] Test Stripe payment end-to-end in live mode (use $1 test charge then void it)
- [ ] Test email nurture sequence: signup → Email 1 (welcome) → Email 2 (day 3) → Email 3 (day 7 Pro offer)
- [ ] Test unsubscribe flow from each email
- [ ] Full site walkthrough: check every page for 404s, broken forms, broken images
- [ ] Send "founders pricing ends soon" email to full subscriber list
- [ ] Follow up on sponsor outreach

#### March 22 (Eve — Day Before Launch)

- [ ] Send "founders pricing ends TONIGHT at midnight" email to full list
- [ ] Final infrastructure verification:
  - [ ] Vercel deployment is green (no failed builds on `main`)
  - [ ] All env vars confirmed: `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`, `CRON_SECRET`, `NEXT_PUBLIC_BASE_URL`
  - [ ] Analytics tracking is firing (load homepage in incognito, verify `/admin` shows pageview)
  - [ ] Daily email cron is enabled in Vercel → Settings → Cron Jobs
  - [ ] Stripe live mode is active (not test mode)
  - [ ] OG image is deployed: paste `https://thewebsite.app` into Twitter Card Validator
- [ ] Stage HN "Show HN" post — copy the title and body from `LAUNCH_DAY_STRATEGY.md` into a draft. Do NOT submit yet.
- [ ] Schedule Twitter launch thread for 9:00 AM PT on March 23 (or keep draft ready to post manually)
- [ ] Queue launch day email in Resend for 1:00 PM PT on March 23

---

### Pre-Launch Gate Check (Complete by March 22 11:59 PM)

All items must be green before launch. If any are red, resolve tonight.

| Item | Status |
|------|--------|
| Stripe account live mode active | |
| Test payment completes successfully | |
| Resend domain `thewebsite.app` verified | |
| Test signup email arrives in inbox (not spam) | |
| OG image appears in Twitter Card Validator | |
| `STRIPE_SECRET_KEY` set in Vercel production | |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` set in Vercel | |
| `RESEND_API_KEY` set in Vercel production | |
| `CRON_SECRET` set in Vercel production | |
| Vercel deployment is green (main branch) | |
| HN post drafted and ready to submit | |
| Twitter thread written and ready to post | |
| Launch email queued for 1pm PT | |

---

## 2. Launch Day Hour-by-Hour (March 23)

### 7:00 AM PT — Wake-Up Check

- [ ] Open Vercel dashboard — confirm deployment status is green
- [ ] Load `https://thewebsite.app` in browser — confirm homepage renders without errors
- [ ] Load `/course`, `/pricing`, `/checkout`, `/faq`, `/blog`, `/starter-kit`
- [ ] Check subscriber count in `/admin` — note baseline number
- [ ] Confirm launch email is queued in Resend for 1pm PT
- [ ] Confirm HN draft is saved and ready

**If site is down at 7am**: Go immediately to Section 4 — Escalation: Site Down.

---

### 8:00 AM PT — Final System Tests

Run these manually, in order. Do not skip.

**Site availability**
- [ ] `/` — homepage loads, hero form renders
- [ ] `/course` — all 10 modules listed
- [ ] `/pricing` — shows $67 founders / $97 standard, founders deadline shown
- [ ] `/checkout` — Stripe Checkout loads and processes (do a $1 test charge if unsure, then void it in Stripe)
- [ ] `/faq` — loads
- [ ] `/starter-kit` — loads, email form renders
- [ ] `/blog` — loads with all blog posts
- [ ] `/course/module-1` through `/course/module-10` — spot check 3 modules

**Forms**
- [ ] Homepage email signup: submit a test email → confirm 200 response and welcome email arrives within 2 minutes
- [ ] `/starter-kit` email form: submit → confirm 200 response
- [ ] Unsubscribe: use the link in the welcome email → confirm it unsubscribes cleanly

**Payment**
- [ ] Go to `/checkout` → complete a Stripe test purchase (use test card `4242 4242 4242 4242`) → confirm `/course/success` renders
- [ ] Check Stripe dashboard — test payment shows up
- [ ] Confirm Stripe is in **live mode** (not test mode) before 9am

**Analytics**
- [ ] Load homepage in incognito window → open `/admin` → confirm pageview registered

**If any test fails at 8am**: You have 60 minutes to fix it. Prioritize: payment > email > site availability > analytics. If not fixed by 8:55, check contingency in Section 4.

---

### 8:45 AM PT — Pre-Ignition Staging

- [ ] Open the HN draft — read it once more. Do not edit. Copy the title and body.
- [ ] Open the Twitter draft thread — confirm all 8 tweets are correct. Update real-time numbers (subscriber count, PRs merged, etc.) if needed.
- [ ] Confirm all channels are ready:
  - HN: draft ready to submit
  - Twitter: thread staged or scheduled for 9:00am
  - Reddit (r/ClaudeAI): post copy from `LAUNCH_DAY_STRATEGY.md` ready to paste
  - Email: queued in Resend for 1pm PT

---

### 9:00 AM PT — Launch Ignition

Execute in this exact order, within 15 minutes. Speed matters — coordinated multi-channel launch amplifies each channel.

**Step 1 — Twitter** (9:00 AM exactly)
- [ ] Post or publish scheduled Twitter launch thread (8 tweets)
- Copy from `LAUNCH_DAY_STRATEGY.md` → "Twitter Launch Thread" section
- Add `#buildinpublic` to Tweet 1 only

**Step 2 — Reddit r/ClaudeAI** (9:05 AM)
- [ ] Post: "I've been running Claude as an autonomous CEO for 2 weeks. 5 things that surprised me."
- Copy exact body from `LAUNCH_DAY_STRATEGY.md` → "Post 3: r/ClaudeAI"
- Do not cross-post to other subreddits today

**Step 3 — HackerNews** (9:00 AM ET / 12:00 PM PT)
- [ ] Submit "Show HN: I'm an AI agent that built a free course on AI agents while running a real business"
- HN optimal time is 9am ET (noon PT) — coordinate accordingly
- Within 60 seconds of submission, post the first comment (pre-written in `LAUNCH_DAY_STRATEGY.md` → "First Comment")
- Note the HN post URL — add it to the Twitter thread as a reply

**Step 4 — Email** (1:00 PM PT, as scheduled)
- [ ] Confirm Resend sends the launch email at 1pm PT to full subscriber list
- Subject: "We launched. The free course is live."
- Full email body in `LAUNCH_DAY_STRATEGY.md` → "Launch Email" section
- Do not send earlier — give HN/Twitter time to build social proof first

---

### 9:30 AM PT — Seeding

- [ ] Share HN link in any relevant Slack communities or Discord servers (post the link, not a request to upvote — HN bans vote solicitation)
- [ ] DM 5–10 AI builder contacts with a personal note — not a mass blast. One sentence: "Launched today, thought you'd find this interesting: [link]"
- [ ] Reply to the first HN comments immediately — early comment velocity affects HN ranking
- [ ] Reply to the first Twitter thread replies — like and respond

---

### 10:00 AM – 12:00 PM PT — Active Engagement

Your single job during this window: be present in every active thread.

- [ ] Monitor HN — respond to every substantive comment within 15 minutes
  - Good engagement: questions about architecture, skepticism about autonomy, course content questions
  - Bad engagement: no comments, only downvotes — if this happens, see Section 4: HN Not Gaining Traction
- [ ] Monitor Twitter thread — like and respond to replies, quote-tweet notable ones
- [ ] Monitor Reddit r/ClaudeAI — engage authentically, answer technical questions
- [ ] Watch Stripe dashboard for first sales
- [ ] Watch subscriber count growth (refresh `/admin`)

**KPI Checkpoint at 12:00 PM PT**:

| KPI | Target | Actual |
|-----|--------|--------|
| HN rank | Top 30 by 11am ET | |
| HN upvotes | 10+ in first hour | |
| New subscribers since 9am | 15+ | |
| Stripe: any sales | 1+ | |
| Course page views | 100+ | |

If HN rank < 30 at noon: share HN link in 3 more communities now.
If 0 subscribers after 3 hours: recheck email signup form is working.
If 0 Stripe sales: verify `/checkout` is in live mode, not a placeholder.

---

### 12:00 PM PT — Midday Update

- [ ] Post Twitter midday update: "3 hours in. [X] new subscribers. [Y] sales. Here's what's working: [observation]"
- [ ] If HN thread is still active (active = comments still coming in), post an update comment with live data
- [ ] Send re-engagement sequence to anyone who opened the launch email but didn't click through (Resend → Broadcasts → check open rates)

---

### 1:00 PM – 3:00 PM PT — Secondary Channels

- [ ] Post on LinkedIn: professional angle — "We shipped an AI agent course. Built entirely by AI." Link to the blog post.
- [ ] Submit best blog post to dev.to and Hashnode (canonical URL is set — safe to cross-post without SEO penalty)
- [ ] Follow up on any sponsor outreach emails sent pre-launch — mention launch day momentum

---

### 3:00 PM PT — Afternoon Metrics Snapshot

Record actual numbers:

| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 120+ | |
| New subscribers since 9am | 20+ | |
| Stripe revenue | $67+ (1 sale) | |
| HN rank at peak | Top 30 | |
| HN upvotes | 50+ | |
| HN comments | 10+ | |
| Twitter thread impressions | 2,000+ | |
| Top traffic source | | |

**Decision tree based on 3pm data**:
- HN trending (top 30, active comments) → stay focused on HN replies; do not fragment attention
- Twitter driving traffic → post an additional tweet with real-time social proof numbers
- Email converting (sales coming from email opens) → send "last few hours for founders pricing" reminder early (move up from 7pm)
- Nothing working → post to r/SideProject (alternate channel not yet used today)

---

### 4:00 PM – 7:00 PM PT — Sustained Engagement

- [ ] Post Twitter evening update: "End of day, [X] hours in. [X] subscribers, [Y] sales. What surprised me: [honest observation]"
- [ ] If subscribers crossed 100: post "We hit 100." tweet — social proof accelerates more signups
- [ ] Continue engaging all active threads (HN tail lasts 12–24 hours)
- [ ] Check if YouTube / newsletter prospects replied to pre-launch outreach — respond immediately if so

---

### 7:00 PM PT — Founders Pricing Deadline

- [ ] Send final email to full list: "Founders pricing ($67) ends at midnight tonight."
  - Subject: "Last chance: founders pricing ends at midnight"
  - Keep it short — one sentence about what they get, one sentence about deadline, link to `/checkout`
- [ ] Post final Twitter urgency message: "Midnight is the deadline for founders pricing ($67 → $97). [X] people have already joined. Here's what's included: [link]"
- [ ] Update Stripe pricing at midnight — switch founders tier to $97

---

### 9:00 PM PT — Wind-Down

- [ ] Respond to all remaining comments and DMs across all channels
- [ ] Review Stripe for any last-minute purchases
- [ ] Log final Day 1 metrics in the table above
- [ ] Check Vercel Logs for any errors or anomalies during high-traffic period

---

### 11:00 PM PT — Day Wrap

- [ ] Post "thank you" tweet: "Day 1 done. [X] subscribers, [Y] sales, [Z] revenue. Here's what surprised me: [honest reflection]"
- [ ] Write Day 2 plan: what to double down on based on what actually drove signups. Be specific.
- [ ] Switch founders pricing in Stripe if the 50-seat target was reached (move to $97 across all new sales)
- [ ] Archive today's metrics — record in a permanent doc for future reference

---

## 3. Post-Launch Monitoring (March 24+)

### Key Metrics to Watch Daily

Check these every morning at 7am:

| Metric | Where to Check | Healthy Range |
|--------|---------------|---------------|
| Site uptime | Vercel Dashboard → Deployments | Green / no incidents |
| Daily new subscribers | `/admin` analytics | 5+ per day first week |
| Email open rate | Resend Dashboard → Broadcasts | 35%+ |
| Email unsubscribe rate | Resend Dashboard | Under 2% per send |
| Stripe revenue | Stripe Dashboard → Payments | Growing daily |
| Daily email cron | Vercel Logs → `api/cron/daily-email` | Success + no errors |
| Smoke test status | GitHub Actions → deployment-verification | Green |

---

### Week 1 Post-Launch Actions (March 24–29)

| Date | Action |
|------|--------|
| March 24 | Post HN follow-up if gaining traction (20+ points): share real data |
| March 24 | Continue engaging Reddit r/ClaudeAI comments (48-hour tail) |
| March 25 | Post to r/LangChain — multi-agent architecture deep dive (copy in `LAUNCH_DAY_STRATEGY.md`) |
| March 25 | HN: "Show HN: Module 10 — Building Your First AI Agent Business" (per CONTENT_CALENDAR) |
| March 27 | Post to r/MachineLearning or r/artificial — research-adjacent post |
| March 28 | Send first Pro conversion email to full list (Email 3 in nurture sequence) |

---

### Blog Release Cadence (Post-Launch)

All 7 blog posts are already live as of March 14. Post-launch blog strategy is about cross-promotion, not new publishing:

- **Week 1**: Submit existing posts to HN, Reddit, dev.to one at a time (one per day, staggered)
- **Week 2**: Begin drafting post-launch blog post: "Launch Day by the Numbers" — publish after 7 days of data
- **Week 3**: Publish Module 10 companion post if not already live
- **Week 4**: Publish "30-day retrospective" post — what worked, what didn't, real metrics

---

### When to Send the First Post-Launch Email

- **If launch exceeds expectations** (50+ new subscribers on Day 1): send a "Day 1 recap" email on March 24 with real numbers. Keep it short, data-forward.
- **Normal launch** (15–50 new subscribers): send the scheduled Day 3 nurture email (Email 2 in sequence) on March 26.
- **If launch underperformed** (under 15 new subscribers): send a candid "here's what we tried and what we're doing next" email on March 25 — authenticity can convert skeptics.

The automated daily email cron sends every day at 9am PT (5pm UTC). Do not disable it. Monitor open rates in Resend.

---

### Common Issues and Fixes

#### Email cron not firing

1. Check Vercel Dashboard → Settings → Cron Jobs — confirm the job is enabled
2. Check Vercel Logs → filter by `api/cron/daily-email` — look for error messages
3. Verify `CRON_SECRET` and `RESEND_API_KEY` are set correctly in Vercel env vars
4. Test manually: `curl -X GET https://thewebsite.app/api/cron/daily-email -H "Authorization: Bearer $CRON_SECRET"`
5. If still failing: send the daily update manually via Resend Dashboard → Broadcasts

#### Stripe payments failing

1. Check Stripe Dashboard → Events — look for failed payment events
2. Verify `STRIPE_SECRET_KEY` is the live key (starts `sk_live_`) not test key (`sk_test_`)
3. Check the Stripe webhook endpoint is active: Stripe Dashboard → Developers → Webhooks
4. Verify `STRIPE_WEBHOOK_SECRET` matches what's in Vercel env vars
5. Test with a fresh incognito window — rule out browser cache issues
6. Escalate: switch to Lemon Squeezy temporarily if Stripe cannot be resolved within 1 hour

#### Site 404 errors or broken pages

1. Check GitHub Actions for failed deployments after recent pushes
2. Check Vercel Dashboard → Deployments for error logs
3. Run smoke tests locally: `node scripts/smoke-test.js https://thewebsite.app`
4. If a recent PR is the cause: roll back in Vercel (Deployments → previous green build → "Promote to Production")
5. Do not push a fix to `main` without testing locally first: `pnpm build`

#### High bounce rate / low email engagement

1. Check that emails are not landing in spam — test from multiple providers (Gmail, Outlook)
2. Verify SPF/DKIM records are set correctly in Resend
3. Review subject line — open rates under 20% suggest subject line is the problem
4. Check unsubscribe rate — above 5% on a single send means the content is off-target or the list is cold
5. Reduce email frequency if unsubscribes spike (pause daily cron, switch to 3x/week)

#### No sales after 48 hours

1. Confirm `/checkout` is actually processing payments (not the placeholder email form)
2. Check pricing page — ensure founders price and urgency are both visible
3. Send a "last chance" email earlier than planned
4. Add a 1:1 outreach component: DM the most engaged subscribers directly
5. If still no sales after 72 hours: consider lowering the founders price to $47 for the first 5 buyers to generate social proof

---

## 4. Escalation Procedures

### Stripe is Down or Broken on Launch Day

**Severity**: High — affects revenue, not launch
**Response time**: Act within 15 minutes of detecting

1. Do NOT cancel or delay the launch — announce first, fix payment second
2. Post on Twitter: "Payment system having a hiccup — if you want to lock in founders pricing, email me directly at [email] and I'll send a manual invoice."
3. Switch to Lemon Squeezy: create account at lemonsqueezy.com, create product in ~5 minutes, update `/checkout` link
4. Or: collect payment intent emails via the existing email form, then charge via Stripe payment links after fixing
5. Fix Stripe in the background, update `/checkout` once resolved, post a "payment is back" tweet

---

### Email System Fails on Launch Day

**Severity**: Medium — affects nurture, not launch core
**Response time**: Act within 30 minutes

1. Send the launch email manually via Resend Dashboard → Broadcasts (one-off send to all subscribers)
2. Log the failure: which endpoint, what error, what time
3. Do not let email failure stop the launch narrative on other channels
4. After launch: investigate root cause, patch, redeploy, confirm next cron fires successfully

---

### HN Post Gets < 5 Upvotes by 10 AM ET

**Severity**: Low — HN is one channel of many
**Response time**: Make the call at 10am ET sharp

1. Do not chase HN — sunk cost. Shift energy to Reddit and Twitter.
2. Do not re-submit the same post to HN today — wait minimum 30 days
3. Alternative HN angle: "Ask HN: Who's building with autonomous AI agents in production?" — story-in-comments format
4. Double down on Reddit: move r/SideProject post up to today if not yet submitted
5. Save the second HN submission slot for the Pro tier launch

---

### Site is Down on Launch Day

**Severity**: Critical
**Response time**: Act within 5 minutes

1. Check Vercel Dashboard immediately — look for failed deployment or service incident
2. Check Vercel Status Page: vercel-status.com
3. If recent push broke it: Vercel Dashboard → Deployments → find last green build → click "..." → "Promote to Production" (instant rollback, no code changes needed)
4. If Vercel infrastructure issue: check vercel-status.com, post on Twitter "Brief technical issue — we're on it. Back in [X] minutes." — transparency matters.
5. Do not go silent — even one tweet keeps trust intact during downtime
6. Once resolved: post "We're back. Everything is working." tweet

---

### Unexpected Traffic Spike (Good Problem)

**Severity**: Good problem to have
**Response time**: Monitor, don't act unless errors appear

1. Vercel handles auto-scaling — no action needed unless build errors appear
2. Turso SQLite also scales automatically for reads
3. Monitor: Vercel Analytics → watch for 5xx errors (server errors, not 4xx)
4. If errors appear under load: check Vercel function logs for timeout or memory errors
5. If database becomes a bottleneck: Turso supports read replicas — escalate to engineering

---

### Negative Press or Hostile Response

**Severity**: Depends on scope
**Response time**: Respond thoughtfully, not immediately

1. Hostile HN comments: engage directly and honestly. Do not deflect or get defensive. Skepticism is not hostility.
2. "Is this actually autonomous?" challenges: answer with specifics. What the human does (infrastructure, unblocking tool limits). What the AI does (everything else).
3. Factual errors in coverage: post a polite correction with links. Do not argue.
4. Coordinated negative campaign: document, do not engage in public, reach out privately if possible.
5. Privacy or legal concerns: escalate to Nalin immediately. Do not respond publicly without legal clarity.

---

## 5. Contact Information and Resources

### Dashboards (Bookmark These the Night Before)

| Service | URL | Purpose |
|---------|-----|---------|
| Site | https://thewebsite.app | Live production |
| Admin analytics | https://thewebsite.app/admin | Subscriber count, pageviews |
| Vercel Dashboard | https://vercel.com/dashboard | Deployments, logs, cron jobs |
| Stripe Dashboard | https://dashboard.stripe.com | Payments, revenue |
| Resend Dashboard | https://resend.com | Email sends, open rates, broadcasts |
| GitHub Actions | https://github.com/nalin/thewebsite/actions | Smoke test results |
| Vercel Status | https://vercel-status.com | Infrastructure incidents |
| Twitter | https://twitter.com/compose | Post launch thread |
| HackerNews | https://news.ycombinator.com/submit | Submit Show HN |

---

### Key Launch Copy Locations

| Content | File |
|---------|------|
| HN post title + body + first comment | `LAUNCH_DAY_STRATEGY.md` → "HackerNews Launch Post" |
| Twitter launch thread (8 tweets) | `LAUNCH_DAY_STRATEGY.md` → "Twitter Launch Thread" |
| Reddit r/ClaudeAI post | `LAUNCH_DAY_STRATEGY.md` → "Post 3: r/ClaudeAI" |
| Reddit r/SideProject post | `LAUNCH_DAY_STRATEGY.md` → "Post 1: r/SideProject" |
| Reddit r/entrepreneur post | `LAUNCH_DAY_STRATEGY.md` → "Post 2: r/entrepreneur" |
| Launch email body | `LAUNCH_DAY_STRATEGY.md` → "Launch Email" |
| Founders pricing deadline email | Write fresh — short, urgent, one link |
| Stripe setup instructions | `STRIPE_SETUP.md` |
| Resend setup instructions | `RESEND_SETUP.md` |
| Daily email cron setup | `DAILY_EMAIL_SETUP.md` |
| 30-day content calendar | `CONTENT_CALENDAR_30_DAYS.md` |

---

### Environment Variables Checklist

All must be set in Vercel → Project Settings → Environment Variables → Production.

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `STRIPE_SECRET_KEY` | Stripe live secret key | Stripe Dashboard → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe live publishable key | Stripe Dashboard → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | Stripe Dashboard → Webhooks |
| `RESEND_API_KEY` | Resend email API key | Resend Dashboard → API Keys |
| `CRON_SECRET` | Random secret securing cron endpoint | `openssl rand -hex 32` |
| `NEXT_PUBLIC_BASE_URL` | Production URL | `https://thewebsite.app` |

---

### Testing Commands

```bash
# Run smoke tests against production
node scripts/smoke-test.js

# Run smoke tests against a Vercel preview
node scripts/smoke-test.js https://my-preview.vercel.app

# Trigger daily email manually (replace $CRON_SECRET with actual value)
curl -X GET https://thewebsite.app/api/cron/daily-email \
  -H "Authorization: Bearer $CRON_SECRET"

# Build locally to catch errors before pushing
pnpm build
```

---

### Success Metrics — What Good Looks Like

#### Launch Day Targets (March 23)

| Metric | Threshold | Stretch |
|--------|-----------|---------|
| New email subscribers | 20 | 50+ |
| HN upvotes | 30 | 100+ |
| Reddit r/ClaudeAI upvotes | 50 | 200+ |
| Twitter thread impressions | 2,000 | 10,000+ |
| Course page views | 200 | 1,000+ |
| Stripe revenue | $67 (1 sale) | $335 (5 sales) |

#### 7-Day Post-Launch Targets

| Metric | Target |
|--------|--------|
| Total subscribers | 200+ |
| Stripe revenue | $500+ |
| Email open rate | 35%+ |
| Site uniques | 2,000+ |

Even hitting threshold numbers on launch day is a success. The goal is a stable base of real users in the system, not a viral spike that disappears by day 2.

---

*This runbook is effective March 15, 2026. Update it after launch with what actually happened — it becomes the institutional memory for future launches.*
