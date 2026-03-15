# Post-Launch Playbook: thewebsite.app

**Launch Date**: March 23, 2026
**Author**: Growth Strategist
**Purpose**: Monitoring, optimization, and growth plan for the 4 weeks after public launch

---

## Part 1: Monitoring Dashboard — First 48 Hours

### What to Track and Where

| Metric | Tool | Check Frequency | Where to Find |
|--------|------|-----------------|---------------|
| New email signups | Resend (Contacts) | Every hour | resend.com → Contacts → filter by date |
| Course page views | Vercel Analytics | Every hour | vercel.com → Project → Analytics |
| Landing page conversion rate | Vercel Analytics | Every 2 hours | (signups / unique visitors) × 100 |
| Email open rate | Resend | After each send | resend.com → Emails → Campaign |
| Email click rate | Resend | After each send | resend.com → Emails → Campaign |
| Stripe revenue | Stripe Dashboard | Every 2 hours | dashboard.stripe.com → Home |
| HN points + comments | HN post URL | Every 30 min (first 4 hrs) | Direct URL to submission |
| Reddit upvotes + comments | Reddit posts | Every hour | Direct post links |
| Twitter impressions | Twitter Analytics | Every 2 hours | analytics.twitter.com |
| Site errors / downtime | Vercel Logs | Every 2 hours | vercel.com → Project → Logs |

---

### Hourly Tracking Sheet (Hours 1–12 Post-Launch)

Track these in a simple log or spreadsheet.

| Hour | Signups (cumulative) | Course views | HN points | Top traffic source |
|------|---------------------|--------------|-----------|-------------------|
| H+1  | — | — | — | — |
| H+2  | — | — | — | — |
| H+3  | — | — | — | — |
| H+4  | — | — | — | — |
| H+6  | — | — | — | — |
| H+8  | — | — | — | — |
| H+12 | — | — | — | — |
| H+24 | — | — | — | — |
| H+36 | — | — | — | — |
| H+48 | — | — | — | — |

---

### Benchmark: What Good Looks Like

**Launch Day (Hour 0–24)**

| Metric | Minimum (keep going) | Good (on track) | Excellent (accelerate) |
|--------|---------------------|-----------------|----------------------|
| New signups | 10 | 25 | 50+ |
| Course page views | 100 | 300 | 750+ |
| Landing page conversion | 3% | 8% | 15%+ |
| HN points | 10 | 30 | 75+ |
| HN comments | 3 | 10 | 25+ |
| Reddit upvotes (r/ClaudeAI) | 20 | 60 | 150+ |
| Email open rate (launch email) | 30% | 50% | 65%+ |
| Twitter thread impressions | 500 | 2,500 | 8,000+ |

**Hour 24–48 (Day 2)**

| Metric | Minimum | Good | Excellent |
|--------|---------|------|-----------|
| Additional signups | 5 | 15 | 30+ |
| HN still on front page | No | Yes (< 100 rank) | Yes (< 50 rank) |
| Reddit long-tail comments | 1–2 | 5+ | 10+ |
| Resend opens (2nd day) | — | — | — |

---

### When to Pivot or Adjust Messaging

**Trigger: Under 5 signups at H+4 (first 4 hours)**
- HN/Reddit are not the traffic source — shift immediately to Twitter
- Post a direct "we launched today" tweet with a screenshot of the course
- DM 5–10 known contacts personally and ask them to check it out

**Trigger: High traffic, low signup conversion (< 3%)**
- The landing page copy or CTA is failing, not the distribution
- Check: is the signup form visible above the fold?
- Test: rewrite the headline to be more specific ("Free 9-module course on building real AI agents — by an AI that does it")
- Do not change the distribution channels — fix the page

**Trigger: HN post not gaining traction (< 5 points at H+2)**
- Do not ask anyone to upvote (HN ban risk)
- Post the first comment immediately if not done
- Reply to any skeptical comments quickly and thoroughly — the comment engagement matters more than upvotes for HN algorithm
- Shift energy to Reddit and Twitter rather than refreshing HN

**Trigger: Strong engagement on one channel only**
- Double down on what's working — do not spread energy evenly
- If Twitter is the source, post a follow-up thread within 6 hours
- If Reddit is the source, engage every comment and prep the next subreddit post for tomorrow

---

## Part 2: Optimization Playbook

### If HN Post Underperforms (< 10 points by H+3)

**Do not**: Re-submit. Re-submit bans are permanent.

**Do this instead**:
1. Keep engaging any comments you did get — comment depth signals quality to HN
2. Shift energy to next subreddit in the sequence (r/SideProject if not yet posted)
3. Queue a new Show HN post for **2 weeks out** with a different angle:
   - Option A: "Show HN: How I built a multi-agent architecture that runs a real business — full breakdown"
   - Option B: "Show HN: Free open-source AI agent course — taught by an agent running a live system"
4. Write an HN comment on an existing popular AI agents thread — add genuine value and mention thewebsite.app naturally

**Long-tail play**: HN has a "Who's Hiring" and "Ask HN" format. A well-crafted "Ask HN: What do you wish someone had taught you about running AI agents in production?" can outperform a Show HN with no engagement.

---

### If Conversion Rate Is Low (< 3% of visitors sign up)

**Diagnose first** — check Vercel Analytics for:
- Which pages have the highest exit rate?
- How long are people spending on the landing page vs. course pages?
- Are mobile visitors converting at lower rate than desktop?

**If the problem is the headline/CTA**:
- Test a more specific headline: "9 modules on building AI agents — taught by an AI that runs a live production system"
- Make the CTA more tangible: "Get the free course + starter kit" > "Sign up"
- Add social proof near the form: "Join 100+ developers building with AI agents"

**If the problem is the page layout**:
- Move the email capture form above the fold
- Add a preview of Module 1 inline (first 3 paragraphs visible without signing up)
- Add a "No credit card, no paywall — free forever" reassurance line near the form

**If the problem is the audience match**:
- The traffic source may be wrong — check Vercel referral data
- HN traffic converts better than Twitter traffic for developer tools (HN readers are in "learn" mode)
- Generic AI Twitter audiences convert poorly — target #buildinpublic and agent-specific conversations instead

---

### If Email Open Rates Are Poor (< 30% open rate on launch email)

**30–50% is normal for developer audiences with a fresh list. Under 30% means:**

1. **Subject line is the problem.** Test alternatives:
   - Current: "We launched. The free course is live."
   - Alt A: "The 9-module AI agent course is now free — no paywall"
   - Alt B: "You were first. The public launch is today."
   - Rule: Specificity beats cleverness. "9 modules" beats "it's here."

2. **Send time is wrong.** Developer audiences open most at:
   - Tuesday–Thursday, 9–11am ET
   - If launch is a Monday, resend to non-openers on Wednesday

3. **Deliverability issue.** Check:
   - Are emails going to spam? Test with your own address on a fresh inbox
   - Verify Resend domain records are correctly configured (SPF, DKIM)
   - If open rate < 20%, pause and audit deliverability before sending more

**For the welcome email sequence (not just launch email):**
- Email 1 (immediate): Should hit > 50% open. If not, subject line problem.
- Email 2 (day 3): Should hit > 40% open. If not, people are not engaged with the content — shorten the email and sharpen the value.
- Email 3 (day 7, Pro offer): Should hit > 35% open. Lower than this = the sequence is losing them. Add a "did you start Module 1 yet?" re-engagement before the Pro pitch.

---

### How to Respond to Feedback

**Positive feedback** (someone says the course is great):
- Reply personally and immediately
- Ask: "What was most valuable? What would you want covered next?"
- With permission, quote them in a future Twitter post or testimonial section
- Follow them back and engage their content — early fans become amplifiers

**Constructive criticism** (something is unclear, incomplete, or wrong):
- Acknowledge publicly if the critique is public (HN comment, Reddit post, tweet)
- Fix it within 24 hours if it's a content error
- Reply with what you fixed: "Good catch — I've updated Module 3 to include [X]"
- Do not be defensive; "we updated this because a reader pointed it out" is a trust signal

**Hostile feedback** (AI can't build real businesses, this is just marketing, etc.):
- Engage directly and calmly — hostile comments on HN and Reddit that get thoughtful replies often flip to become support
- Stick to specifics: "Here are the actual metrics from running this system..." > defensiveness
- Do not delete or ignore them — silence looks like you can't answer

**Feature requests** (people asking for X module, Y feature, Z tool):
- Log every unique request in a `FEATURE_REQUESTS.md`
- If 3+ people ask for the same thing, make it the next module or blog post
- Respond: "Adding this to the roadmap — we're tracking what people most want to cover next"

---

### When to Post Follow-Ups

**24 hours after launch** (if HN had > 20 points):
- Tweet: "24-hour update: [X] new signups, [HN points] on HN, [Reddit upvotes] on r/ClaudeAI. Top question so far: [real question]. My answer: [1-paragraph answer]"
- This performs well because it shows momentum and answers real reader questions

**48 hours after launch** (if signups are strong):
- Post to r/SideProject: "Launch recap — what actually happened when an AI launched its own course"
- Include real numbers: signups, HN performance, conversion rate, biggest surprise
- This earns high engagement because it's transparent and rare

**1 week after launch** (regardless of performance):
- Write a "week 1 retrospective" blog post + tweet thread
- Include: what worked, what didn't, what you'd do differently, subscriber count update
- This is evergreen content that keeps attracting traffic for months

---

## Part 3: Growth Plan — Weeks 1–4 Post-Launch

### Week 1 (March 24–30): Capture Momentum

**Tone**: Move fast, respond to everything, maximize initial spike.

**Daily content schedule:**

| Day | Action | Channel |
|-----|--------|---------|
| Mon Mar 24 | 24-hour launch recap thread | Twitter |
| Mon Mar 24 | Engage all remaining HN comments | HN |
| Tue Mar 25 | Post: r/LangChain multi-agent breakdown | Reddit |
| Tue Mar 25 | Email: "How Module 1 went (first 24hrs)" | Email |
| Wed Mar 26 | Tweet: "Most surprising question we got at launch" | Twitter |
| Wed Mar 26 | Engage r/LangChain comments | Reddit |
| Thu Mar 27 | Post: r/MachineLearning or r/artificial | Reddit |
| Thu Mar 27 | Tweet: build-in-public metrics update | Twitter |
| Fri Mar 28 | Email: "You've had 5 days. Here's what's next." | Email |
| Fri Mar 28 | Tweet: weekend thread — "5 things I got wrong in week 1" | Twitter |
| Sat/Sun | Monitor + respond; no new content unless momentum high | All |

**Community engagement:**
- Reply to every comment on every channel within 2 hours
- Find 3 new AI agent/Claude conversations on Twitter daily and add genuine value
- Do NOT pitch — just contribute. Mentions > pitches.

**Metric goal by end of Week 1**: 75+ total subscribers (was at 50+ on launch day target)

---

### Week 2 (March 31 – April 6): Deepen Value

**Tone**: Shift from launch buzz to consistent publishing. Prove this is a real resource.

**Primary goal**: Publish new content that brings second wave of traffic.

**Content priorities:**

1. **New blog post**: "What I learned running AI agents for 30 days" (publish April 1–2)
   - Highly shareable retrospective, perfect for HN Show HN or r/programming
   - Include real metrics: tasks completed, PRs merged, cost per outcome
   - End CTA: email signup + course

2. **Twitter thread**: Behind-the-scenes of running module development with AI workers
   - Show actual prompts, actual outputs, what went wrong
   - This type of "show your work" content earns strong sharing from #buildinpublic crowd

3. **Module 10 tease** (if not yet launched):
   - Tweet: "Working on Module 10: [topic]. It's the one I most wanted someone to teach me."
   - Email to list: "Module 10 drops next week. Here's what's in it."

**Community engagement:**
- Identify 5–10 developers on Twitter actively building AI agents. Follow, engage their content.
- Do not cold DM yet — build familiarity through genuine replies first.
- Respond to any emails or DMs from early subscribers personally. These become your best advocates.

**Metric goal by end of Week 2**: 100+ total subscribers. If not there: run "100 subscribers" milestone push (tweet: "9 subs away from 100. If you've been meaning to share this, now's the time.")

---

### Week 3 (April 7–13): Convert and Expand

**Tone**: Start monetization conversations. Begin influencer outreach. Expand content distribution.

**Primary goal**: First revenue + influencer conversations started.

**Pro tier launch (if 100+ subscribers)**:
- Send "founding price" email to full list: $67 for Pro access, first 50 buyers
- Subject: "Founding member pricing — closes April 10"
- Body: what's included, why it's $67, how many spots remain
- Tweet: "Founders pricing is live. 50 spots at $67. Here's what's included."

**Influencer outreach (start this week)**:

Criteria for who to contact:
- Has posted about AI agents, Claude, or autonomous systems in last 30 days
- 5k–100k Twitter followers (bigger than this, lower response rate)
- Makes content about building, not just sharing news

**Outreach approach** (DM, no cold email yet):
```
Hey [name] — I've been following your work on [specific thing they built/wrote].

I'm an AI agent actually running a real company (thewebsite.app) — writing the content, spawning engineers, doing the growth work. Built a free course on building the same kind of system.

Not pitching anything. Just thought you might find the architecture interesting — or it might make for unusual content. Happy to share the full technical breakdown if useful.
```

**Do NOT**: pitch a collab or ask for a shoutout in the first message. Build a genuine connection first.

**Target 5 outreaches this week. Goal: 1 response.**

**Guest post outreach (start this week)**:
- Pitch to Towards Data Science and The Pragmatic Engineer
- Angle: "AI Agents in Production: What building one actually looks like"
- Include 3 specific, unusual findings (not generic AI advice)
- Link to published course as proof of depth

**Metric goal by end of Week 3**: First revenue (even $67). 120+ subscribers.

---

### Week 4 (April 14–20): System and Scale

**Tone**: Systematize what's working. Stop what isn't. Build for month 2.

**Primary goal**: Establish repeatable content + growth loops.

**Paid ads evaluation (assess this week)**:

Before spending on ads, confirm:
- [ ] Organic conversion rate is > 5% (if not, fix the page before paying for traffic)
- [ ] Email open rate is > 40% (if not, fix the sequence before paying to grow the list)
- [ ] At least 3 subscribers have said "this is exactly what I needed" (social proof baseline)

**If all three are true**, evaluate Twitter ads:
- Target: followers of @AnthropicAI, @alexalbert__, @swyx, @karpathy
- Content type: promoted tweet of highest-performing organic tweet
- Daily budget: $20/day max to start
- Goal: cost per signup < $5 (if higher, pause and optimize)

**If not all three**, do NOT run ads. Fix the fundamentals first.

**Recurring content system to establish:**
- 1 tweet daily (build-in-public update, lesson, or insight)
- 1 email per week (metrics update + what you're working on)
- 1 blog post every 2 weeks
- 1 Reddit value-add post per week (different subreddit each week)

**Sponsored content outreach (resume/continue):**
- Follow up with any sponsor prospects from pre-launch outreach
- If none responded: revise pitch with launch data ("launched to X signups, HN front page, Y email subs")
- Target: 1 sponsor deal at $200–$500/month closed by April 20

**Metric goal by end of Week 4**: 150+ subscribers, $500+ revenue, 1 influencer conversation active.

---

## Part 4: Quick Reference — Decision Trees

### Scenario: It's 6pm on launch day. What do I look at first?

```
1. Check signup count (Resend)
   ├─ > 25 signups → great, post 24-hr preview tweet tonight
   ├─ 10–25 signups → on track, focus on community engagement tomorrow
   └─ < 10 signups → check traffic sources (Vercel), identify which channel is sending visitors

2. Check top traffic source (Vercel Analytics)
   ├─ HN → engage all comments now, post follow-up HN comment
   ├─ Reddit → reply to every comment, queue next subreddit post
   ├─ Twitter → engage thread replies, prepare morning follow-up tweet
   └─ Direct → something else is working (email forward, private community) — investigate

3. Check conversion rate (signups / unique visitors)
   ├─ > 8% → don't touch the page
   ├─ 3–8% → good enough, optimize after 48 hrs
   └─ < 3% → investigate page issues (mobile? above fold? form visible?)
```

### Scenario: Week 1 ends and I'm at 60 subscribers instead of 75.

```
Gap: 15 subscribers short of pace

Fastest paths to close the gap:
1. Personal outreach → email 5 people you know personally and ask them to share
2. Milestone tweet → "87 away from 100. If you've been thinking about sharing this, now."
3. Re-engage existing subscribers → email asking them to forward to one specific person
4. Post to a subreddit not yet hit (r/SideProject or r/MachineLearning)
5. Write "Week 1 transparency post" with real numbers → submit as Show HN

Do NOT: run a giveaway as first response. Try organic tactics first.
```

### Scenario: Someone with 50k+ Twitter followers engages with the launch post.

```
1. Reply immediately and thoughtfully (within 15 minutes if possible)
2. Do NOT ask them to retweet or share
3. Give them something extra: a genuine insight, a thread reply, or a unique detail they didn't ask for
4. Follow them, engage their next 3 tweets with substantive replies
5. After 48 hours, send a short DM: "Appreciate you engaging with the launch post.
   Happy to share the full technical architecture if you're building in this space."
6. If they reply: offer a 20-minute async Q&A or share the annotated source
7. If they don't: that's fine. Move on. Don't follow up more than once.
```

---

## Part 5: Monthly OKRs and Adjustment Points

### End of March (March 31) — 8 Days Post-Launch

**Key Results (Minimum)**:
- 75 email subscribers total
- 5,000 total course page views
- 1 piece of content with > 50 HN points or > 100 Reddit upvotes
- Launch email open rate > 40%

**Key Results (Target)**:
- 100 email subscribers
- 10,000 course page views
- HN front page achieved
- First revenue ($67+)

**Pivot trigger**: If < 50 subscribers by March 31, the current distribution channels are not working. Do a full channel audit: which source sent the most traffic? Which converted best? Double down on that one exclusively for the next 2 weeks.

---

### End of Week 2 (April 6) — 14 Days Post-Launch

**Key Results (Minimum)**:
- 100 subscribers
- 1 new long-form piece of content published (blog or module)
- Email open rate > 35% (adjusted for list growth)
- 1 influencer outreach sent

**Pivot trigger**: If still < 75 subscribers after 2 weeks, move into daily publishing mode (1 tweet thread + 1 community post per day) for 2 weeks straight.

---

### End of Week 3 (April 13) — 21 Days Post-Launch

**Key Results (Minimum)**:
- 120 subscribers
- Pro tier email sent to full list
- 1 influencer response received
- Guest post pitch sent to 2 publications

**Pivot trigger**: If Pro conversion rate < 1% (less than 1 sale per 100 subscribers after launch email), the offer is wrong — not the audience size. Reframe the Pro offering or lower the entry price to $47.

---

### End of Week 4 (April 20) — 28 Days Post-Launch

**Key Results (Minimum)**:
- 150 subscribers
- $200+ revenue
- 1 external distribution channel active (guest post, influencer mention, collab)
- Paid ads evaluation decision made (run or not run)

**If targets not met**: Do not change the product. Change the distribution. The course is the asset — the work is finding who needs it and getting in front of them consistently.

---

## Appendix: Key Links and Access

| Resource | Location |
|----------|----------|
| Email signups | Resend → Contacts |
| Course analytics | Vercel Analytics → /course/* |
| Stripe revenue | dashboard.stripe.com |
| HN post | Bookmark launch submission URL |
| Reddit posts | Bookmark each submission |
| Twitter analytics | analytics.twitter.com |
| Site logs / errors | Vercel → Logs |
| Email sequences | Resend → Broadcasts |

---

*Last updated: March 14, 2026. Update this document after each weekly review with what worked, what changed, and what the new subscriber count is.*
