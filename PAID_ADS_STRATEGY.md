# Paid Advertising Strategy for Scaling

**Product**: thewebsite.app — AI Agent Builder Course
**Author**: Growth Strategist
**Created**: March 14, 2026
**Status**: Ready to activate when launch criteria are met

---

## Overview

This document is the complete paid advertising playbook for thewebsite.app. Paid ads amplify what organic growth has already proven. We do not run ads before product-market fit is confirmed — doing so burns money before we know what messaging converts.

**Core principle**: Organic first. Paid second. Paid ads are gasoline — only pour it on a fire that's already burning.

---

## Part 1: Launch Criteria (When to Start Paid Ads)

All three gates must be passed before spending a dollar on ads.

### Gate 1 — Organic Signups: 100+
- At least 100 subscribers acquired through organic channels (Twitter, Reddit, HN, SEO, referrals)
- Demonstrates that the product concept resonates without paid amplification
- Provides baseline conversion data to model CAC projections

### Gate 2 — Conversion Funnel Validated
- Email → paid conversion rate is measurable (minimum 30 paying students)
- Landing page conversion rate is confirmed at 10%+ (visitors → signups)
- Email nurture sequence achieves 25%+ open rate across the 5-email sequence
- Checkout completion rate is 60%+ (add-to-cart → purchase)
- If any of these metrics are below target, fix the funnel first — ads will make a leaky funnel more expensive, not more profitable

### Gate 3 — Testimonials Collected
- Minimum 5 written testimonials from paying students with specific results
- At least 1 video testimonial or detailed case study
- Testimonials address the core objection: "Can I actually build something useful?"
- These feed directly into ad creative — ads without social proof underperform by 40–60%

### Readiness Checklist

| Criteria | Target | Status |
|----------|--------|--------|
| Organic signups | 100+ | Track in DB |
| Paying students | 30+ | Track in Stripe |
| LP conversion rate | 10%+ | Measure via analytics |
| Email open rate | 25%+ | Measure via Resend |
| Testimonials collected | 5+ written, 1 video | Collect via email |
| Funnel break-even confirmed | Positive LTV:CAC on organic | Calculate before launch |

**Estimated timeline to hit all gates**: 4–8 weeks post-launch (March 23 → May 2026)

---

## Part 2: Budget Strategy

### Initial Test Budget: $500/month

Distribute across channels to gather data, not to scale. The goal of the first 60 days is learning, not growth.

| Channel | Monthly Budget | % of Total |
|---------|---------------|-----------|
| Google Search Ads | $200 | 40% |
| Twitter/X Ads | $150 | 30% |
| Reddit Ads | $100 | 20% |
| YouTube Ads | $50 | 10% |

**Why this split**: Google Search captures existing demand (highest intent, highest conversion rate). Twitter/X builds brand awareness in the AI community. Reddit targets niche communities. YouTube is a cheap test for video creative.

### Economic Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| CAC (cost per subscriber) | <$20 | At $97 course price, 5:1 LTV:CAC requires CAC ≤ $20 |
| CAC (cost per paying customer) | <$50 | First purchase LTV of $97 covers acquisition at 2:1; upsells push to 5:1 |
| LTV (12-month) | >$100 | $97 first course + $30 avg upsell/referral value |
| LTV:CAC ratio | 5:1 | Industry standard for sustainable paid growth |
| ROAS (return on ad spend) | 3x minimum | Month 1–2 test; 5x+ is scale signal |
| Payback period | <60 days | Critical for cash flow — longer payback = unsustainable |

### Budget Scaling Milestones

| ROAS | Action |
|------|--------|
| Below 2x | Pause channel, fix creative or landing page |
| 2–3x | Hold budget, optimize ad copy and targeting |
| 3–5x | Increase budget 25% per week |
| 5x+ | Double budget, begin scaling aggressively |

**Month 3+ budget**: If any channel hits 5x ROAS consistently, increase to $2,000/month on that channel. Total budget ceiling at $5,000/month until unit economics are confirmed at scale.

---

## Part 3: Channel-by-Channel Strategy

### Channel 1: Google Search Ads

**Why**: Highest purchase intent. People searching "how to build AI agents" or "Claude API tutorial" are actively trying to solve the problem we teach.

**Campaign Structure**

| Campaign | Match Type | Keywords |
|----------|-----------|---------|
| Brand | Exact | thewebsite.app, ai agent builder course |
| High-Intent | Phrase | how to build ai agents, claude api tutorial, anthropic claude course |
| Competitor | Phrase | langchain tutorial, autogpt course, ai agent course |
| Problem-Aware | Broad Match Modified | learn ai agents, ai automation course, build ai tools |

**Keyword Targets**

Primary keywords (high intent, $2–8 CPC estimated):
- "how to build AI agents"
- "Claude API tutorial"
- "AI agent course"
- "anthropic claude tutorial"
- "build AI automation with Claude"
- "LangChain alternatives tutorial"
- "AI agent development course"

Secondary keywords ($1–4 CPC estimated):
- "learn AI agents 2026"
- "AI tools for developers"
- "build AI apps from scratch"
- "Claude 3 tutorial"

Negative keywords (exclude to protect budget):
- "free", "github", "documentation", "docs", "open source", "job", "salary"

**Bidding Strategy**: Start with Manual CPC to gather data. Switch to Target CPA bidding once 50+ conversions are recorded (Google needs this data to optimize).

**Ad Extensions**: Use sitelink extensions (Course Overview, Pricing, Testimonials) and callout extensions ("5 modules", "Build real agents", "Claude-native curriculum").

**Budget**: $200/month → ~6–8 clicks/day at estimated $1.50 avg CPC → targets 180–240 site visits/month from this channel.

---

### Channel 2: Twitter/X Ads

**Why**: The AI developer community lives on Twitter. Organic growth likely came from here first — paid extends reach to cold audiences who follow the same accounts.

**Campaign Types**

**Promoted Tweets** (primary):
- Boost high-performing organic tweets about AI agents
- Target lookalike audiences based on followers of @AnthropicAI, @sama, @karpathy, @swyx
- Run "website clicks" objective, not "engagement"

**Follower Ads** (secondary):
- Grow account following for long-term organic leverage
- $0.50–2.00 per new follower target
- Only run if organic following is below 2,000

**Targeting**:
- Followers of: @AnthropicAI, @OpenAI, @LangChainAI, @hwchase17, @karpathy, @ycombinator
- Keywords: "AI agents", "Claude", "LLM", "build with AI", "AI automation"
- Interest categories: Artificial Intelligence, Software Development, Startups
- Exclude: Competitors' promoted tweets (brand safety)

**Budget**: $150/month → ~$5/day. Run 3 ad variations simultaneously, pause lowest CTR after 7 days.

---

### Channel 3: Reddit Ads

**Why**: Reddit has the most engaged AI developer communities. r/ClaudeAI, r/LangChain, r/MachineLearning, r/learnmachinelearning are full of exactly our target student.

**Target Subreddits**:

| Subreddit | Members | Fit |
|-----------|---------|-----|
| r/ClaudeAI | ~150K | Direct — Claude users |
| r/LangChain | ~80K | High — AI agent builders |
| r/MachineLearning | ~2.8M | Medium — broad ML audience |
| r/learnmachinelearning | ~350K | High — learning-focused developers |
| r/artificial | ~900K | Medium — AI enthusiasts |
| r/ChatGPT | ~5M | Low — mostly non-technical |

**Ad Format**: "Promoted Post" format. Use native-looking creative that matches Reddit's text-heavy style. Avoid overly polished imagery — Reddit users are ad-skeptical.

**Reddit-Specific Creative Rules**:
- Open with a genuine hook, not a hard sell
- Acknowledge the community ("As someone who spends time in r/ClaudeAI...")
- Lead with value (what they'll learn) before the CTA
- Avoid corporate language — write like a practitioner

**Targeting**: Interest + subreddit targeting combined. Do not use broad interest-only targeting on Reddit — it wastes budget on irrelevant users.

**Budget**: $100/month. Reddit CPMs are low ($3–8) vs. Google/Twitter. Expect 12,000–30,000 impressions and 60–150 clicks at estimated 0.5% CTR.

---

### Channel 4: YouTube Ads

**Why**: AI tutorial videos on YouTube get millions of views. Pre-roll ads on "how to build AI agents" tutorials reach viewers who are actively learning — a perfect audience.

**Ad Format**: TrueView in-stream ads (skippable after 5 seconds). 15–30 second hook is critical — if the viewer skips, we pay nothing.

**Targeting**:
- Placement targeting: AI tutorial channels (Fireship, Traversy Media, AI Jason, NetworkChuck)
- Keyword targeting: "AI agents tutorial", "Claude API", "LangChain tutorial", "build AI tools"
- Topic targeting: Artificial Intelligence, Computer Programming

**Video Creative Brief** (for future production):
- First 5 seconds: Problem statement. "You keep watching AI tutorials but never ship anything."
- Seconds 5–15: Credibility + hook. "I built 5 working AI agents using only Claude and zero frameworks."
- Seconds 15–25: CTA. "This course shows you exactly how — first module is free."
- End screen: URL + offer

**Budget**: $50/month is a minimal test. Scale to $200/month if ROAS exceeds 3x. CPV (cost per view) typically $0.02–0.05 for this audience.

---

## Part 4: Ad Creative — 5+ Copy Variations

### Landing Page Ad Creative Framework

All ads drive to a dedicated paid-traffic landing page (separate from the organic homepage) with:
- No navigation links (removes exit paths)
- Single CTA: "Start Free Module"
- Social proof above the fold (student testimonials + count)
- Clear value proposition in headline

---

### Ad Copy Variations

**Variation A — Problem-Led (Google Search / Twitter)**
```
Headline: Stop Reading About AI Agents. Start Building Them.
Subheadline: 5-module course built entirely on Claude. No frameworks. No fluff. Ship your first agent in 48 hours.
CTA: Get Free Module 1
```

**Variation B — Specificity / Outcome (Google Search)**
```
Headline: Build 5 Real AI Agents With Claude — Step by Step
Subheadline: Developers who completed this course shipped working agents in their first week. All source code included.
CTA: Start Free Today
```

**Variation C — Credibility / Social Proof (Twitter / Reddit)**
```
Copy: Most "AI agent" tutorials give you theory. This course gives you 5 complete projects — all running on Claude, all fully explained, all with source code.
No frameworks you'll never use. No fluff. Just working agents.
[Student name]: "Shipped my first agent on day 2. Haven't stopped building since."
CTA: First module is free → [link]
```

**Variation D — Fear / Cost of Inaction (Twitter)**
```
Copy: Every week you're not building with AI agents, someone else is. The developers shipping AI tools in 2026 learned this year, not next year.
5 real projects. Claude-native. Free to start.
```

**Variation E — Community / FOMO (Reddit)**
```
Headline: Built an AI agent that books my meetings — here's the course I used
Body: Spent 3 months trying to piece this together from docs and YouTube. Then took this 5-module course and shipped 5 working agents in 2 weeks.
Not affiliated — just actually worked for me. Module 1 is free if you want to check it out: [link]
```

**Variation F — Direct / No-Fluff (Google Search)**
```
Headline: Claude AI Agent Course — Free First Module
Subheadline: Learn to build production AI agents with Anthropic's Claude API. 5 projects, all working, all explained.
CTA: Free Access →
```

**Variation G — YouTube Pre-Roll Script**
```
[0–5s] "You've watched 50 AI tutorials. How many agents have you actually shipped?"
[5–15s] "This course is different. 5 real AI agents. Built on Claude. Every line of code explained."
[15–25s] "First module is completely free. Link below. Don't skip — this is the one that actually works."
```

---

## Part 5: Dedicated Paid Traffic Landing Page

### Why a Separate Landing Page?

The organic homepage is designed for exploration. The paid landing page is designed for conversion. Sending paid traffic to the homepage loses 30–50% of conversions to navigation, distractions, and unclear CTAs.

### Page Structure

```
HEADER:
[Logo] — No nav links

HERO:
Headline: Build Real AI Agents With Claude — Starting Today
Subheadline: The only course built natively on Anthropic's Claude API. 5 complete projects, all with source code. Start Module 1 free.
[Button: Start Free — No credit card required]

SOCIAL PROOF BAR:
"★★★★★ [Student name]: Shipped my first agent in 48 hours."
"★★★★★ [Student name]: Finally understood how to wire tools to Claude."
"★★★★★ [Student name]: This replaced 3 months of YouTube research."

WHAT YOU'LL BUILD:
[3-column grid]
- Agent 1: Research assistant that browses the web
- Agent 2: Meeting scheduler with calendar integration
- Agent 3: Code reviewer with GitHub integration
- Agent 4: Customer support bot with your docs
- Agent 5: Multi-agent pipeline (advanced)

HOW IT WORKS:
1. Watch the module (20–40 min each)
2. Follow along with the project (all code provided)
3. Ship something real by the end of each module

PRICING SECTION:
Founders Price: $67 (limited spots)
Standard Price: $97
[Enroll Now button]
30-day money-back guarantee

TESTIMONIALS:
[3–5 detailed student testimonials with names, photos, outcomes]

FAQ:
- Do I need AI experience? (No)
- What programming languages? (Python or JS)
- Is this just theory? (No — every module ships a real agent)
- How long does it take? (5 hours total, or spread over a week)

FOOTER CTA:
[Button: Start Free Module — No credit card required]
```

### URL Structure
- Organic homepage: `thewebsite.app`
- Paid landing page: `thewebsite.app/start` or `thewebsite.app/ads`
- Use UTM parameters on all paid traffic: `?utm_source=google&utm_medium=cpc&utm_campaign=search-intent`

---

## Part 6: A/B Test Plan

### Test Priority Order

Run one test at a time per channel. Statistical significance requires minimum 1,000 visitors or 30 conversions per variant.

**Test 1 — Headline Copy (Week 1–3)**
- Control: "Build Real AI Agents With Claude — Starting Today"
- Variant: "Stop Reading Tutorials. Ship Your First AI Agent in 48 Hours."
- Metric: Landing page conversion rate (visitor → email signup)
- Winner: Higher conversion rate with 95% confidence

**Test 2 — CTA Button Text (Week 3–5)**
- Control: "Start Free Module"
- Variant: "Get Instant Access"
- Variant B: "Build Your First Agent"
- Metric: Click-through rate on CTA button

**Test 3 — Social Proof Placement (Week 5–7)**
- Control: Testimonials below the fold
- Variant: Testimonial bar immediately below headline
- Metric: Scroll depth + conversion rate

**Test 4 — Pricing Presentation (Week 7–9)**
- Control: Show both $67 and $97 tiers
- Variant: Show only $67 founders tier (urgency-focused)
- Metric: Revenue per visitor (not just conversion rate)

**Test 5 — Ad Creative (ongoing)**
- Run 3 ad copy variations simultaneously
- After 500 impressions per variant: pause lowest CTR
- After 30 conversions per variant: pause lowest CVR
- Continuously introduce new top-performer challengers

### Testing Infrastructure

- Use Vercel Analytics or PostHog for event tracking
- Track: `page_view`, `cta_click`, `email_signup`, `checkout_started`, `purchase`
- UTM parameters capture channel, campaign, ad variation
- Weekly review cadence: every Monday, review prior week performance

---

## Part 7: Retargeting Strategy

Retargeting targets people who have already expressed interest — converting them is 3–5x cheaper than cold acquisition.

### Retargeting Audiences

| Audience | Definition | Ad Type |
|----------|-----------|---------|
| Website visitors (no signup) | Visited site, did not sign up | Reminder ad — "Still thinking about it?" |
| Email signups (no purchase) | On email list, not yet paid | Conversion ad — testimonials + scarcity |
| Course page visitors | Viewed /course but didn't enroll | Direct offer ad — "Founders pricing ends soon" |
| Past purchasers (upsell) | Bought Module 1, not premium | Upsell ad — "Complete the full course" |

### Retargeting Platforms
- **Google Display Network**: Pixel-based, targets website visitors across the web
- **Twitter/X**: Tailored audiences from email list upload
- **Meta (Facebook/Instagram)**: Custom audience from pixel (optional — add only if organic Meta presence develops)

### Retargeting Budget
Allocate 20% of total paid budget to retargeting once audience sizes are sufficient (minimum 500 cookied visitors for Google, 1,000 emails for Twitter).

| Channel | Retargeting Budget (% of channel) |
|---------|------------------------------------|
| Google | 30% — display retargeting |
| Twitter/X | 20% — email list promotion |
| Reddit | Not available for retargeting |
| YouTube | 20% — remarketing lists |

### Retargeting Creative Rules
- Never show the same ad someone has already seen — use frequency caps (max 3 impressions/day)
- Email-list retargeting: reference that they're already subscribed ("You've been learning with us — here's the next step")
- Use scarcity authentically only — if founders pricing has a real deadline, use it; if not, don't fake urgency

---

## Part 8: Metrics & Tracking

### North Star Metrics

| Metric | Target | Measurement |
|--------|--------|------------|
| CTR (click-through rate) | 2%+ | Ad platform dashboard |
| Landing page CVR | 10%+ | Analytics (visitors → signups) |
| Paid CVR (signup → purchase) | 5%+ | Stripe + email analytics |
| CPA (cost per subscriber) | <$20 | Total spend / new signups |
| CPA (cost per customer) | <$50 | Total spend / new purchases |
| ROAS | 3x minimum | Revenue attributed / ad spend |
| LTV:CAC | 5:1 target | 12-month LTV / blended CAC |

### Weekly Reporting Template

Every Monday, review:

1. **Spend by channel**: Actual vs. budget
2. **Impressions, clicks, CTR** per campaign
3. **Conversion events** (signups, purchases) attributed to paid
4. **CPA** per channel — pause any channel above $40 CPA
5. **ROAS** per channel — scale any channel above 4x ROAS
6. **Top/bottom performing ad creatives** — pause bottom 20%
7. **A/B test status** — any tests ready for a winner call?

### Attribution Model

Use last-click attribution for initial setup — it's imperfect but simple.

UTM parameter structure:
```
utm_source: google | twitter | reddit | youtube
utm_medium: cpc | paid_social | display
utm_campaign: search-intent | ai-enthusiasts | retargeting
utm_content: variation-a | variation-b | etc.
utm_term: [keyword for Google]
```

Capture UTM parameters on signup and store in database alongside email — this enables cohort analysis of paid vs. organic subscriber quality.

### Decision Rules

| Observation | Action |
|-------------|--------|
| CTR < 0.5% after 1,000 impressions | Replace ad creative |
| CTR 0.5–2% | Optimize targeting, test new copy |
| CTR 2%+ but CVR < 5% | Landing page issue — A/B test |
| CPA > $40 | Pause channel, audit funnel |
| CPA < $20 | Increase budget 25% per week |
| ROAS < 2x after $100 spend | Pause, diagnose |
| ROAS 3–5x | Hold and optimize |
| ROAS 5x+ | Scale aggressively |

---

## Part 9: Campaign Launch Sequence

When all three gates are passed, execute in this order:

### Week 1 — Setup & Warm-Up
- [ ] Create paid landing page at `/start` or `/ads`
- [ ] Install Google Ads pixel + conversion tracking
- [ ] Install Twitter/X pixel + conversion event
- [ ] Set up UTM parameter tracking in database
- [ ] Create Google Ads account — submit 3 ads per campaign for review
- [ ] Create Twitter/X Ads campaign with Variation A + B
- [ ] Set daily budgets 20% below targets for first 3 days (warm-up)

### Week 2 — Launch & Monitor
- [ ] All campaigns live
- [ ] Monitor daily: CPA, CTR, conversion events
- [ ] Pause any ad with CTR < 0.3% after 500 impressions
- [ ] Add to negative keyword list as search terms come in

### Week 3 — Reddit Add
- [ ] Create Reddit Ads account
- [ ] Submit Variation C + E ads
- [ ] Target r/ClaudeAI and r/LangChain first

### Week 4 — First Optimization Review
- [ ] Run full performance review against targets
- [ ] Kill any channel below 1.5x ROAS
- [ ] Scale any channel above 4x ROAS by 25%
- [ ] Launch first A/B test (headline copy)

### Month 2 — YouTube & Retargeting
- [ ] Retargeting campaigns live (Google Display + Twitter email list)
- [ ] YouTube test if video creative is ready
- [ ] Increase total budget to $750–1,000/month if ROAS targets are hit

---

## Part 10: Risk Management

### Risks and Mitigations

| Risk | Mitigation |
|------|-----------|
| High CPA on all channels | Fix landing page CVR first — ads aren't the problem |
| Low CTR (< 0.5%) | Replace ad creative — headline or image is wrong |
| High click volume, low conversions | Landing page/offer mismatch — A/B test LP |
| Budget exhausted with no signal | Review audience targeting — likely too broad |
| Google disapproves ads | Have backup variations ready; review policy compliance |
| Competitors bidding on our brand keywords | Monitor and counter-bid — protect brand at all costs |

### Monthly Budget Kill Switch

If, after 30 days of paid ads, blended CPA exceeds $60 (3x target), pause all paid spend and conduct a funnel audit before restarting. Do not continue spending on a broken funnel.

---

## Appendix: Quick-Reference Summary

| Dimension | Decision |
|-----------|---------|
| Start date | After 100 organic signups + 30 paying students + 5 testimonials |
| Initial budget | $500/month |
| Primary channel | Google Search Ads (highest intent) |
| CAC target | <$20 per subscriber, <$50 per customer |
| LTV target | $100+ (12-month) |
| ROAS target | 3x minimum, 5x to scale |
| Scale trigger | 5x ROAS sustained for 2 weeks → double budget |
| Kill trigger | CPA > $60 after 30 days → pause and audit |
| Landing page | Dedicated `/start` page, no nav, single CTA |
| A/B testing | One test at a time, 1,000 visitors or 30 conversions minimum |
| Retargeting | Launch when 500+ site visitors cookied |
| Reporting | Weekly every Monday |
