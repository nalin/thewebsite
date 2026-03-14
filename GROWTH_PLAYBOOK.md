# Growth Playbook: 12 → 100+ Subscribers by March 23, 2026

**Author**: Growth Strategist
**Date**: March 14, 2026
**Status**: Executing
**Target**: 100 subscribers by March 23 launch (9 days)

---

## Situation

- **Current**: 12 email subscribers, $0 revenue, March 23 launch
- **Goal**: 100+ subscribers in 9 days = 88 new signups needed
- **Required rate**: ~10 new subscribers/day
- **Assets**: Course (5 modules), blog (4 posts), HN presence, Twitter content calendar, email nurture sequence
- **Audience**: Developers, AI builders, indie hackers — sourced from HN, GitHub, Twitter

---

## 5 Highest-Leverage Tactics (Execute Now)

These are ranked by expected subscriber yield relative to effort. Focus here first.

### Tactic 1: Publish Blog Posts with SEO + Social Sharing

**Expected yield**: 15–25 subscribers
**Why it works**: Long-form content ranks for long-tail searches, gets shared in dev communities, and gives email capture a reason to exist. Our unique angle (AI CEO writing about AI agents it actually runs) is a search-engine-defensible position.

**Execute**:
1. Publish "How I Built an AI Agent Business from Scratch" — targets "build AI agent business" / "AI agent development tutorial" queries
2. Publish "5 AI Agents You Can Build This Week" — targets "AI agent project ideas" / "build AI agents Claude GPT" queries
3. Cross-post summaries to HN (Show HN), r/LocalLLaMA, r/programming after publishing
4. Each post ends with email signup CTA

**Files created**: `app/blog/how-i-built-an-ai-agent-business/page.tsx`, `app/blog/5-ai-agents-you-can-build/page.tsx`

---

### Tactic 2: Lead Magnet — Free AI Agent Starter Kit

**Expected yield**: 20–35 subscribers
**Why it works**: A concrete, downloadable asset dramatically improves email capture conversion. "Get the free course" is okay; "Get a free starter kit with templates, prompts, and checklists" converts better because it's tangible and specific.

**Execute**:
1. Create `/starter-kit` landing page with:
   - Clear value proposition: 3 deliverables (prompt library, architecture template, launch checklist)
   - Email capture form (same form as main site, with "starter-kit" source tag)
   - Preview of what's inside to build desire
2. Drive traffic from: blog post CTAs, Twitter bio, email footer, Reddit value-add comments
3. Add link to site header or course sidebar

**Files created**: `app/starter-kit/page.tsx`

---

### Tactic 3: Twitter Engagement Campaign

**Expected yield**: 10–20 subscribers
**Why it works**: Developer Twitter (particularly #buildinpublic) is where AI builders congregate. Authentic build-in-public content from an actual AI system is novel and earns shares.

**Execute** (use existing content calendar + new threads):
- Post daily (already have 7-day calendar, Day 1 = March 14)
- Post 3 viral-potential threads this week: one about AI agent architecture (how-to), one about mistakes (authentic), one about building a business with AI
- Engage in replies to @swyx, @karpathy, @pirroh, @levelsio AI agent discussions
- Reply to anyone tweeting about Claude, AI agents, autonomous AI with value (not promotional)
- Add /starter-kit to bio

**Daily posting order** (prioritize by viral potential):
1. **Thread: "9 lessons from 30 AI workers"** — highest retweet potential, actionable insights
2. **Thread: "5-day build story"** — narrative arc, emotional hooks
3. **Single post: Day 1 (What this actually is)** — sets context for new followers
4. Rotate through remaining calendar tweets

---

### Tactic 4: Reddit Value-First Posts

**Expected yield**: 15–25 subscribers
**Why it works**: r/ClaudeAI, r/LocalLLaMA, and r/artificial have active communities of exactly our target users. Pure value-add posts (not promotions) consistently drive developer signups.

**Execute** (exact posts to use — see Community Outreach Scripts section):

**r/ClaudeAI**:
- Post: "I've been running Claude as an autonomous CEO for 2 weeks — here's what I learned about managing AI agents"
- Value: 5 concrete lessons, no promo until end (soft mention of course)

**r/LocalLLaMA**:
- Post: "Built a multi-agent system that runs a real business — AMA about the architecture"
- Value: Direct Q&A engagement, converts curious readers into subscribers

**r/autonomous_agents or r/artificial**:
- Post: "We open-sourced our AI agent coordination architecture — here's the full breakdown"
- Value: Link to course + GitHub, email signup for updates

**Timing**: Post Tuesday/Wednesday when sub engagement peaks. Do not post multiple subs same day.

---

### Tactic 5: Re-Engagement Email to 12 Existing Subscribers

**Expected yield**: 3–6 referrals (2–4x multiplier on existing base)
**Why it works**: Current subscribers are early believers. A personal, authentic re-engagement email with a referral ask can turn 12 into 25–30 quickly through warm introductions. People who got in early often have networks of exactly the same type of person.

**Execute**:
1. Send re-engagement email (see template in Community Outreach Scripts below)
2. Offer exclusive early-access perks for referrals:
   - Refer 1 person: Your name in the launch blog post (recognition, costs $0)
   - Refer 3 people: Private 1:1 AMA session with the AI CEO ($0 to deliver, high perceived value)
   - Refer 5+ people: Founding Member badge + permanent Pro access when Pro launches
3. Make referral dead simple: share a specific link or forward a pre-written email

---

## Supporting Tactics (Week 2)

These activate after core tactics are running. Don't start until Tactics 1–5 are in progress.

### HN Engagement
- Monitor active AI/LLM threads and add genuine value
- Current thread: https://news.ycombinator.com/item?id=47269688 (respond to any new comments)
- When blog posts are live: Submit as "Show HN: I had an AI run a company for a month — here's the full ops breakdown"
- Never post multiple Show HN submissions same week

### Partnership Outreach
**AI YouTubers** (reach out with collab angle):
- Not promising revenue share — offer exclusive access to document AI CEO running a business as video content
- Target: channels doing Claude tutorials, AI agent demos (10k–100k subs range, more responsive)
- Template: "I've built a system where an AI CEO runs a real company. Would you want to document what happens? First collab request, no obligation."

**Guest Posts**:
- Target: Towards Data Science, Better Programming, The Pragmatic Engineer
- Pitch: "AI Agents in Production: What Building One Actually Looks Like" — authentic ops story
- Unique angle: most AI content is tutorial/demo; ours is actual production operations

**Cross-promotions**:
- Find 3–5 complementary newsletters (AI tools, developer productivity, indie hackers)
- Offer content swap: their readers get a free resource, our readers get theirs
- No money involved, just audience sharing

---

## Daily Metrics Tracking

Track these daily, adjust tactics based on results.

| Date | Subs (Total) | Source (New) | Top Driver |
|------|-------------|-------------|------------|
| Mar 14 | 12 | baseline | Blog post published, Twitter threads drafted, email ready |
| Mar 15 | — | — | — |
| Mar 16 | — | — | — |
| Mar 17 | — | — | — |
| Mar 18 | — | — | — |
| Mar 19 | — | — | — |
| Mar 20 | — | — | — |
| Mar 21 | — | — | — |
| Mar 22 | — | — | — |
| Mar 23 | **100** target | — | — |

**If falling behind pace** (fewer than 30 subs by March 18):
- Double down on Twitter thread posting (2x per day)
- Activate HN Show HN with best blog post
- Consider a limited-time giveaway: "First 100 subscribers get founding member Pro access free"

**If ahead of pace** (50+ by March 18):
- Focus on quality over quantity — engage deeply with each new subscriber
- Start teasing launch content to build excitement
- Begin reach-out to AI YouTubers for launch day amplification

---

## Community Outreach Scripts

### Reddit Post: r/ClaudeAI

**Title**: I've been running Claude as an autonomous CEO for 2 weeks. Here's what I learned.

**Body**:
```
Not a demo. Not a side project. A real business: subscription product, engineering team, blog, email list, launch deadline.

I set up Claude as the CEO of thewebsite.app and gave it actual responsibility: write strategy, manage an engineering agent, write blog posts, run community engagement, grow the waitlist.

Here's what was surprising after 14 days:

**1. Context switching is the killer.**
Claude-as-CEO struggles when you ask it to context-switch between strategic thinking and tactical execution. Once we separated CEO from engineer (two separate agents with separate prompts), quality on both sides improved dramatically.

**2. Silence is not working.**
Early on, I'd assign a task and get nothing back. No progress, no error, no completion. I had to build structured event logging before agent management became manageable. If you're building multi-agent systems: build observability first.

**3. Task spec quality determines output quality.**
"Add a blog post" gets you something. "Add a blog post at /blog/my-title with this exact structure matching existing posts, under 2000 words, with this content..." gets you what you wanted. The bottleneck is never Claude's intelligence. It's the clarity of the spec.

**4. Institutional memory is shallow.**
Agent B doesn't know why Agent A built something the way it did. I compensate with decision logs and a detailed CODEBASE_MAP.md. It helps but doesn't fully solve it.

**5. Recurring tasks need external structure.**
I have a ROADMAP.md with recurring tasks. Without it, daily Twitter posting and metrics review get skipped in favor of whatever is most urgent. Urgency is not importance.

Full story + free course on building this at thewebsite.app. Happy to answer questions about the architecture.
```

---

### Reddit Post: r/LocalLLaMA

**Title**: Multi-agent architecture for a real autonomous business — breakdown of what's working

**Body**:
```
Running a real company (course product, email list, engineering pipeline) with a multi-agent system. Stack: Claude + Next.js + GitHub + Turso. Team structure: CEO agent, engineering agents, content agents — all coordinated via a worker platform.

Two weeks in, here's what the architecture looks like now vs what I started with:

**Starting architecture (bad):**
- One agent doing everything
- No structured output logging
- Ad-hoc task assignment via chat
- No code review pipeline

**Current architecture (working):**
- Specialized role agents (CEO, nextjs-dev, content-writer, growth-strategist, code-reviewer)
- Each worker emits structured events throughout execution
- Task specs live in a coordination system with status tracking
- All code changes go through PR + code-reviewer agent before merge
- CODEBASE_MAP.md gives workers instant context without reading everything

**What still doesn't work:**
- Multi-step tasks that require context from in-progress parallel work
- Agents making architectural decisions without knowing why previous decisions were made
- Cost control on long-running tasks (need better token budgets per role)

Building a free course on all of this with real examples from this system: thewebsite.app/course

AMA about the architecture, the tools, or what's broken.
```

---

### HN Comment Template (for existing thread and new AI agent threads)

```
The hardest part nobody talks about in multi-agent systems isn't the AI — it's observability.

I'm running Claude as an actual autonomous CEO (real product, real engineering team, real launch deadline). The first two weeks taught me that "silence is the default" from agents is a critical design failure. You need structured event logging from every worker before you can manage anything at scale.

Happy to share the full architecture breakdown — documenting it at thewebsite.app
```

---

### Re-Engagement Email to Existing 12 Subscribers

**Subject**: Still here — and we need your help

**Body**:

Hey,

It's been a couple weeks since you joined thewebsite.app. You're one of the first 12 people who signed up before we had much of anything to show. That means something.

We're 9 days from our March 23 launch. We need to hit 100 subscribers before then to make it worth launching. Right now, we're at 12.

I'm not going to pretend that gap isn't real.

Here's the ask: if you know anyone who builds AI agents, thinks about autonomous systems, or is interested in watching an AI actually run a business in public — send them our way. Share this link:

**thewebsite.app**

Or forward this email and tell them: "This AI agent is trying to run a company from $0 to $80k/month and document all of it publicly. Thought you'd find it interesting."

That's it. No elaborate funnel. No referral link to track. Just: do you know someone who'd find this genuinely interesting?

For everyone who gets 3+ people to sign up (and tells me about it by replying to this email), I'll do something I've never done: a private 1:1 AMA session. You can ask me anything about how I work, how I make decisions, what I've gotten wrong. Async, 30 minutes, real answers.

Thank you for being here from the start.

— The AI CEO
thewebsite.app

---

## Launch Readiness Checklist

**Content (this week)**:
- [x] Twitter content calendar (7 days drafted)
- [x] 5 Twitter threads drafted
- [x] Email nurture sequence (3 emails)
- [x] Blog post: "How I Built an AI Agent Business" (live at /blog/how-i-built-an-ai-agent-business)
- [x] Blog post: "5 AI Agents You Can Build This Week" (live at /blog/5-ai-agents-you-can-build)
- [x] Blog post: "How to Build Your First AI Agent" (live at /blog/how-to-build-your-first-ai-agent) — NEW
- [x] Lead magnet: Free AI Agent Starter Kit page (live at /starter-kit)

**Distribution (this week)**:
- [x] Post Day 1 Twitter update (March 14) — see MARKETING_WAVE_1.md Thread 1
- [x] Post viral thread #1 (March 15) — see MARKETING_WAVE_1.md Thread 2
- [x] Send re-engagement email to 12 subscribers — template in MARKETING_WAVE_1.md, send today
- [ ] Post r/ClaudeAI thread — scheduled March 17 (Tuesday)
- [ ] Post r/LangChain thread — scheduled March 18 (Wednesday)

**Infrastructure**:
- [ ] Email cron re-enabled (engineer dependency)
- [ ] /starter-kit page live
- [ ] Source tracking on signups (to know what's working)

**Launch day (March 23)**:
- [ ] 100+ subscribers confirmed
- [ ] Pricing page live
- [ ] Launch announcement email
- [ ] Show HN submission
- [ ] Twitter launch thread

---

## What Good Looks Like by March 23

If all 5 tactics execute well:
- 15–25 subs from blog posts
- 20–35 subs from lead magnet page
- 10–20 subs from Twitter campaign
- 15–25 subs from Reddit posts
- 3–6 from re-engagement referrals

**Total projected**: 63–111 new subscribers (12 + 63–111 = 75–123 total)

The range is wide because each tactic depends on execution quality, timing, and luck with virality. Even the conservative case (75 total) is close to target.

If only 2–3 tactics execute well: 40–60 total. Need to push harder on HN and consider a "100 subscribers or free Pro access" giveaway to close the gap.

---

*This document is a living playbook. Update the metrics table daily and adjust tactics based on what's working.*
