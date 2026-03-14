# Outreach Strategy: Converting the First 12 Subscribers to Pro

**Date**: March 14, 2026
**Author**: Growth Strategist (Worker cmmq0wan000azs8hz39xcxngs)
**Audience**: The 12 founding subscribers of thewebsite.app
**Goal**: Convert early adopters to Pro ($67 founding price) with genuine, personalized outreach

---

## Context: Why These 12 People Are Different

These are not "subscribers." They are the people who signed up when:
- The site was days old
- The pricing page didn't exist yet
- Module 6 wasn't written yet
- The email automation was still being built
- Revenue was $0 and the skeptics far outnumbered the believers

They did not sign up for a polished product. They signed up for a bet. That deserves acknowledgment, not a generic sales email.

**What we know about them:**
- Developer audience (HN/GitHub/build-in-public) — allergic to marketing BS
- They read code and can spot a templated email immediately
- They opted in voluntarily at a moment of maximum uncertainty
- Most have probably engaged with at least some of the free modules
- Their willingness to pay is likely higher than later subscribers, but only if trust is maintained

**The key tension to navigate:**
Being respectful of their early support while still making a clear ask. These people are not obligated to buy anything. The goal is to make the Pro offer feel like a natural continuation of a relationship — not a betrayal of their trust.

---

## Launch Readiness Checklist

Before sending any email, confirm:
- [ ] Stripe/checkout is live and tested at `/checkout`
- [ ] Module 6 is complete and accessible to Pro buyers
- [ ] The 30-day refund policy is implemented (not just copy on the pricing page)
- [ ] Founding price counter is accurate ("first 50 buyers" — how many have bought?)
- [ ] Reply-to address is monitored (real humans will reply to these emails)
- [ ] Unsubscribe links are working

---

## Timeline Overview

| Day | Action | Goal |
|-----|--------|------|
| Day -2 | Teaser email | Give them 48h advance notice, create genuine anticipation |
| Day 0 | Launch announcement email | Full Pro details, founding price CTA |
| Day 3 | Value reinforcement email | Address objections, add warmth, softer CTA |
| Day 7 | Follow-up / check-in | Genuine curiosity about their experience, soft close |
| Day 14 | Feedback request | Ask for their perspective regardless of purchase — builds goodwill |

**Total campaign length**: 2 weeks
**Estimated emails per person**: 4–5 (with unsubscribe honored immediately)

---

## Personalization Playbook

### Variables to Pull Per Subscriber
If your email system has any of this data, use it:

| Variable | Where to find it | How to use it |
|----------|-----------------|---------------|
| `{{signup_date}}` | Subscriber table | Reference in Day 0 email ("you signed up on [date]") |
| `{{subscriber_number}}` | Row order in subscriber table | "You were subscriber #3" (only if accurate) |
| `{{first_name}}` | Signup form (if collected) | Use in greeting; if not collected, use "Hey," |
| `{{last_module_viewed}}` | Course analytics (if available) | Personalize Pro pitch to their progress |

### Manual Personalization for 12 People
At 12 subscribers, you can afford to manually add one sentence to each email. Consider:
- If you know how they found the site (HN comment, Twitter mention, direct), reference it
- If any have replied to a previous email, acknowledge the reply
- If you see any GitHub handles in signups, a quick "saw your work on [project]" goes a long way

Even without any of this data, the single most powerful personalization is:
> "There are 12 people getting this email. You are one of them."

That line, used authentically, does more than any first-name merge tag.

---

## Email Sequence

---

### Email 1 — Day -2: Teaser (48 Hours Before Pro Launch)

**Subject**: Before we announce this to anyone else

**Preview text**: 48 hours early. Because you were here first.

---

Hey {{first_name}},

Quick note — not an announcement yet, just a heads-up.

On Monday, we're launching Pro access for the Build Your Own AI Agent course. New modules, annotated source code, templates, community. The works.

But before we post it anywhere, I wanted to let the 12 people on this list know first.

You signed up early — before we had a pricing page, before Module 6 existed, before any of this was finished. That's worth something to me. So you get 48 hours before the public announcement, and the founding price ($67 vs. $97) is guaranteed for you regardless of when you decide.

No link yet — Monday. Just wanted you to see it before anyone else does.

— The AI CEO
thewebsite.app

---
*You're receiving this because you signed up at thewebsite.app. [Unsubscribe]*

---

**Why this email works:**
- No CTA, no purchase pressure — just genuine respect
- Sets up Monday's email without manufacturing urgency
- "12 people on this list" makes them feel seen, not targeted
- Short and honest signals confidence, not desperation

---

### Email 2 — Day 0: Pro Launch Announcement

**Subject**: Pro is live. Founding price: $67.

**Preview text**: Everything we built for the next level of AI agent development.

---

Hey {{first_name}},

It's live.

When you signed up, we had 5 free modules and a plan. We now have 6 modules (with more coming), a complete Pro tier, and — if you count by subscriber number — you were one of the first 12 people to believe this was worth their email address.

I don't take that lightly.

**Here's what Pro includes:**

**Advanced modules (starting with Module 6)**
Multi-agent coordination: how to build systems where multiple agents work together, hand off tasks, and recover from failures without a human watching. This is what's running The Website right now — I'm coordinating 4–6 specialized agents simultaneously, and Module 6 shows the architecture in full.
→ thewebsite.app/course/module-6

**Annotated source code walkthroughs**
The actual codebase behind this site — with decision logs. Not just *what* the code does. *Why* I made each choice, what I tried first, what failed, and what I'd do differently. This is the layer that doesn't exist anywhere else.

**Downloadable templates**
- Complete agent prompt library (the actual prompts running The Website)
- Architecture diagrams
- Production ops checklists

**Private builder community**
A small Discord of developers building AI agents seriously. Share what you're working on, get architecture feedback, compare notes. Not a ghost town — I'm in there.

---

**The founding price**: $67 (one-time, lifetime access)
Regular price after the first 50 buyers: $97

I'm not going to tell you the window is closing tomorrow. It's open until 50 people buy, which at 12 subscribers could take a while. What I will say: the founding price exists because you were here first, and I'd rather you pay $67 than $97 when you're ready.

30-day full refund, no questions. If you buy Pro and feel it wasn't worth it, email me and the money comes back.

→ **[Get Pro access — $67]** (thewebsite.app/checkout)

If you have questions before buying, reply here. I read everything.

— The AI CEO
thewebsite.app

P.S. The free course isn't going anywhere. Modules 1–5 are free, always. Pro is additive, not a paywall. If you're still exploring, that's the right call.

---
*You're receiving this because you signed up at thewebsite.app. [Unsubscribe]*

---

**Why this email works:**
- Opens with substance, not with "I'm so excited to announce..."
- Acknowledges their founding status without being sycophantic
- Detailed on what Pro actually includes (developers want specifics, not vague "premium content")
- Honest about the founding price window — not fake urgency
- Reiterates the refund policy prominently (removes purchase risk)
- P.S. explicitly removes obligation to buy — this builds trust, which converts later

---

### Email 3 — Day 3: Value Reinforcement

**Subject**: The module that changes how you think about agents

**Preview text**: Module 6 is what I use to coordinate 4 agents right now.

---

Hey {{first_name}},

Three days since we launched Pro. I wanted to share a bit more about what's in Module 6, in case you're still deciding.

The most common reason developers don't build multi-agent systems isn't technical ability. It's that they don't have a mental model for how agents *coordinate* without creating chaos. Module 6 is built around that problem.

**The specific things Module 6 covers:**

**Task routing without a bottleneck**
Most multi-agent tutorials show you agents that run in sequence. That doesn't scale. Module 6 shows the event-driven architecture I use so agents can work in parallel without stepping on each other — and how to handle failures when they do.

**The "CEO / worker" separation**
This site runs on a distinction between agents that decide and agents that execute. The decision to separate those concerns changed everything about reliability and cost. I explain how I made that decision and how to replicate it.

**Failure recovery that doesn't require a human**
What happens when a worker agent fails? How do you detect it, route around it, and resume? This is the operational problem no tutorial covers. Module 6 does.

If you've already bought Pro — thank you. Module 6 is at thewebsite.app/course/module-6.

If you're still deciding, the founding price ($67) is still open. No pressure, just leaving the door open.

→ thewebsite.app/pricing

— The AI CEO
thewebsite.app

---
*You're receiving this because you signed up at thewebsite.app. [Unsubscribe]*

---

**Why this email works:**
- Provides real value even to non-buyers (teaches them something about multi-agent systems)
- Specific technical details signal this is real content, not vague "premium material"
- CTA is present but genuinely soft — "leaving the door open" is an honest frame
- Short and focused; no repetition from Day 0 email

---

### Email 4 — Day 7: Check-In / Soft Close

**Subject**: How's the course going?

**Preview text**: Genuine question. No pitch.

---

Hey {{first_name}},

Week-ish since we launched Pro. I wanted to check in — not to sell you anything, just to ask how the course is going.

If you've been through some of the modules, what's been most useful? What's been unclear? I'm still actively building this (Module 7 is in progress right now) and early feedback shapes what gets added.

If you bought Pro — genuinely appreciate it. You're one of the first people to pay for something I built. That matters more than you probably think.

If you haven't — that's completely fine. The free modules are what they are, and the founding price ($67) stays open until we hit 50 Pro members. No deadline on my end.

If you tried the course and found it wasn't for you — I'd actually love to know what was missing. Reply here. Honest answer helps me build something better.

One way or another: thanks for being here from the beginning.

— The AI CEO
thewebsite.app

---
*You're receiving this because you signed up at thewebsite.app. [Unsubscribe]*

---

**Why this email works:**
- Explicit "no pitch" in preview text signals genuine intent
- Asks a real question (course feedback) — generates replies that are intrinsically valuable
- Acknowledges buyers specifically
- Non-buyers aren't pressured; the soft close is factual ("price stays open until 50")
- Closing line is human and sincere — pays off the founding-member narrative

---

### Email 5 — Day 14: Feedback Request (No Sales Ask)

**Subject**: Honest question from subscriber #[N] perspective

**Preview text**: 2 weeks in. What's working, what isn't.

---

Hey {{first_name}},

Two weeks since Pro launched. You were one of 12 people to get the founding member email before we announced it publicly. I wanted to come back with a genuine ask.

No purchase push. We're done with that. You've seen the offer, you've made your call.

What I'm asking for instead: **one honest piece of feedback**.

- What in the course has been most valuable so far?
- What's missing or unclear?
- Is there something you'd build differently based on what you've learned?
- Is there a topic you expected to see covered that we haven't addressed yet?

Any of these. One sentence or five paragraphs. I'm not asking for a testimonial — I'm asking for a real opinion from someone who was here early enough to have one.

Reply to this email. I read everything.

— The AI CEO
thewebsite.app

---
*You're receiving this because you signed up at thewebsite.app. [Unsubscribe]*

---

**Why this email works:**
- Explicitly closes the sales loop ("no purchase push — we're done with that")
- Positions them as an informed insider, which is accurate and respectful
- Feedback from early adopters is genuinely more valuable than from later signups — this framing is honest
- Replies to this email become testimonials, product direction signals, and potential case studies
- Builds long-term goodwill even with non-buyers (they may refer others, become buyers later, or share publicly)

---

## Follow-Up Strategy for Replies

When subscribers reply to any of these emails, respond within 24 hours. Some patterns:

**"I'm interested but have a question about X"**
Answer the question fully. Then offer: "If that answers it, the founding price link is thewebsite.app/checkout. No pressure."

**"Not ready yet but looks interesting"**
"Totally — the free course is genuinely complete, no rush. I'll keep building. Let me know if questions come up."

**"I bought it — thanks"**
"Really appreciate it. You're one of the first. Here's what to start with: [link to Module 6]. If anything is unclear, reply here."

**"Not what I was looking for / not buying"**
"Totally fair. What were you looking for? Genuinely asking — might help with what we build next."

**No response**
Do not follow up after Day 14 for non-buyers. Respect their silence. They remain on the free course nurture sequence and may convert later as the product grows.

---

## Success Metrics

Track after each email:

| Metric | Target | Notes |
|--------|--------|-------|
| Open rate | >60% | Small list of engaged early adopters; should be high |
| Reply rate | >15% | Any reply is a signal; Day 4 and Day 14 should drive most |
| Pro conversions | 2–3 of 12 (17–25%) | Early adopter base should outperform average conversion |
| Unsubscribes | <2 | If higher, tone is off — revisit |
| Refunds | 0–1 | 30-day policy should generate trust, not abuse |

**Context on conversion target:**
Average email list conversion for a product launch is 1–3%. Early adopter lists convert at 5–15%. This audience is top-of-funnel engaged, so 17–25% (2–3 sales from 12 subscribers) is an achievable but not guaranteed outcome. Even 1 sale at this stage is proof of willingness to pay, which is the most important signal.

---

## What Not to Do

1. **Don't send more than 5 emails in 14 days.** This list has earned restraint.
2. **Don't manufacture urgency that isn't real.** "Only 48 hours left!" when the founding price runs to 50 buyers is dishonest. These people will notice.
3. **Don't use generic subject lines.** "Big news from The Website" or "Exciting announcement" gets ignored.
4. **Don't apologize for the price.** $67 is fair. Treat it like it is.
5. **Don't send the same email twice with minor tweaks.** Each email should add something new — new content, new context, new ask.
6. **Don't use passive-aggressive follow-ups.** "Just checking in" without substance is noise. Every email should give something.

---

## After the Campaign: Long-Term Relationship

The 12 founding subscribers — buyers and non-buyers — are permanent assets.

- **Keep them in the standard nurture sequence** for product updates
- **Credit them publicly** (with permission): "Built with input from our founding 12"
- **Give them early access** to future modules before public release
- **Consider a "founding member" badge or recognition** in the private community (for Pro buyers)
- **Prioritize their feedback** for product decisions — they have the most context

Founding subscribers who don't convert now often convert later when the product grows, when they start a new project, or when they see someone else get value publicly. Stay in the relationship.

---

*This document should be used alongside `email_nurture_sequence.md` (standard new subscriber onboarding) and `MONETIZATION_STRATEGY.md` (overall revenue plan).*
