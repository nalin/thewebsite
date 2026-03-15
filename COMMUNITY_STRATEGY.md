# Community Engagement & Support Strategy

**Author**: Growth Strategist
**Created**: March 14, 2026
**Product**: thewebsite.app — AI Agent Builder Course
**Status**: Ready to execute from launch day (March 23, 2026)

---

## Overview

This document covers the full playbook for engaging users, building community, handling support, and turning students into advocates after launch. Community is the primary growth flywheel for an education business: students who succeed become testimonials, referrers, and content creators.

**Core principle**: Be fast, be genuine, be useful. Every interaction is a chance to build trust or lose it.

---

## Part 1: Community Channels

### Should We Create a Discord Server?

**Recommendation: Yes, but launch it at 50 paying students — not before.**

Launching Discord on day one with an empty server signals low traction. A quiet Discord is worse than no Discord. The sequence:

1. **Phase 1 (0–50 students)**: Use email + Twitter as the primary async support channels. Respond publicly on Twitter so responses are visible and build credibility.
2. **Phase 2 (50+ students)**: Open Discord with a founding-members-only invite. Frame it as exclusive access, not a public support forum.
3. **Phase 3 (200+ students)**: Open Discord fully, add public invite link to course pages.

**Discord server structure (when launched)**:

| Channel | Purpose |
|---------|---------|
| `#announcements` | Course updates, new modules, office hours (read-only) |
| `#introductions` | New student intros — name, background, what they're building |
| `#general` | Open discussion |
| `#course-questions` | Module-specific help (tag module number) |
| `#project-showcase` | Students sharing what they built |
| `#feedback` | Bugs, suggestions, course improvements |
| `#wins` | Celebrate completions, first agents shipped, revenue hits |

**Discord setup checklist** (when ready to launch):
- [ ] Create server, set up channel structure above
- [ ] Configure roles: `Founding Member`, `Module 1 Complete`, `Agent Builder`, `Pro Member`
- [ ] Pin welcome message with course links and community rules
- [ ] Set up MEE6 or similar bot for role assignment on module completion
- [ ] Add invite link to course confirmation email and `/course` page

---

### Twitter Engagement Strategy

Twitter is the highest-leverage channel for developer audiences. The goal is visibility AND reputation — being known as the person who gives real answers, not just promotional content.

**Daily engagement protocol**:

1. **Morning (9–10am PT)**: Post one piece of original content (see content types below). Then spend 20 minutes replying to replies from previous posts.
2. **Midday (12–1pm PT)**: Search for 3–5 tweets about AI agents, Claude, multi-agent systems. Reply with a genuinely useful insight — no promotional links unless directly relevant.
3. **Evening (5–7pm PT)**: Check @mentions. Reply to every mention within 24 hours.

**Content types that work for developer audiences**:
- Behind-the-scenes: "Here's what our AI CEO decided today and why I disagreed"
- Lessons learned: "We broke X. Here's the root cause and fix."
- Architecture diagrams: simple visuals of how systems connect
- Student wins: "A student just built [X] after completing Module 2. Here's how."
- Honest metrics: subscriber count, revenue, open rates — raw numbers build trust

**Engagement rules**:
- Reply to every reply on original posts for the first 2 hours (algorithmic boost)
- Never ignore critical or skeptical replies — engage thoughtfully, it's more visible than the praise
- Retweet student projects with a comment ("This is what Module 3 unlocks — @student built X in 48 hours")
- Follow back anyone who follows AND engages (not mass-followers)

**Twitter hashtag strategy**:
Primary: `#AIAgents`, `#BuildInPublic`, `#IndieHacker`
Secondary: `#ClaudeAI`, `#LLMOps`, `#DevTools`

---

### Reddit Community Building

Reddit rewards value-first participation. The rules: never post a link without context, never post only in your own threads, and engage with other content more than you self-promote.

**Target subreddits**:

| Subreddit | Audience fit | Posting frequency |
|-----------|-------------|------------------|
| r/ClaudeAI | Direct — Claude users | 1x/week max |
| r/LocalLLaMA | Technical builders | 1x/week max |
| r/artificial | Broader AI interest | 1x/2 weeks |
| r/SideProject | Builder/indie audience | On milestones only |
| r/learnmachinelearning | Students | On new content drops |

**Reddit engagement playbook**:

1. **Participate before posting**: Comment on 3–5 threads per week in target subreddits before making a new post. Karma and credibility matter.
2. **Post structure**: Lead with the insight or story, not the product. Course link goes in comments or at the end, never the top.
3. **Response protocol**: Reply to every comment within 12 hours. Upvote good comments. Acknowledge criticism directly ("That's a fair point — we're working on it").
4. **When to post**: Tuesdays–Thursdays, 8–11am PT. Avoid Friday afternoons and weekends for technical subreddits.
5. **What to post**: Architecture breakdowns, real metrics, honest post-mortems, student projects (with permission).

**Never do**:
- Submit the same post to multiple subreddits simultaneously
- Delete posts with negative comments (it looks worse)
- Vote brigade (ask others to upvote your posts)
- Use an account with zero comment history

---

### Email Support Workflow

Email is the primary support channel pre-Discord. Keep it fast and personal.

**Inbox setup**:
- Support address: `support@thewebsite.app` (or route from Resend)
- Use tags/labels: `course-question`, `billing`, `technical`, `feedback`, `press`
- Target: all emails tagged within 1 hour, responded to within 24 hours

**Email triage flow**:

```
Incoming email
  ├─ Billing/payment issue → respond within 4 hours, offer full refund if requested (no friction)
  ├─ Technical issue (site/course broken) → escalate to Engineer within 1 hour
  ├─ Course question → respond with answer + link to relevant module section
  ├─ Feedback/suggestion → thank them, log it in FEEDBACK_LOG (see Part 3)
  └─ Press/partnership → respond within 48 hours with media kit or deck
```

**Response time targets**:

| Issue type | Target response time |
|------------|---------------------|
| Payment/billing | 4 hours |
| Technical bug | 1 hour (acknowledgment), 24 hours (resolution) |
| Course question | 24 hours |
| General feedback | 48 hours |
| Press/partnership | 48 hours |

---

## Part 2: Engagement Playbook

### How to Respond to Course Questions

**Principles**:
- Always answer the question directly first, then add context
- If the answer is in a specific module, link to it AND summarize it (don't just say "see Module 3")
- If a question comes up twice, it becomes an FAQ entry
- If a question reveals a gap in the course content, flag it as a content improvement

**Response templates**:

**Module question (email)**:
```
Hi [Name],

Great question — this comes up a lot in Module [X].

Short answer: [direct answer in 1-2 sentences]

The full breakdown is in [Module X, Section Y — link]. The key thing to understand is [explain the concept simply].

If that doesn't answer it, reply here and I'll dig into your specific case.

[Signature]
```

**"I'm stuck" question**:
```
Hi [Name],

Let's debug this together.

Can you share:
1. Which module/section you're on
2. What you tried
3. The exact error or behavior you're seeing

Usually when this happens it's one of three things: [list 2-3 common causes]. But I want to look at your specific situation before guessing.

[Signature]
```

---

### How to Handle Feedback and Complaints

**Rule 1**: Never get defensive. Complaints are free product research.

**Rule 2**: Respond faster to complaints than to praise. Slow responses to problems feel dismissive.

**Rule 3**: Refund without friction. A $67–$97 refund that leaves a good impression is worth 10x a bad review.

**Complaint response protocol**:

1. **Acknowledge first**: "I hear you, and I'm sorry this wasn't what you expected."
2. **Ask one clarifying question if needed** — don't interrogate
3. **Offer a resolution**: refund, module re-take, direct 1:1 call (for serious complaints)
4. **Follow up**: If you fixed something they complained about, tell them

**Feedback log**: Maintain a running `FEEDBACK_LOG.md` with:
- Date
- Source (email, Twitter, Reddit)
- Issue category
- Resolution
- Status (open/closed)

Review it weekly. Patterns in the first 30 days post-launch define your roadmap.

---

### How to Identify and Amplify Success Stories

A student success story is worth 100 ad dollars. The goal is to surface them early and often.

**Finding success stories**:
- Watch `#wins` channel (Discord, once live)
- Monitor Twitter @mentions and course hashtag
- Ask directly in onboarding email sequence: "What did you build? Reply to this email."
- Survey at course completion: "What changed for you after finishing this?"

**What counts as a success story**:
- Built and deployed a working AI agent
- Completed a specific module
- Used the course to get a job, client, or project
- Hit a revenue milestone with a tool built in the course
- Shipped something they'd been stuck on for months

**Amplification workflow**:

1. DM or email the student: "Would you be OK with me sharing this story? I'd love to give you a shoutout."
2. Write a tweet or short post about their project — tag them, explain what they built and how
3. Ask if they'd write 2–3 sentences for the testimonials section (pre-draft it for them, they just approve)
4. Add to `/course` page or testimonials section on homepage
5. Feature in weekly email: "Student spotlight: [name] built [X]"

---

### How to Encourage User-Generated Content

**Friction is the enemy of UGC.** Make it effortless.

**Tactics**:

1. **"Share your build" prompt**: At the end of each module, add a prompt: "Built something? Share it on Twitter with #[CourseHashtag] — I retweet everything."
2. **Completion badge**: At module completion, offer a downloadable "I built an AI agent" badge for Twitter/LinkedIn profile. Simple PNG, high perceived value.
3. **Project directory**: Add a `/students` or `/showcase` page listing student projects with permission. Being listed is a small status signal that motivates action.
4. **Discord project-showcase channel**: Post first to normalize it. Share your own WIP projects. Then celebrate every student post loudly to set the tone.
5. **Case study pipeline**: After 30 days, identify top 3 student stories and write longer case studies (with their approval). Case studies are the best long-term SEO and sales content.

---

## Part 3: Support System

### FAQ Maintenance Process

**Initial FAQ creation**: Publish a `/faq` page at launch with the 10 most likely questions (see below). Update it every Friday based on the week's support volume.

**FAQ update protocol**:
1. Every question answered via email or Discord that isn't in the FAQ gets logged
2. Friday review: any question answered 3+ times in a week gets added to FAQ
3. Flag outdated FAQ entries after course updates or pricing changes
4. Version the FAQ with "Last updated: [date]" at the top

**FAQ maintenance owner**: Growth Strategist (this role). Technical FAQ questions reviewed with Engineer before publishing.

---

### Common Questions and Answers

**Q: Is this course right for me if I'm not a developer?**
A: The course is built for people who can write code at a basic level (Python or JavaScript). If you've completed a beginner course or can follow a tutorial, you can do this. We don't teach programming from scratch — we teach how to build AI agent systems on top of existing skills.

**Q: How long does it take to complete the course?**
A: Each module takes 1–3 hours of focused work plus build time. Most students complete the full course in 2–4 weeks. There's no deadline — you keep access.

**Q: What AI model does the course use?**
A: The course primarily uses Claude (Anthropic). Most concepts apply to any frontier LLM, but the code examples and architecture are Claude-specific.

**Q: Do I need to pay for API usage separately?**
A: Yes. The course teaches you to build with Claude's API, which requires an Anthropic account. Typical API costs for completing the course are $5–15. We give you prompts and patterns to keep costs low.

**Q: Can I get a refund?**
A: Yes, full refund within 30 days, no questions asked. Email support@thewebsite.app with your order ID.

**Q: Is there a community where I can ask questions?**
A: Yes — Discord for Pro members (once launched at 50+ students), and Twitter replies/DMs for everyone. We also monitor email.

**Q: When is new content added?**
A: We're building in public, so content ships when it's ready. Pro members get all future modules included. Subscribe to email updates to get notified.

**Q: Can I use this for commercial projects?**
A: Yes. Everything you build is yours. The course content is for personal use only (don't resell or reproduce it), but your builds have no restrictions.

**Q: I found a bug or broken link in the course. What should I do?**
A: Email support@thewebsite.app or post in `#feedback` on Discord. We fix course bugs within 24 hours. Thank you — you're helping future students.

**Q: What's the difference between free and Pro?**
A: The free course covers Modules 1–5 (full architecture, real examples). Pro adds advanced modules, a private Discord, live Q&A sessions, and direct code review. See `/pricing` for full details.

---

### Escalation Path for Complex Issues

**Level 1 — Self-serve** (student resolves themselves):
- FAQ at `/faq`
- Course notes and comments
- Discord `#course-questions` search

**Level 2 — Community support** (peer or async):
- Discord `#course-questions`
- Twitter DM or @mention
- Email response within 24 hours

**Level 3 — Direct growth strategist** (this role):
- Complex course questions
- Feedback that implies a course gap
- High-effort or frustrated students who need personal attention

**Level 4 — Engineer escalation**:
- Site outages or broken features
- Payment processing failures
- Data issues (missing enrollments, wrong access)
- Trigger: escalate within 1 hour of identifying a technical issue

**Level 5 — CEO escalation** (rare):
- Legal or IP concerns
- Media/press inquiries requiring official position
- Partnership or acquisition conversations

---

## Part 4: User Success

### Onboarding Sequence for New Students

The goal: get every student to complete Module 1 within 7 days of signing up. First milestone is the retention lever.

**Day 0 — Immediately on signup**:
> Subject: "You're in. Here's where to start."
>
> Welcome to [Course Name]. Here's the fastest path to your first working AI agent:
> 1. Go to [Module 1 link] — it's 90 minutes and you'll have a working agent by the end.
> 2. Join Discord (link) — introduce yourself in #introductions.
> 3. Reply to this email with what you're hoping to build. I read every reply.
>
> See you in Module 1. — [Signature]

**Day 3 — Check-in** (if Module 1 not completed):
> Subject: "Still getting started? This helps."
>
> Checking in — have you had a chance to start Module 1 yet?
>
> If you're stuck on setup, the most common issue is [X]. Here's the fix: [link].
>
> If life got in the way, no worries — the course doesn't expire. When you're ready, Module 1 is the place to begin.

**Day 7 — Module 1 nudge** (if still not started):
> Subject: "One module. One hour. One working agent."
>
> You signed up for the course a week ago. I want to make sure you actually get value from it.
>
> Module 1 takes about 90 minutes. By the end, you'll have a real AI agent running. That's not a promise — it's what our students report.
>
> [Module 1 link]
>
> If something's in the way, reply and tell me. I'll help.

**Day 14 — Completion check** (if Module 1 done, not Module 2):
> Subject: "Module 1 done — what's next"
>
> Nice work finishing Module 1. Module 2 is where things get interesting: [brief teaser of what Module 2 covers].
>
> Most students who complete Module 2 describe it as the "aha" moment for multi-agent systems.
>
> [Module 2 link]

---

### Milestone Celebrations

Milestones are public and social — every celebration is also a trust signal for new students.

| Milestone | Action |
|-----------|--------|
| Signed up | Welcome email (immediate) |
| Module 1 complete | Automated email: "You built your first agent." + Discord badge prompt |
| Module 3 complete | Email: "You're halfway. Here's what's coming." |
| Course complete | Email: "You finished. What did you build?" + showcase invitation |
| First agent deployed | Ask for Twitter post + retweet |
| Pro upgrade | Personal email from this account within 1 hour of purchase |
| Referred a friend | Note it publicly: "Thanks to @[student] for sending a friend our way" |

**Discord role progression** (when Discord launches):
- `New Student` → on join
- `Module 1 Complete` → on self-report or bot trigger
- `Agent Builder` → on completing full course
- `Pro Member` → on Pro purchase (auto-assign)
- `Founding Member` → permanent badge for first 50 Pro students

---

### Showcase Student Projects

**`/showcase` page** (build by Module 2 week post-launch):

Structure:
- Student name (or handle if anonymous)
- What they built (1-sentence description)
- Screenshot or demo link if available
- Quote from student (1-2 lines)
- Date completed

**How to populate it**:
1. At course completion, ask: "Would you like to be featured in our student showcase? Share a screenshot and 1-2 sentences about what you built."
2. Review Discord `#project-showcase` weekly — ask top projects for permission to feature
3. Monitor Twitter course hashtag — reach out to anyone who shares publicly

**Showcase submission form** (simple Typeform or native form):
- Name (or Twitter handle)
- What did you build? (text, 1–3 sentences)
- Screenshot or URL (optional)
- Quote for the page (text, 1–2 sentences)
- Permission checkbox

---

### Testimonials Pipeline

Testimonials are systematically collected, not hoped for.

**Collection touchpoints**:

1. **Post-Module 1 email** (Day 7–14 after signup): "What was most useful about Module 1? One sentence is great." — low friction, high volume.
2. **Course completion survey**: 5-question form. Last question: "Can we use your response as a testimonial on our website?" with opt-in checkbox.
3. **30-day check-in email** (30 days after signup): "What have you built or changed since starting the course? We'd love to share your story."
4. **Pro upgrade thank-you email**: "You just upgraded to Pro. What made you decide? 1–2 sentences would mean a lot."

**Testimonial quality tiers**:

| Tier | What it includes | Where it goes |
|------|-----------------|---------------|
| Tier 1 (best) | Specific result, before/after, real name + photo | Homepage hero section |
| Tier 2 | Specific module or concept they found valuable | `/course` page |
| Tier 3 | General positive sentiment | FAQ or pricing page |

**Testimonial management**:
- Maintain a `TESTIMONIALS.md` doc with all approved quotes, source, date, and tier
- Review monthly for freshness — rotate in new testimonials, retire generic ones
- For Tier 1 testimonials, draft the copy for the student and ask them to approve/edit. Lower friction = higher conversion.

---

## Part 5: Key Metrics to Track

| Metric | Weekly target | Monthly target |
|--------|--------------|----------------|
| Support response time (avg) | < 24 hours | < 18 hours |
| Module 1 completion rate (7-day cohort) | > 40% | > 50% |
| Discord monthly active members | — | > 60% of Pro students |
| Student showcase entries | 2/week | 8/month |
| Testimonials collected | 1/week | 4/month |
| FAQ entries updated | 1/week | 4/month |
| Twitter @mention response rate | 100% | 100% |

---

## Appendix: Quick Reference

### Response time commitments (public-facing)
- Billing issues: 4 hours
- Technical bugs: 1 hour (acknowledgment)
- Course questions: 24 hours
- General email: 48 hours

### Channels at launch (March 23)
- Email: support@thewebsite.app
- Twitter: respond to all @mentions
- Reddit: monitor r/ClaudeAI, r/LocalLLaMA for mentions

### Channels at 50 students
- Add: Discord (founding members)

### Channels at 200 students
- Add: Discord (public)
- Consider: weekly live Q&A (30 min, async-friendly via recording)

---

*This document is a living playbook. Update it as patterns emerge from real student interactions. First major review: April 14, 2026 (3 weeks post-launch).*
