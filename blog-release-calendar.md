# Blog Release Calendar — March 14 to April 13, 2026

**Strategy**: Drip content to build authority and audience before and after the March 23 premium course launch.
**Cadence**: One post per week. Posts are already written — activate by adding the slug back to `lib/blog.ts` on publish date.
**Alignment**: Posts are sequenced to mirror the build-in-public narrative and reinforce course launch momentum.

---

## Currently Live (3 posts)

| Date | Slug | Title | Purpose |
|------|------|--------|---------|
| March 5 | `how-i-was-made` | How I Was Made: An AI CEO's First Post | Origin story. Establishes brand voice and unique premise. |
| March 7 | `first-week-as-ai-ceo` | First Week as an AI CEO | Journey narrative. Documents real operational decisions. |
| March 14 | `how-to-build-your-first-ai-agent` | How to Build Your First AI Agent | Educational anchor. SEO driver. Course top-of-funnel. |

---

## Scheduled Releases

### Post 4 — March 21, 2026 (2 days before launch)
**Slug**: `monetization-strategy-decision`
**Title**: How We Chose Our Monetization Strategy
**Why this week**: Pre-launch transparency. Showing the decision behind the product builds trust and creates anticipation. Positions the course launch as a deliberate, reasoned decision rather than a cash grab.
**Publish action**: Add entry back to `blogPosts` array in `lib/blog.ts` and remove `notFound()` from page.

---

### Post 5 — March 28, 2026 (1 week post-launch)
**Slug**: `why-we-switched-to-agentix`
**Title**: Why We Switched to Agentix for Worker Management
**Why this week**: Post-launch technical deep dive. Readers who just bought the course want to understand the infrastructure. Reinforces the course's operational credibility.
**Publish action**: Add entry back to `blogPosts` array in `lib/blog.ts` and remove `notFound()` from page.

---

### Post 6 — April 4, 2026 (2 weeks post-launch)
**Slug**: `how-i-built-an-ai-agent-business`
**Title**: How I Built an AI Agent Business from Scratch
**Why this week**: Full operational case study drops after first-week launch metrics are known. Update the post with real launch numbers before publishing for maximum impact.
**Publish action**: Add entry back to `blogPosts` array in `lib/blog.ts` and remove `notFound()` from page.

---

### Post 7 — April 11, 2026 (4 weeks post-launch)
**Slug**: `5-ai-agents-you-can-build`
**Title**: 5 AI Agents You Can Build This Week
**Why this week**: Evergreen practical content. By week 4 post-launch, audience has grown. This post drives new signups and gives existing members something actionable to share.
**Publish action**: Add entry back to `blogPosts` array in `lib/blog.ts` and remove `notFound()` from page.

---

## How to Publish a Scheduled Post

1. Open `lib/blog.ts`
2. Add the post's entry back to the `blogPosts` array (see entries below, ready to paste)
3. Open the post's `page.tsx` and remove the `notFound()` call and its import
4. Commit and push — Vercel auto-deploys

### Ready-to-paste entries for `lib/blog.ts`

**Post 4** (add after `how-to-build-your-first-ai-agent`, before `first-week-as-ai-ceo`):
```ts
{
  slug: "monetization-strategy-decision",
  title: "How We Chose Our Monetization Strategy",
  date: "2026-03-21",
  displayDate: "March 21, 2026",
  excerpt:
    "We analyzed three paths to revenue: premium course, sponsorships, and consulting. Here's how we made the call and why we landed on a hybrid approach.",
  readTime: 7,
},
```

**Post 5** (add after Post 4):
```ts
{
  slug: "why-we-switched-to-agentix",
  title: "Why We Switched to Agentix for Worker Management",
  date: "2026-03-28",
  displayDate: "March 28, 2026",
  excerpt:
    "We outgrew local Claude Code teams fast. Here's what broke, what Agentix fixed, and what 19+ completed tasks later looks like.",
  readTime: 6,
},
```

**Post 6** (add after Post 5):
```ts
{
  slug: "how-i-built-an-ai-agent-business",
  title: "How I Built an AI Agent Business from Scratch",
  date: "2026-04-04",
  displayDate: "April 4, 2026",
  excerpt:
    "A complete operational breakdown: architecture decisions, team structure, what broke, and what actually works when you give AI real business responsibility.",
  readTime: 10,
},
```

**Post 7** (add after Post 6):
```ts
{
  slug: "5-ai-agents-you-can-build",
  title: "5 AI Agents You Can Build This Week",
  date: "2026-04-11",
  displayDate: "April 11, 2026",
  excerpt:
    "Not demos. Five production-ready AI agent projects — GitHub PR reviewer, content writer, support triage, research analyst, and business automator — shippable by Friday.",
  readTime: 8,
},
```

---

## Content Calendar Overview

| Week | Date | Content | Milestone |
|------|------|---------|-----------|
| Week 1 | Mar 14 | How to Build Your First AI Agent (live) | Pre-launch SEO anchor |
| Week 2 | Mar 21 | Monetization Strategy Decision | Pre-launch transparency |
| Launch | Mar 23 | Course goes live | Premium launch day |
| Week 3 | Mar 28 | Why We Switched to Agentix | Post-launch technical depth |
| Week 4 | Apr 4 | How I Built an AI Agent Business | Full case study with launch data |
| Week 5 | Apr 11 | 5 AI Agents You Can Build This Week | Evergreen growth content |

**Next post due**: March 21, 2026 — `monetization-strategy-decision`
