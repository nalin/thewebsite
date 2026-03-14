# KPI Tracking Dashboard: thewebsite.app

**Launch Date**: March 23, 2026
**Author**: Growth Strategist
**Created**: March 14, 2026
**Baseline**: 12 email subscribers, $0 revenue

---

## Success Definition

Success at launch is not a single number — it is a signal cascade. HN front page drives visitors, visitors convert to subscribers, subscribers convert to buyers. Each layer must work for the next to fire. Track the cascade, not just the end state.

---

## Part 1: KPI Targets by Time Horizon

### Launch Day (March 23)

| Metric | Baseline | Target | Stretch |
|--------|----------|--------|---------|
| New signups | 12 total | 50+ on day 1 | 100+ on day 1 |
| Unique visitors | ~0/day | 500+ | 1,000+ |
| HN rank (peak) | — | Top 10 | Top 3 |
| Email conversion rate | unknown | 20% | 30% |
| Revenue (day 1) | $0 | $0–$134 (1–2 sales) | $335+ (5 sales) |

**Email conversion rate** = signups / unique visitors on landing/course pages.
**Baseline note**: 12 existing subscribers are excluded from day-1 signup count.

---

### Week 1 (March 23–29)

| Metric | Baseline | Target | Stretch |
|--------|----------|--------|---------|
| Total subscribers | 12 | 100+ | 200+ |
| Paying customers | 0 | 5+ | 10+ |
| Revenue | $0 | $500+ ($335 founders × 5) | $1,000+ |
| Course completions | 0 | 10+ | 25+ |
| Testimonials collected | 0 | 5+ | 10+ |
| HN comment engagement | — | 20+ comments | 50+ comments |
| Twitter thread engagement | — | 50+ retweets | 150+ |

**Paying customer definition**: A unique user who completed a Stripe checkout for any paid tier.
**Course completion definition**: User viewed all modules in the free track (tracked via page view events).
**Testimonials**: Written, attributable quotes from real users (not anonymous). Collected via email reply or a post-completion survey.

---

### Month 1 (March 23 – April 22)

| Metric | Baseline | Target | Stretch |
|--------|----------|--------|---------|
| Total subscribers | 12 | 500+ | 1,000+ |
| Revenue (cumulative) | $0 | $2,000+ | $5,000+ |
| Active students | 0 | 50+ | 150+ |
| NPS score | — | 50+ | 70+ |
| MRR (if recurring added) | $0 | $200+ | $500+ |
| Organic referrals (%) | — | 20%+ of new signups | 35%+ |
| Twitter followers gained | — | 200+ | 500+ |

**Active student definition**: A subscriber who viewed at least 3 course modules within the past 30 days.
**NPS methodology**: Send a 1-question survey ("How likely are you to recommend this course? 0–10") to all course completers at the end of week 1. Score = % Promoters (9–10) minus % Detractors (0–6).

---

## Part 2: Metric Definitions and Data Sources

### Where to Find Each Metric

| Metric | Source | Query / Path |
|--------|--------|--------------|
| Unique visitors | Vercel Analytics | Dashboard → Web Analytics → Unique Visitors (filter: last 1 day / 7 days) |
| Page views by route | Vercel Analytics | Web Analytics → Pages (sort by views) |
| Email signups | Turso database | `SELECT COUNT(*) FROM subscribers WHERE created_at >= '2026-03-23'` |
| Email conversion rate | Calculated | signups ÷ unique visitors to `/` or `/course` |
| Revenue | Stripe Dashboard | Dashboard → Payments → filter by date range |
| Paying customers | Stripe Dashboard | Dashboard → Customers → filter by first payment date |
| Course completions | Turso database | `SELECT COUNT(DISTINCT user_id) FROM course_progress WHERE modules_completed = 9` (adjust table name to match schema) |
| HN rank | Hacker News | hckrnews.com or HN Algolia API: `hn.algolia.com/api/v1/search?tags=story&query=thewebsite.app` |
| Twitter engagement | Twitter Analytics | analytics.twitter.com → Tweets tab → filter by date |
| NPS score | Email survey replies | Manually computed from responses (or use a free tool like Tally/Typeform) |
| Referral source | Turso database | `SELECT utm_source, COUNT(*) FROM subscribers GROUP BY utm_source` |

---

## Part 3: Daily vs Weekly Tracking

### Track Daily (takes < 5 minutes)

On launch day and the first 7 days, check these every morning:

1. **New signups since yesterday** — Turso query or dashboard count
2. **Unique visitors (24h)** — Vercel Analytics
3. **Revenue in last 24h** — Stripe Payments
4. **HN rank / comment count** — check manually on day 1; Algolia API after
5. **Top referral source** — utm_source breakdown in Turso

Daily log format (copy to a running `METRICS_LOG.md` or Notion page):

```
Date: YYYY-MM-DD
Visitors (24h): ___
New signups: ___  |  Total: ___
Conversion rate: ___%
Revenue (24h): $___  |  Cumulative: $___
HN rank (peak): ___  |  Comments: ___
Top source: ___
Notes: ___
```

---

### Track Weekly (30 minutes on Monday)

Review these at the end of each week:

1. **Total subscribers vs. weekly target** — are we on pace for 500 by day 30?
2. **Paying customers and revenue** — compare to week 1 $500 target
3. **Course completions** — are users finishing? (signals product quality)
4. **Testimonials collected** — follow up with completers who haven't responded
5. **NPS score** (after week 1 survey) — qualitative signal on content quality
6. **Traffic sources breakdown** — HN vs Twitter vs Reddit vs direct vs organic search
7. **Email open rate and click rate** — Resend dashboard (target: 40%+ open, 5%+ click)
8. **Churn / unsubscribes** — Turso: `SELECT COUNT(*) FROM subscribers WHERE unsubscribed = true AND ...`

---

## Part 4: Conversion Funnel

```
Visitors
   │
   ▼ (target: 20% conversion)
Email Subscribers
   │
   ▼ (target: 5% conversion, week 1)
Course Starters (opened at least module 1)
   │
   ▼ (target: 50% of starters)
Active Students (3+ modules viewed)
   │
   ▼ (target: 30% of active students → paying)
Paying Customers
   │
   ▼ (target: 30% of paying → leave testimonial)
Testimonials / Referrers
```

**Funnel health check**: If any stage has < 50% of its target conversion rate at end of week 1, flag it and adjust.

---

## Part 5: When to Adjust Strategy

Use this decision table at the end of each day:

| Situation | Signal | Action |
|-----------|--------|--------|
| HN post not on front page by 10am PT | < 50 points, rank 30+ | Activate Reddit backup (r/MachineLearning, r/LangChain). Post Twitter thread immediately. |
| Visitors high but signups low (< 10%) | > 300 visitors, < 30 signups | A/B test CTA copy. Move signup form above the fold. Add social proof (testimonial or signup count). |
| Signups high but no purchases after 48h | 50+ subs, $0 revenue | Send a dedicated email to day-1 signups: "Founders pricing ($67) ends Sunday." Add urgency via countdown. |
| Revenue stalls after day 3 | < 3 sales by day 3 | Test price sensitivity: offer a 1-time 48h "beta reader" discount at $47. Collect objections via a short reply survey. |
| Course completions low (< 5 in week 1) | < 5 completions | Check module completion drop-off in analytics. Shorten longest module. Add a "What's next" prompt at end of each module. |
| High unsubscribe rate | > 5% unsubscribes in week 1 | Reduce email frequency. Audit subject lines for clickbait. Check welcome email for expectation mismatch. |
| NPS < 30 | End of week 1 survey | Interview 3 detractors. Find the #1 complaint. Fix it before week 2 email. |

---

## Part 6: Milestone Celebrations and Accountability

Post a public update (Twitter + HN comment) at each milestone:

- 50 signups on day 1
- 100 total subscribers
- First paying customer
- $500 revenue
- 10 course completions
- 500 subscribers
- $2,000 revenue
- First NPS result published

These updates are not vanity posts — they are the build-in-public narrative that drives the next wave of organic traffic. Each milestone post is both accountability and distribution.

---

## Part 7: 30-Day Pacing Model

To hit 500 subscribers in 30 days from a 12-subscriber baseline, growth needs to be front-loaded:

| Day Range | New Subs Needed | Cumulative | Primary Driver |
|-----------|----------------|------------|----------------|
| Day 1 (launch) | 50 | 62 | HN + Twitter launch |
| Days 2–3 | 30 | 92 | HN tail + Twitter reshares |
| Days 4–7 | 60 | 152 | Reddit posts + referrals |
| Week 2 | 100 | 252 | Email content (module drops), SEO |
| Week 3 | 120 | 372 | Organic referral, Twitter content |
| Week 4 | 130 | 502 | SEO, word-of-mouth, email forwards |

**Revenue pacing** (target: $2,000 by day 30):

| Week | Revenue Target | Cumulative | Driver |
|------|----------------|------------|--------|
| Week 1 | $500 | $500 | Founders pricing urgency |
| Week 2 | $500 | $1,000 | Subscriber base growing, email nurture |
| Week 3 | $500 | $1,500 | SEO traffic converts, testimonials added |
| Week 4 | $500 | $2,000 | Organic + email list matures |

This requires an average conversion rate of ~5% from subscriber to paying customer across the first 100 subscribers at $67 founders pricing, shifting to $97 after week 1.

---

## Summary: The Three Numbers That Matter Most

At the end of each day in the first 7 days, the three numbers that determine whether the launch is working:

1. **Conversion rate** (signups / visitors) — tells you if the message resonates
2. **Revenue** — tells you if the product has real demand
3. **Course completion trend** — tells you if the product delivers on the promise

Everything else is context. These three are the canaries.
