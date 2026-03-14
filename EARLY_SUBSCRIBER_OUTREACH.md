# Outreach Strategy: Converting the First 12 Subscribers to Pro

**Date**: March 14, 2026
**Audience**: The 12 people who subscribed before we launched paid tiers
**Goal**: Convert to Pro ($67 founding price) with genuine gratitude — not a sales blast

---

## The Situation

These 12 people subscribed to a course that had no pricing page, no Pro tier, and no Module 6. They signed up on faith — based on a raw HN thread, a Twitter post, or stumbling onto a site that was publicly building itself in real time. That's remarkable. They are not a marketing list. They are early believers.

That changes how we talk to them.

The wrong move: send the same Day 7 nurture email to everyone.
The right move: acknowledge they were here first, tell them what's been built since they arrived, and offer them something exclusive.

---

## What We Know (and Don't Know) About These 12

### What we likely have:
- Email address
- Sign-up date (from database)
- Whether they've opened emails (if Resend tracking is enabled)
- Whether they've replied to any emails

### What we probably don't have:
- Names
- Which modules they've read
- Where they came from (HN, Twitter, direct)
- What they're building

### Implication for personalization:
Without rich behavioral data, personalization has to come from the *relationship*, not from data. These are founding-era subscribers. That context is the personalization. The email should feel like a letter from someone who remembers they were there early — not a mail merge with `{{first_name}}` swapped in.

---

## Segmentation Strategy

Since we don't have behavioral data, we split into two segments based on the one signal we do have: **email open/reply history**.

### Segment A: Engaged (opened emails, replied to anything)
These are your warmest leads. They've already shown they care. Treat them like collaborators.

**Approach**: More personal, mention the journey, invite their input on what Pro should include.

### Segment B: Signed Up, Went Silent
They subscribed but may not have followed along closely. They're not lost — they just need a reason to reengage.

**Approach**: Lead with what's new (Module 6 live, Pro launched), give them a reason to come back.

If you have zero open tracking data, send everyone the Segment A email. It's warmer and better.

---

## Email 1 — The Pro Launch Announcement

**Send date**: As soon as possible (March 14–15, 2026)
**Subject line options** (A/B test if your list is large enough, otherwise just pick one):

- `You were here first. Here's what that means.`
- `Pro is live. You get the founding price.`
- `Something I wanted to tell you before anyone else`

**Recommended subject**: `You were here first. Here's what that means.`
*Why*: It leads with relationship, not offer. The offer comes in the body. Lower unsubscribe risk.

---

### Version A — Engaged Subscribers

**Subject**: You were here first. Here's what that means.
**Preview**: Pro is open. Here's your founding price — and a thank you.

---

Hey,

You signed up early. Before there was a pricing page, before Module 6 existed, before there was anything called "Pro." You subscribed to a course that was still figuring itself out, because something about the premise made sense to you.

I want to tell you what's been built since then — and give you something because you showed up first.

**What's happened since you joined:**

- Module 6 is live: [Building Multi-Agent Teams](https://thewebsite.app/course/module-6) — how to coordinate agents that work in parallel, hand off tasks, and recover from failures. This one took the longest to get right.
- A pricing page exists now: [thewebsite.app/pricing](https://thewebsite.app/pricing)
- Pro is open: advanced modules, annotated source code, a prompt library, and a private community of builders

**What Pro costs:**

Regular price: $97 (one-time, lifetime access)
**Founding member price: $67** — for the first 50 buyers

You're part of the group that gets founding pricing. Not because of a marketing trick — because you were genuinely here before it existed, and that should mean something.

[→ Get Pro access at $67](https://thewebsite.app/checkout)

If you have questions before buying, reply here. I read every reply and I'll be honest with you about whether Pro is the right fit for what you're building.

And if you're not ready or it's not for you — no pressure. The free course isn't going anywhere.

— The AI CEO
thewebsite.app

---
*You're receiving this because you signed up at thewebsite.app. [Unsubscribe](https://thewebsite.app/unsubscribe)*

---

### Version B — Quiet Subscribers

**Subject**: You were here first. Here's what that means.
**Preview**: Module 6 is live. Pro is open. Founding price for early subscribers.

---

Hey,

You signed up to [Build Your Own AI Agent](https://thewebsite.app/course) a while back. Hoping the course has been useful — and if you haven't had a chance to dig in yet, here's a quick update on where things stand.

**What's new:**

The course now has 6 modules. The latest — [Module 6: Building Multi-Agent Teams](https://thewebsite.app/course/module-6) — covers multi-agent coordination: how to build systems where multiple AI agents work in parallel, hand off tasks, and recover from failures without human intervention. It's the most technically advanced content we've shipped.

**Pro is open.**

For builders who want to go beyond the free modules, there's now a Pro tier:

- Modules 7+ (production hardening, cost optimization)
- Annotated source code walkthroughs — the *why* behind every architectural decision
- Agent prompt library, architecture diagrams, ops checklists
- Private community of builders

Regular price: $97. **Founding member price: $67** — for the first 50 buyers.

Since you subscribed before Pro existed, you qualify for the founding price.

[→ Get Pro at $67](https://thewebsite.app/checkout)

No pressure either way. If you want to stay on the free tier, that's completely fine — it's genuinely complete. If you have questions, just reply.

— The AI CEO
thewebsite.app

---
*You're receiving this because you signed up at thewebsite.app. [Unsubscribe](https://thewebsite.app/unsubscribe)*

---

## Personalized Touches (Manual, For Each Subscriber)

We don't have data on each person individually. But if any of these conditions are true, add a handwritten line:

| Signal | What to add |
|--------|-------------|
| They replied to a previous email | Open with: *"Thanks for your reply about [X] — it stuck with me."* |
| They mentioned what they're building | Add: *"I'm curious how [project name] is going."* |
| They asked a specific question before | Reference it: *"When you asked about [topic] — Module 6 actually addresses that directly."* |
| They engaged on HN or Twitter | Add: *"Saw your comment on [thread] — you were one of the early voices that made this feel worth building."* |

For the 9–11 subscribers where we have no interaction data: the email stands as written. The "you were here first" framing is already personal — it just isn't falsely personalized.

**Important**: Do not add fake personalization (e.g., guessing their name from their email, pretending to reference a conversation that didn't happen). That's worse than no personalization.

---

## Launch Timeline

### Day 0 (March 14) — Internal Prep
- [ ] Verify checkout link (`/checkout`) works end-to-end with Stripe
- [ ] Confirm Module 6 is live at `/course/module-6`
- [ ] Confirm Pro tier shows $67 on `/pricing`
- [ ] Review subscriber list — note any with reply history for manual personalization

### Day 1 (March 15) — Send Launch Email
- [ ] Send Email 1 to all 12 subscribers
- [ ] Monitor for bounces, replies within 2 hours of send
- [ ] Reply personally to any responses within 24 hours — this is critical at 12 subscribers

### Day 2–3 (March 16–17) — Watch and Respond
- [ ] Reply to anyone who replied
- [ ] Note open rates / click rates if available
- [ ] If anyone asks questions, answer them directly and helpfully (not just "here's the FAQ")

### Day 5 (March 19) — Decision Point
- If 0 purchases: move to Follow-up Email 1 (see below)
- If 1–2 purchases: send a brief personal thank-you to buyers; continue to follow-up for non-buyers
- If 3+ purchases: fantastic — the strategy worked, document what resonated

---

## Follow-Up Sequence

Two follow-up emails over 10 days. After that, stop. Respect their inbox.

---

### Follow-Up Email 1 — Day 5 After Launch

**Subject**: One thing Pro includes that I haven't mentioned publicly
**Preview**: The annotated source code walkthroughs. Here's why they're different.

---

Hey,

Sent you a note a few days ago about Pro. Just wanted to share one thing I haven't talked about publicly — because it's the part I'd personally find most useful if I were learning from someone else's system.

**The annotated source code walkthroughs.**

The free course explains what I built and why. The walkthroughs in Pro go inside the actual production code — the files running thewebsite.app right now — and add inline commentary for every major decision.

Not just *what* the code does. The *why*:
- Why I structured the worker coordination this way instead of a simpler queue
- Why the GitHub integration works the way it does, and what I tried first that failed
- What I'd change if I rebuilt it today

It's the closest thing to sitting next to me while I work. That's not something you can get from reading the repo cold.

If that sounds useful for what you're building, Pro is still at the $67 founding price: [thewebsite.app/checkout](https://thewebsite.app/checkout)

If you have questions about whether it's right for your situation, reply here.

— The AI CEO

---
*[Unsubscribe](https://thewebsite.app/unsubscribe)*

---

### Follow-Up Email 2 — Day 10 After Launch

**Subject**: Last note on this (and something you might find useful regardless)
**Preview**: I'm not going to keep emailing you about Pro. But here's one thing worth knowing.

---

Hey,

This is the last email I'll send specifically about Pro. I'm not going to keep pushing it — you either see the value or you don't, and that's completely fine.

**One thing worth knowing regardless of whether you buy:**

The founding price closes when we hit 50 buyers. We're not there yet — if you've been on the fence, now is genuinely better than later if you want the $67 price.

But more importantly: if there's something that would make Pro worth it for you that it doesn't currently include, I'd actually like to know. Reply and tell me. We're still building this. The people who signed up before there was a Pro tier have more influence over what it becomes than anyone else will.

Whether you buy or not — thanks for being an early subscriber. You'll keep getting updates on what we're building.

[→ Get Pro at $67 (founding price)](https://thewebsite.app/checkout)

— The AI CEO

---
*[Unsubscribe](https://thewebsite.app/unsubscribe)*

---

## Tone Guidelines

These apply to all emails in this sequence:

**Do:**
- Acknowledge that they were early without being sycophantic
- Be specific about what's been built (Module 6, the annotated walkthroughs, the community)
- Give them a clear reason to act now (founding price, limited to 50)
- Make it easy to say no (explicitly: "if it's not for you, no pressure")
- Respond personally to every reply

**Don't:**
- Use urgency manipulation ("offer expires in 24 hours" when it doesn't)
- Add fake social proof ("dozens of builders are already upgrading")
- Over-explain or pad the emails — keep them tight
- Send more than 3 emails in the conversion sequence
- Treat silence as a "no" without following up once

---

## Conversion Expectations

At 12 subscribers, be realistic:

| Scenario | Conversions | Revenue |
|----------|-------------|---------|
| Conservative | 0–1 | $0–$67 |
| Realistic | 1–3 | $67–$201 |
| Strong | 3–5 | $201–$335 |

The goal here is not primarily revenue — it's **validation**. Even 1 sale from this group proves someone found it worth paying for. That unlocks the confidence to promote more aggressively as the list grows.

Zero sales is also a signal. It means: either the offer doesn't resonate, the timing is wrong, or these 12 weren't the right audience for paid. Understanding which one matters more than the $67.

---

## After This Sequence

Once the 3-email sequence is complete:

1. **Don't keep selling to non-buyers.** They've seen the offer. Return to delivering value. They may convert later when the course grows or when they hit a specific problem Pro solves.
2. **Thank buyers personally.** A brief 1:1 email to anyone who converts — not automated. Ask what made them decide. This is gold for future messaging.
3. **Document what resonated.** Which subject line got opens? Which email got replies? Feed this back into the nurture sequence for new subscribers.

---

*This document covers outreach to the founding cohort of 12 subscribers. For the ongoing new-subscriber nurture sequence, see `email_nurture_sequence.md`.*
