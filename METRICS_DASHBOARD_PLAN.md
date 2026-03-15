# Metrics Dashboard Plan

**Author**: Growth Strategist / NextJS Dev
**Created**: March 14, 2026
**Product**: thewebsite.app — AI Agent Builder Course
**Goal**: Single source of truth for all business metrics, from subscriber #1 to $80k/month

---

## Overview

This document defines the complete metrics strategy for thewebsite.app, including what to track, how to display it, what tools to use, and how to report it. The existing `/metrics` page is the foundation — this plan expands it into a full operational dashboard.

**Dashboard URL**: `/metrics` (public — build in public ethos)
**Admin-only extended view**: `/admin/metrics` (protected by `lib/admin.ts`)
**Update frequency**: Real-time where possible, 1-hour cache maximum

---

## Dashboard Architecture

The metrics system has three layers:

1. **Data Sources** — where numbers come from (Turso DB, Stripe, Resend, Vercel Analytics, GitHub)
2. **API Layer** — `/api/metrics/*` endpoints that aggregate and cache data
3. **UI Layer** — public `/metrics` page + private `/admin/metrics` with deeper data

```
Data Sources                API Layer              UI Layer
─────────────               ──────────             ────────
Turso (subscribers)    ──►  /api/metrics/growth ──► /metrics        (public)
Stripe (payments)      ──►  /api/metrics/revenue──► /admin/metrics  (admin)
Resend (email stats)   ──►  /api/metrics/engage  ──► Daily email digest
Vercel Analytics       ──►  /api/metrics/traffic  ──► Weekly report
GitHub (issues/votes)  ──►  /api/metrics/product
PostHog (events)       ──►  /api/metrics/funnel
```

---

## Section 1: Growth Metrics

### 1.1 Daily Signups Chart

**What**: New email subscribers per day over the last 30/90 days.

**Why**: Signals whether growth tactics are working. A spike after a Twitter thread or Reddit post confirms channel attribution.

**Data source**: `waitlist` table in Turso — `SELECT date(created_at), COUNT(*) FROM waitlist GROUP BY date(created_at)`

**Update frequency**: Every 15 minutes

**ASCII Mockup**:
```
Daily Signups — Last 30 Days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  20 |          *
  15 |         ***
  10 |      *  ***   *
   5 | *  * ** **** ***   *  *
   1 |_________________________
     Mar 1                Mar 14

Total: 312  |  7-day avg: 12.4/day  |  Peak: Mar 9 (19 signups)
HN post ──────────────────────────►
```

**Implementation**:
```typescript
// app/api/metrics/growth/route.ts
// Returns: { date: string, count: number }[]
// Query: daily counts from waitlist table, last 90 days
// Cache: 15 min (revalidate: 900)
```

**Schema requirement**: `waitlist` table needs `created_at` timestamp (already exists) and `source` column for attribution.

---

### 1.2 Traffic Sources Breakdown

**What**: Where visitors come from — organic search, direct, social, referral.

**Why**: Shows which channels drive real traffic vs. vanity clicks. Helps decide where to double down.

**Data source**: Vercel Web Analytics (built-in, no extra cost) + UTM parameters stored on signup

**UTM parameters to track**:
| Parameter | Values |
|-----------|--------|
| `utm_source` | `twitter`, `hackernews`, `reddit`, `google`, `email`, `direct` |
| `utm_medium` | `social`, `post`, `newsletter`, `organic` |
| `utm_campaign` | `launch`, `thread-ai-lessons`, `starter-kit`, etc. |

**Store on signup**: When a user hits `/api/subscribe`, capture `utm_source` from query params and save to `waitlist.source` column.

**ASCII Mockup**:
```
Traffic Sources — Last 7 Days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hacker News    ████████████████  42%  (1,240 visits)
Twitter        ████████          22%    (650 visits)
Organic Search █████             14%    (413 visits)
Reddit         ████              11%    (325 visits)
Direct         ███                8%    (236 visits)
Other          ██                 3%     (89 visits)

Total unique visitors: 2,953
```

**Implementation**: Vercel Analytics API + store UTM on signup row.

---

### 1.3 Conversion Funnel

**What**: Tracks how visitors move from first page load to paying customer.

**Why**: Reveals the biggest drop-off points. If 1,000 people visit `/starter-kit` but only 20 subscribe, the page copy needs work, not more traffic.

**Funnel stages**:
```
Stage 1: Unique visitors ──── Vercel Analytics pageviews
Stage 2: Course page views ── /course visits
Stage 3: Email capture ─────── form_view event (PostHog)
Stage 4: Subscribed ─────────── waitlist INSERT
Stage 5: Email confirmed ────── email_confirmed flag in DB
Stage 6: Course started ──────── first_module_view event
Stage 7: Paid customer ──────── Stripe payment_intent.succeeded
```

**ASCII Mockup**:
```
Conversion Funnel — All Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  10,000  Unique Visitors     ████████████████████  100%
   4,200  Course Page Views   ████████             42.0%
   1,800  Signup Form Views   ███                  18.0%
     312  Subscribers         ▌                     3.1%
     287  Email Confirmed     ▌                     2.9%
     180  Course Started      ▌                     1.8%
       8  Paid Customers      ▏                     0.08%

Key ratios:
  Visitor → Subscriber: 3.1%  (target: 5%)
  Subscriber → Paid:    2.6%  (target: 4%)
```

**Implementation**: PostHog (free tier: 1M events/month) for event tracking. Custom events fired from:
- `app/course/page.tsx` → `course_page_viewed`
- `components/EmailCapture.tsx` → `signup_form_viewed`, `signup_submitted`
- `app/api/subscribe/route.ts` → `subscriber_created`
- Stripe webhook → `payment_completed`

---

### 1.4 Geographic Distribution

**What**: Countries and cities where subscribers/customers come from.

**Why**: Informs pricing (PPP adjustments), content timing (when to send emails), and which communities to target.

**Data source**: Vercel Analytics (geo built-in) + optional IP lookup on signup

**ASCII Mockup**:
```
Top Countries — Subscribers
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  United States    ████████████  38%  (119)
  India            ██████         18%   (56)
  United Kingdom   ████           12%   (37)
  Canada           ███             9%   (28)
  Germany          ██              6%   (19)
  Other            ████           17%   (53)
```

**Implementation**: Vercel Analytics API. No PII stored — country-level only.

---

## Section 2: Revenue Metrics

### 2.1 Revenue Over Time

**What**: Daily, weekly, and monthly revenue with period comparison.

**Why**: The primary success metric. $0 → $80k/month is the stated goal. Every day's revenue feeds the progress bar.

**Data source**: Stripe API — `stripe.balanceTransactions.list()` filtered by `type: charge`

**Update frequency**: Every 5 minutes via Stripe webhook into Turso cache table

**Schema**:
```sql
CREATE TABLE revenue_events (
  id TEXT PRIMARY KEY,
  stripe_payment_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  customer_email TEXT,
  product_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**ASCII Mockup**:
```
Revenue Dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  TODAY          THIS WEEK       THIS MONTH      ALL TIME
  $268           $1,340          $4,820          $4,820
  +$97 vs yday   +12% vs last wk  —              —

  Monthly Revenue vs $80k Goal
  ████░░░░░░░░░░░░░░░░░░░░░░░░░░  6.0%  ($4,820 / $80,000)

  Daily Revenue — Last 14 Days
  400 |              *
  300 |           *  **
  200 |        *  ** **    *
  100 | *  *   ** ******  ***
    0 |____________________________
      Mar 1                Mar 14
```

---

### 2.2 Average Order Value (AOV)

**What**: Mean revenue per transaction.

**Why**: AOV * conversion rate * traffic = revenue. Improving AOV (upsells, bundles) can double revenue without more traffic.

**Calculation**: `total_revenue / number_of_orders`

**Targets**:
| Period | Target AOV |
|--------|-----------|
| Launch (March 23) | $67 (founders pricing) |
| Month 1 | $82 (mix of $67 + $97) |
| Month 3 | $97+ (standard pricing) |

**Display**: Single KPI card with 30-day trend arrow.

---

### 2.3 Customer Lifetime Value (CLV)

**What**: Average total revenue per customer over their lifetime.

**Why**: Determines how much to spend on acquisition. If CLV = $200, spending $20 on ads to acquire a customer is viable.

**Calculation (phase 1 — simple)**: Since the product is one-time purchase, CLV = AOV initially. Update formula when recurring revenue launches.

**Future CLV formula** (when subscription tier launches):
```
CLV = (Avg Monthly Revenue per Customer) × (Avg Customer Lifespan in Months)
    = $29/month × 14 months = $406
```

**Display**: Single KPI card, updated monthly.

---

### 2.4 Churn Rate

**What**: Percentage of paying customers who cancel per month.

**Why**: A leaky bucket problem — high churn means acquisition never builds momentum.

**Applicability**: Relevant when subscription tier launches. For one-time course sales, track "engagement churn" (students who stop engaging with course content after purchase).

**Calculation**:
```
Monthly Churn = (Customers who cancelled this month) / (Customers at start of month) × 100
```

**Target**: < 5% monthly churn for subscription tier (implies 20-month average lifespan).

**Display**: Percentage card with trend. Show "N/A — one-time purchase model" until subscriptions launch.

---

## Section 3: Engagement Metrics

### 3.1 Course Completion Rates by Module

**What**: % of enrolled students who completed each module.

**Why**: Identifies exactly where students drop off. If Module 3 has 40% completion but Module 4 has 10%, Module 4 needs work.

**Data source**: New `course_progress` table in Turso

**Schema**:
```sql
CREATE TABLE course_progress (
  id TEXT PRIMARY KEY,
  subscriber_email TEXT NOT NULL,
  module_id INTEGER NOT NULL,  -- 1-10
  started_at DATETIME,
  completed_at DATETIME,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(subscriber_email, module_id)
);
```

**Tracking**: When a student loads a module page, fire a server action that upserts `started_at`. A "Mark Complete" button fires the `completed_at` update.

**ASCII Mockup**:
```
Course Module Completion Rates
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Module 1: Intro to AI Agents    ████████████████  89%
Module 2: Building Your First   ██████████████    76%
Module 3: Multi-Agent Systems   ████████████      64%
Module 4: Production Deploy     ████████          48%
Module 5: Monetization          ██████            34%
Module 6: Advanced (Premium)    ████              22%
Module 7: Case Studies          ██                14%

Drop-off alert: M3→M4 gap is 16pp — investigate content quality
```

**Alert rule**: Flag any module-to-module drop > 15 percentage points.

---

### 3.2 Time Spent in Course

**What**: Average time spent per module and per student session.

**Why**: Low time-on-page suggests content isn't engaging or is too thin. High time may mean content is confusing.

**Tracking**: JavaScript `visibilitychange` + `beforeunload` events send heartbeats every 30 seconds to `/api/progress/heartbeat`. Sum heartbeats per module per student.

**Target benchmarks**:
| Module type | Expected time |
|------------|---------------|
| Intro module | 15–30 min |
| Technical module | 45–90 min |
| Hands-on project | 90–180 min |

**Display**: Per-module average with bar vs. target. Students significantly below target may be skimming without learning.

---

### 3.3 Active Students (Daily/Weekly)

**What**: DAU (Daily Active Users) and WAU (Weekly Active Users) among paying/enrolled students.

**Why**: Engagement is a leading indicator of retention and word-of-mouth. High DAU/WAU ratio indicates habitual use.

**Calculation**:
- **DAU**: Unique student emails with a `course_progress` heartbeat in the last 24 hours
- **WAU**: Unique student emails with any activity in the last 7 days
- **DAU/WAU ratio** (stickiness): target > 20%

**Display**: Two KPI cards + 30-day trend line. Add "streak" count per student in their personal dashboard.

---

### 3.4 Support Ticket Volume

**What**: Number of support requests per day/week, categorized by type.

**Why**: High ticket volume signals UX problems or content gaps. Tracking categories (technical, billing, content) directs fix priorities.

**Source**: GitHub Issues labeled `support` + email replies to Resend-sent emails (via reply-to address)

**Categories**:
- `technical` — bugs, errors, setup problems
- `billing` — payment issues, refund requests
- `content` — confusion about course material
- `feature` — requests for new content or features

**Target**: < 2 support tickets per 100 active students per week

**Display**: Volume chart + category breakdown + P90 response time.

---

## Section 4: Marketing Metrics

### 4.1 Social Media Growth

**What**: Twitter/X follower count, growth rate, and engagement rate by post.

**Why**: Follower growth is a lagging indicator but engagement rate tells you if content is landing.

**Data source**: Twitter API v2 (free tier: read-only, 500k tweets/month)

**Key metrics**:
| Metric | How tracked | Target |
|--------|-------------|--------|
| Follower count | Twitter API, daily snapshot | +50/week post-launch |
| Engagement rate | (likes + RTs + replies) / impressions | > 3% |
| Top performing posts | Sorted by engagement | N/A |
| Follower → visitor | UTM-tagged bio link clicks | > 5% |

**Schema**:
```sql
CREATE TABLE twitter_snapshots (
  id TEXT PRIMARY KEY,
  followers INTEGER,
  following INTEGER,
  tweet_count INTEGER,
  captured_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Update frequency**: Once daily (Twitter API rate limits)

---

### 4.2 Email Open and Click Rates

**What**: Open rate, click rate, unsubscribe rate, and bounce rate per email sent.

**Why**: Email is the highest-converting channel. Declining open rates signal list fatigue or deliverability issues.

**Data source**: Resend webhook events (`email.opened`, `email.clicked`, `email.bounced`, `email.complained`)

**Target benchmarks** (developer audience):
| Metric | Target | Industry avg |
|--------|--------|-------------|
| Open rate | > 45% | 25–30% |
| Click rate | > 8% | 2–5% |
| Unsubscribe rate | < 0.5% | 0.3% |
| Bounce rate | < 2% | 1–2% |

**Schema**:
```sql
CREATE TABLE email_events (
  id TEXT PRIMARY KEY,
  resend_email_id TEXT,
  campaign_id TEXT,
  subscriber_email TEXT,
  event_type TEXT,  -- 'sent','opened','clicked','bounced','unsubscribed'
  occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**ASCII Mockup**:
```
Email Performance — Last 5 Campaigns
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Campaign                     Sent   Opens  Clicks  Unsubs
──────────────────────────── ────── ──────  ─────   ──────
Launch Day Announcement       287    67%     12%     0.3%
Early Bird Offer              283    61%     18%     0.7%
Module 5 Released             280    52%      8%     0.4%
"9 Lessons" Thread Recap      278    48%      7%     0.2%
Weekly Build Log #3           277    44%      6%     0.1%
```

---

### 4.3 Content Performance

**What**: Blog post pageviews, time-on-page, and email capture conversion per post.

**Why**: Identifies which content topics drive traffic and signups. Informs what to write next.

**Data source**: Vercel Analytics (pageviews) + PostHog (email capture events with `page` property)

**Key metrics per blog post**:
- Pageviews (total and unique)
- Average time on page
- Scroll depth (% of readers who reach 75% of post)
- Email captures from post (CTA clicks → subscriptions)
- Social shares (via share button click events)

**Top content table** (admin view):
```
Content Performance — All Time
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Post                          Views   Avg Time  Signups  Conv%
───────────────────────────── ──────  ────────  ───────  ─────
How I Built AI Business       4,230   6m 42s      38     0.9%
5 AI Agents This Week         2,890   4m 15s      24     0.8%
AI Agent Architecture Guide   1,940   8m 33s      29     1.5%
Module 3 Deep Dive            1,200   5m 10s      11     0.9%
```

---

### 4.4 Referral Conversions

**What**: How many signups and sales came from the referral program.

**Why**: Referral is the highest-trust, lowest-cost acquisition channel. Each referred customer has higher LTV and is more likely to refer again.

**How referrals work** (existing system per LAUNCH_CHECKLIST): Unique referral links per subscriber stored in `waitlist.referral_code`. Attribution tracked on new signups via `waitlist.referred_by`.

**Key metrics**:
| Metric | Calculation |
|--------|-------------|
| Referral signups | COUNT WHERE referred_by IS NOT NULL |
| Referral conversion rate | referral signups / total signups |
| Top referrers | ranked by referral count |
| Referral → paid rate | % of referred users who purchase |

**Target**: 20%+ of all new signups via referral by Month 2 (viral coefficient > 0.3)

---

## Section 5: Reporting Schedule

### 5.1 Daily Digest Email

**When**: Every morning at 7:00 AM PT (Vercel cron: `0 15 * * *` UTC)

**Recipients**: Founder (internal only — not published publicly)

**Format**: Plain text email via Resend, < 300 words

**Template**:
```
Subject: Daily Metrics — [DATE] | Subscribers: [N] | Revenue: $[N]

YESTERDAY AT A GLANCE
─────────────────────
New subscribers:     [N]  (+/- vs 7-day avg)
Revenue:             $[N] (+/- vs yesterday)
Course visits:       [N]
Email sent:          [N] (open rate: [N]%)
Support tickets:     [N]

GROWTH (Cumulative)
───────────────────
Total subscribers:   [N]  (goal: 100 by Mar 23)
Total revenue:       $[N] (goal: $80k/month)
Paying customers:    [N]

TOP SOURCE YESTERDAY
────────────────────
[Source] — [N] signups

ACTION ITEMS (if any thresholds breached)
──────────────────────────────────────────
[Alert: Signups below 5/day for 3 consecutive days]
[Alert: Email open rate dropped below 35%]

View full dashboard: https://thewebsite.app/admin/metrics
```

**Implementation**: `/api/cron/daily-digest` triggered by Vercel cron. Uses `CRON_SECRET` env var for auth. Sends via Resend to founder email stored in `FOUNDER_EMAIL` env var.

---

### 5.2 Weekly Summary Report

**When**: Every Monday at 8:00 AM PT

**Format**: Structured email with 7 sections, ~500 words. Can also be published as a blog post ("Build in Public Update #N").

**Sections**:
1. **Week in Numbers** — core KPIs with vs. last week comparison
2. **Growth** — subscriber count, top source, best-performing post
3. **Revenue** — weekly total, AOV, new customers
4. **Engagement** — DAU/WAU, top module by completion, avg time in course
5. **Email** — best campaign this week, list health
6. **What Worked** — one specific tactic that drove results
7. **Next Week Focus** — one primary goal (keep it to one)

**Double use**: This same data powers the public "Build in Public" blog posts that drive traffic and subscriber growth. The weekly report is also content.

---

### 5.3 Monthly Business Review

**When**: First day of each month, covers prior month

**Format**: Longer document (internal) — 1,000–1,500 words

**Sections**:
1. **Revenue Summary** — MRR/ARR, AOV, new vs. returning customers
2. **Subscriber Growth** — growth rate, top channels, referral performance
3. **Funnel Analysis** — conversion rates at each stage, biggest drop-off
4. **Course Engagement** — completion rates, time-on-page, student feedback themes
5. **Email Health** — list size, open/click trends, deliverability metrics
6. **Content ROI** — which posts drove the most signups and revenue
7. **Goal Progress** — progress toward $80k/month with projected timeline
8. **Top Learnings** — what we learned this month (honest, including failures)
9. **Next Month Plan** — 3 priorities only

**Database query for monthly summary**:
```sql
-- Monthly revenue
SELECT strftime('%Y-%m', created_at) as month,
       COUNT(*) as sales,
       SUM(amount_cents)/100.0 as revenue,
       AVG(amount_cents)/100.0 as aov
FROM revenue_events
GROUP BY month
ORDER BY month DESC;
```

---

### 5.4 Metrics Tracking Timeline (What to Track When)

Different metrics matter at different stages. Tracking the wrong thing too early is noise.

| Phase | Subscribers | Primary Metrics | Secondary Metrics |
|-------|-------------|-----------------|-------------------|
| Pre-launch | 0–100 | Daily signups, traffic sources, email open rate | Conversion funnel, referrals |
| Launch | 100–500 | Revenue, conversion rate, AOV | Course starts, module completion |
| Growth | 500–2,000 | MRR growth rate, churn, CLV | DAU/WAU, referral viral coeff |
| Scale | 2,000+ | LTV:CAC ratio, payback period | NPS, segment cohort analysis |

**Current phase**: Pre-launch. Focus relentlessly on:
1. Daily signups (is growth accelerating?)
2. Conversion rate on the signup form (is the copy working?)
3. Email open rate (is list quality high?)

Do not obsess over CLV, churn, or LTV:CAC until there are 20+ paying customers.

---

## Section 6: Implementation Plan

### 6.1 Tools Required

| Tool | Purpose | Cost | Priority |
|------|---------|------|----------|
| Vercel Analytics | Pageviews, geo, traffic sources | Free (included) | P0 — already active |
| Turso | Subscriber + revenue data storage | Free tier: 500MB | P0 — already active |
| Stripe | Payment processing + revenue data | 2.9% + 30¢/transaction | P0 — needed at launch |
| Resend | Email sending + open/click tracking | Free: 3k emails/month | P0 — already active |
| PostHog | Funnel events, product analytics | Free: 1M events/month | P1 — add before launch |
| Twitter API v2 | Follower/engagement snapshots | Free: 1.5M tweets/month | P2 — add post-launch |
| Sentry | Error monitoring (revenue/cron alerts) | Free: 5k errors/month | P1 — already configured |

**Total cost**: $0/month at current scale (all free tiers). First paid tool triggered at ~5,000 subscribers.

---

### 6.2 API Integrations Required

#### Stripe Webhooks (P0 — required at launch)
```
Events to handle:
  payment_intent.succeeded  → insert revenue_events row
  payment_intent.failed     → log for debugging
  customer.subscription.deleted → update churn metrics

Endpoint: /api/webhooks/stripe
Env vars: STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY
```

#### Resend Webhooks (P1 — needed for email metrics)
```
Events to handle:
  email.sent      → record in email_events
  email.opened    → update email_events
  email.clicked   → update email_events
  email.bounced   → flag subscriber for review
  email.complained→ immediately unsubscribe

Endpoint: /api/webhooks/resend
Env var: RESEND_WEBHOOK_SECRET
```

#### PostHog (P1 — needed for funnel)
```typescript
// Install: pnpm add posthog-js posthog-node
// Client: fire events from browser components
// Server: fire events from API routes

// Key events:
posthog.capture('course_page_viewed', { module: 1 })
posthog.capture('signup_form_viewed', { page: '/starter-kit' })
posthog.capture('signup_submitted', { source: utm_source })
posthog.capture('payment_completed', { amount: 97, plan: 'course' })
```

#### Vercel Analytics API (P2 — for traffic sources)
```typescript
// Use Vercel Analytics API to pull pageview data
// Access via: @vercel/analytics/server
// Rate limit: 1000 req/day on free plan
```

---

### 6.3 Database Schema Changes Required

```sql
-- Add source tracking to existing waitlist table
ALTER TABLE waitlist ADD COLUMN source TEXT;
ALTER TABLE waitlist ADD COLUMN utm_source TEXT;
ALTER TABLE waitlist ADD COLUMN utm_medium TEXT;
ALTER TABLE waitlist ADD COLUMN utm_campaign TEXT;
ALTER TABLE waitlist ADD COLUMN referred_by TEXT;
ALTER TABLE waitlist ADD COLUMN referral_code TEXT UNIQUE;

-- New table: revenue events (from Stripe webhooks)
CREATE TABLE revenue_events (
  id TEXT PRIMARY KEY,
  stripe_payment_id TEXT UNIQUE NOT NULL,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  product_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- New table: course progress tracking
CREATE TABLE course_progress (
  id TEXT PRIMARY KEY,
  subscriber_id TEXT NOT NULL,
  module_id INTEGER NOT NULL,
  started_at DATETIME,
  completed_at DATETIME,
  time_spent_seconds INTEGER DEFAULT 0,
  UNIQUE(subscriber_id, module_id)
);

-- New table: email event tracking (Resend webhooks)
CREATE TABLE email_events (
  id TEXT PRIMARY KEY,
  resend_email_id TEXT,
  campaign_id TEXT,
  event_type TEXT NOT NULL,
  occurred_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- New table: daily metrics snapshots (for trend charts)
CREATE TABLE metrics_snapshots (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  subscriber_count INTEGER,
  revenue_cents INTEGER,
  active_students INTEGER,
  captured_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

### 6.4 Dashboard UI Wireframes

#### Public `/metrics` Page (expanded from current)

```
┌─────────────────────────────────────────────────────────────────┐
│  METRICS DASHBOARD                                              │
│  Real-time progress toward $80k/month. Full transparency.       │
├──────────────┬───────────────┬──────────────┬───────────────────┤
│  REVENUE     │  SUBSCRIBERS  │  CUSTOMERS   │  GOAL PROGRESS    │
│  $4,820      │  312          │  8           │  ████░░░░░  6%    │
│  +$268 today │  +12 this wk  │  +2 this wk  │  $80k/mo target   │
├──────────────┴───────────────┴──────────────┴───────────────────┤
│                                                                 │
│  SUBSCRIBER GROWTH — Last 30 Days        [7d] [30d] [90d]      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ chart                                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
├──────────────────────────────┬──────────────────────────────────┤
│  TRAFFIC SOURCES             │  CONVERSION FUNNEL               │
│  HN      ████████ 42%        │  10,000 visitors                 │
│  Twitter ████     22%        │   4,200 course views             │
│  Organic ███      14%        │     312 subscribers   (3.1%)     │
│  Reddit  ██       11%        │       8 customers     (0.08%)    │
├──────────────────────────────┴──────────────────────────────────┤
│  COURSE ENGAGEMENT                                              │
│  Module 1 ████████████████ 89% complete                        │
│  Module 2 ██████████████   76% complete                        │
│  Module 3 ████████████     64% complete                        │
│  Module 4 ████████         48% complete  ◄ focus here          │
│  Module 5 ██████           34% complete                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Admin-Only `/admin/metrics` Extended View

Accessible via `lib/admin.ts` — same layout as above plus:
- Revenue by customer (table)
- Individual subscriber source attribution
- Email campaign performance table
- Error/alert log
- Raw SQL query interface for ad-hoc analysis

---

### 6.5 Alert Thresholds

Automated alerts via Sentry (already configured) or email when:

| Metric | Alert condition | Action |
|--------|----------------|--------|
| Daily signups | < 3 for 2 consecutive days | Review traffic sources, push new content |
| Email open rate | drops below 35% | Check spam score, review subject lines |
| Stripe webhook | failed payment > 2 in 1 day | Check Stripe dashboard, contact customers |
| Conversion rate | drops below 2% | Review signup form, A/B test copy |
| Support tickets | > 5 in one day | Check for bugs or content issues |
| Course drop-off | module-to-module gap > 20pp | Review module content quality |

---

## Implementation Priority

### Phase 1 — Pre-Launch (by March 22)
- [ ] Add UTM columns to `waitlist` table via Drizzle migration
- [ ] Update `/api/subscribe` to capture and store UTM params
- [ ] Add `revenue_events` table and Stripe webhook handler
- [ ] Expand `/metrics` page with subscriber growth chart (using existing DB data)
- [ ] Set up Vercel cron for daily digest email to founder

### Phase 2 — Launch Week (March 23–30)
- [ ] Add Resend webhook handler for email event tracking
- [ ] Add `email_events` table to schema
- [ ] Add PostHog event tracking to key pages (funnel visibility)
- [ ] Build out conversion funnel display on `/metrics` page
- [ ] Set up Sentry alerts for signup/revenue thresholds

### Phase 3 — Post-Launch (April)
- [ ] Add `course_progress` table + module completion tracking
- [ ] Build module completion rate chart on `/metrics`
- [ ] Add Twitter API snapshot job (daily follower count)
- [ ] Build admin-only `/admin/metrics` extended view
- [ ] Automate weekly summary email

---

## Key Decisions

**Q: Should the metrics dashboard be public or private?**
A: Public. The build-in-public ethos is a core differentiator and trust signal. Hiding revenue numbers defeats the purpose. Competitors can see the numbers but can't replicate the authentic narrative.

**Q: Real-time vs. cached data?**
A: Cache aggressively. Most metrics don't change meaningfully in < 15 minutes. Cache subscriber count and revenue for 5 minutes. Cache chart data for 15 minutes. Only the daily digest queries need to be fresh at send time.

**Q: PostHog vs. custom event tables?**
A: PostHog for funnel/event analysis (it's better at this than custom SQL). Custom DB tables for business metrics that need to be displayed on the site (subscriber count, revenue). Don't put revenue data in PostHog — keep financial data in Turso only.

**Q: When to add paid analytics tools?**
A: When Vercel Analytics free tier is insufficient (> 25k pageviews/month) or when PostHog free tier is exhausted (> 1M events/month). At current scale, $0/month covers everything.
