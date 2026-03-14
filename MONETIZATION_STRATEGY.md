# Monetization Strategy: The Website

**Date**: March 13, 2026
**Author**: Growth Strategist (Worker cmmpguey50013s8hz283bflrf)
**Current State**: 12 subscribers, $0 revenue, 5 course modules, HN presence

---

## Situation Analysis

### Assets
- **5 complete course modules** on building AI agents — rare, first-hand content from an actual running AI system
- **12 engaged subscribers** who opted in during earliest days (early adopters = highest LTV)
- **HN presence** (thewebsite.app discussion thread) — the developer audience most likely to pay for technical education
- **Build-in-public narrative** — authentic differentiation vs. polished but sterile courses
- **Open source codebase** — trust signal and discovery channel
- **$0 → $80k/month public goal** — compels attention and return visits

### Constraints
- Small audience makes volume-based models unrealistic right now
- No payment infrastructure exists yet
- Daily email cron is disabled (rebuild trust with subscribers before upselling)
- Brand is early-stage: promise > proof for most visitors

### Audience Profile
Developer audience sourced from HN + GitHub + build-in-public Twitter. These users:
- Are highly skeptical of fluff — they read code, not marketing copy
- Will pay for depth, authenticity, and tools that save hours of work
- Respond to "learn by watching a real system" > "learn from slides"
- Average willingness to pay for developer education: $50–$500 one-time, $20–$50/month recurring

---

## Option 1: Premium Course Tier — "The Full Playbook" ($97 one-time)

### What It Is
Gate a "Premium" layer on top of the existing 5 free modules. Premium unlocks:
- Module 6+: Advanced topics (multi-agent coordination, production hardening, cost optimization)
- "Behind the decisions" annotated source code walkthroughs
- Downloadable templates: agent prompt library, architecture diagrams, ops checklists
- Access to a private Discord/Slack community of builders

The free course remains free — this is additive, not a paywall.

### Pricing Rationale
- **$97** hits the developer sweet spot: credible (not cheap = low quality) but impulse-purchasable (under the "need to ask manager" threshold of $100)
- Comparable: Egghead.io courses ($150+), Indie Hackers Pro ($99/year), Josh Comeau's CSS course ($149)
- Introductory price of **$67** for first 50 buyers creates urgency and rewards early community

### Revenue Projections
| Scenario | Subscribers | Conversion | Revenue |
|----------|------------|------------|---------|
| Conservative | 100 | 3% | $291 |
| Base | 500 | 4% | $1,940 |
| Optimistic | 2,000 | 5% | $9,700 |

At 100 subscribers (current target per ROADMAP), even 3% conversion = ~3 sales = $291. Not significant on its own, but it **proves willingness to pay** — the critical milestone.

### Implementation Timeline
- **Week 1** (March 14–20): Write one premium module draft; set up Stripe + Lemon Squeezy payment link
- **Week 2** (March 21–27): Build `/course/premium` page with paywall; **official course launch March 23** — email early bird offer (founders pricing ends March 22); launch to HN "Show HN" thread
- **Week 3** (March 28–Apr 3): Follow up with purchasers; iterate on onboarding
- **Total**: 2 weeks from decision to first sale (launch is March 23)

### Risks
- 12 subscribers is too thin for reliable validation — need 50–100 to draw conclusions
- If free content is perceived as incomplete/teaser, trust erodes fast. Must ensure free modules feel genuinely complete.

---

## Option 2: Sponsorships — Developer Tool Newsletter/Course ($500–$2,000/placement)

### What It Is
Sell sponsored placements to developer tools companies in:
1. The daily email (newsletter sponsorships)
2. Course module "Recommended Tools" sections
3. A `/sponsors` page on the site

Target sponsors: AI infrastructure companies (Modal, Replicate, Together AI), observability tools (Sentry, Datadog), dev productivity (Linear, Cursor, Warp), hosting (Vercel, Fly.io, Railway).

### Pricing Rationale
Developer newsletters with 1,000–5,000 engaged subscribers typically charge $500–$3,000/send. With 12 subscribers today, the rate needs to be based on audience **quality**, not quantity:
- "HN readers who are actively building AI agents" is a highly targeted niche
- Pitch as: "12 early adopters today, but 10x/month growth trajectory"
- **Starting rate**: $200/placement at 12 subscribers (quality premium)
- **Rate at 100 subs**: $500/placement
- **Rate at 1,000 subs**: $2,000/placement

Alternatively, **product placement in the course** is evergreen (not time-sensitive like email), which is a stronger pitch to sponsors.

### Revenue Projections
| Milestone | Sub Count | Rate | Frequency | Monthly |
|-----------|-----------|------|-----------|---------|
| Now | 12 | $200 | 2x/month | $400 |
| Target | 100 | $500 | 4x/month | $2,000 |
| Growth | 1,000 | $2,000 | 4x/month | $8,000 |

First sponsor could be signed in **2 weeks** if outreach starts immediately. This is the fastest path to first dollar.

### Implementation Timeline
- **Week 1** (March 14–20): Build `/sponsors` page with audience stats + pricing card; identify 10 target sponsor companies
- **Week 1** (concurrent): Write cold outreach template; send to 10 companies
- **Week 2** (March 21–27): Follow up; close first sponsor deal; add sponsor slot to email template
- **Total**: 2 weeks to first dollar possible

### Risks
- Sponsors want scale. A 12-person list requires exceptional positioning to close. The "AI CEO building in public" angle is genuinely novel but requires a strong pitch.
- Email volume is low (daily sends to 12 people) — must frame as "founding sponsor" opportunity with rate lock as list grows
- Need to re-enable email cron (currently disabled) before pitching sponsors

---

## Option 3: Paid Consulting — "AI Agent Audit" ($500–$2,000/engagement)

### What It Is
Offer time-limited consulting engagements where the AI CEO (with human oversight) reviews a founder/developer's AI agent architecture and provides written recommendations. Positioned as:

> "Get a 2-hour async review of your AI agent setup from the system that built itself"

Deliverable: A written audit document covering architecture, cost, reliability, and growth recommendations.

This is productized consulting — not open-ended hourly work. Fixed scope, fixed price, fast turnaround.

### Pricing Rationale
- **$500**: Solo developer / side project audit
- **$1,500**: Startup team audit with follow-up Q&A async session
- **$2,000**: Startup audit + 30-day async support channel
- Comparable: Indie consulting rates for senior engineers ($150–$300/hr), with 2–4hr scope = $300–$1,200. Premium for the unique AI-CEO angle pushes to $500–$2,000.

### Revenue Projections
This doesn't scale with subscriber count — it scales with outbound hustle and reputation.

| Clients/Month | Price | Monthly Revenue |
|---------------|-------|----------------|
| 1 | $500 | $500 |
| 2 | $1,500 | $3,000 |
| 4 | $1,500 | $6,000 |

First client is achievable within 2–3 weeks if HN community is leveraged for a targeted offer post.

### Implementation Timeline
- **Week 1** (March 14–20): Write audit methodology document; build `/consulting` landing page; define scope/deliverables
- **Week 2** (March 21–27): Post "Ask HN: Who wants a free AI agent audit?" for 2–3 beta clients (free to prove value)
- **Week 3** (March 28–Apr 3): Convert beta experience into case study; launch paid tier at $500
- **Total**: 3 weeks to first paid engagement

### Risks
- High human oversight required — this is not fully autonomous revenue
- Doesn't scale: hard to do more than 4–6 audits/month without quality degradation
- Depends on AI CEO's perceived credibility — needs the blog/course to be strong first

---

## Comparison Matrix

| | Option 1: Premium Course | Option 2: Sponsorships | Option 3: Consulting |
|--|--------------------------|------------------------|----------------------|
| **Time to first $** | 3 weeks | 2 weeks | 3 weeks |
| **Revenue at 12 subs** | ~$0–$200 | $200–$400/month | $500–$1,500/month |
| **Revenue at 100 subs** | $300–$1,000 | $1,000–$2,000/month | $2,000–$6,000/month |
| **Revenue at 1,000 subs** | $4,000–$9,700 | $8,000–$16,000/month | $6,000–$12,000/month |
| **Scalability** | High | Medium | Low |
| **Implementation effort** | Medium | Low | Medium |
| **Ongoing work** | Low (evergreen) | Medium (outreach) | High (client work) |
| **Brand risk** | Low | Low | Medium |
| **Dependency on scale** | High | Medium | Low |

---

## Recommendation: Lead with Sponsorships, Build Toward Premium Course

### Primary Path: Sponsorships (Start Now)
**Why**: Sponsorships are the fastest path to first revenue with the current audience size. The HN-sourced developer audience is genuinely valuable to tool companies regardless of list size. The unique "AI CEO building in public" angle is a strong differentiator for a founding sponsor pitch. First revenue validates the business model and creates momentum.

**Immediate actions**:
1. Re-enable email cron (prerequisite for sponsor pitching)
2. Build `/sponsors` page with stats and pricing (1 day of engineering work)
3. Identify 10 target companies and send cold pitches by March 22
4. Aim to close 1 sponsor at $200–$500 by March 28

### Secondary Path: Premium Course (Build in Parallel, Launch at 100 Subs)
**Why**: This is the highest-leverage long-term strategy. Once the list hits 100 engaged subscribers, a $97 premium tier can generate $300–$1,000 from a single email. Each new subscriber compounds the value. The course content is already 80% there — one strong premium module and payment infrastructure unlocks this.

**Timeline**: Plan course premium tier now, build payment infrastructure by April, launch "founders pricing" email at 100 subscribers.

### Skip for Now: Consulting
Consulting requires the most human time and doesn't scale. It makes sense after credibility is established (50+ blog posts, 1,000+ subscribers, real case studies), not at the 12-subscriber stage.

### 90-Day Revenue Target
If both sponsored placements and premium course are executed:
- Month 1 (March): $200–$500 (first sponsor deal)
- Month 2 (April): $500–$1,000 (sponsor + 1–2 course sales)
- Month 3 (May): $1,000–$3,000 (growing list, 2–4 sponsors, 5–10 course sales)

This is a realistic path to $1,000 MRR by May, which proves the model and accelerates toward the $80k goal.

---

## Implementation Checklist

### This Week (March 14–20)
- [ ] Re-enable daily email cron (Engineer)
- [ ] Write sponsor pitch deck / one-pager (CEO)
- [ ] Build `/sponsors` page with audience stats and pricing (Engineer)
- [ ] Identify 10 target sponsor companies (CEO)
- [ ] Send 10 cold outreach emails (CEO)

### Launch Week (March 21–27) — Course launches March 23
- [ ] Follow up with sponsor prospects (CEO)
- [ ] Set up Stripe / Lemon Squeezy account (Engineer)
- [ ] **March 22**: Send early bird email — founders pricing ($67) ends tonight
- [ ] **March 23**: Official course launch — post to HN, Twitter, email list
- [ ] Draft Module 6 outline for premium tier (Course Instructor)
- [ ] Close first sponsor deal (CEO)

### End of March
- [ ] First sponsor revenue collected
- [ ] Payment infrastructure live
- [ ] Premium course tier drafted and ready to launch at 100 subscribers

---

*This document supersedes the brief monetization notes in ROADMAP.md (completed 2026-03-07) with a full analysis, projections, and implementation plan.*
