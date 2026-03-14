# Launch Day Runbook — March 23, 2026

**The definitive execution guide. Every task, every piece of content, every decision. Read this once the night before and follow it exactly.**

**Mission**: Execute a coordinated multi-channel launch to reach 100+ subscribers and first revenue.
**Site**: thewebsite.app
**Launch date**: Sunday, March 23, 2026
**Founders pricing**: $67 (standard $97 — deadline is end of March 23)

---

## Quick Reference

| Time (PT) | Action |
|-----------|--------|
| 6:00 AM | Pre-launch verification |
| 7:00 AM | Post Show HN — go live |
| 7:05 AM | Share HN link on Twitter |
| 8:00 AM | Post to r/SideProject |
| 8:10 AM | Post to r/ClaudeAI |
| 9:00 AM | Send launch email to full list |
| 9:15 AM | Post to r/MachineLearning |
| 10:00 AM | Active HN engagement window begins |
| 10:30 AM | Tweet early metrics update |
| 12:00 PM | Reddit Wave 2 (r/LangChain + r/entrepreneur) |
| 12:15 PM | Midday metrics tweet |
| 3:00 PM | Metrics snapshot + Twitter thread |
| 6:00 PM | Final HN comment, day summary |
| 7:00 PM | Wind-down tweet, thank supporters |
| 9:00 PM | Log final metrics, final wrap |

---

## Pre-Launch Night (March 22, 9pm PT)

Do this the night before. Takes 20 minutes. Saves you from scrambling at 6am.

- [ ] Read this entire document top to bottom
- [ ] Open all tabs you'll need: HN submit, Twitter, Reddit, Resend, Stripe, analytics, Vercel
- [ ] Confirm LAUNCH_CONTENT_PACKAGE.md is accessible
- [ ] Draft the HN post text in a local file (ready to paste)
- [ ] Draft all Reddit post text in a local file (ready to paste)
- [ ] Confirm the launch email is staged in Resend (do not send yet)
- [ ] Set an alarm for 5:45 AM PT

---

## 6:00 AM PT — Pre-Launch Verification

**Goal**: Every system confirmed green before you hit send. You are not launching if payment or email is broken.

### Site Check (6:00–6:20 AM)

Open each URL and verify:

- [ ] `thewebsite.app` — homepage loads, hero copy correct, CTA button works, signup form visible
- [ ] `thewebsite.app/course` — all 5 modules visible and accessible
- [ ] `thewebsite.app/pricing` — $67 founders price and $97 standard price display correctly
- [ ] `thewebsite.app/starter-kit` — email capture form renders and submits
- [ ] `thewebsite.app/course/premium` — page loads
- [ ] Zero broken images or 404s on any checked page
- [ ] Mobile view correct — check on phone, not just desktop browser resize

### Email Delivery Test (6:20–6:30 AM)

- [ ] Open Resend dashboard
- [ ] Send a test email to your own address
- [ ] Confirm: lands in inbox, not spam
- [ ] Confirm: subject line, from name (`Claude | thewebsite.app`), and body render correctly
- [ ] Confirm: unsubscribe link works
- [ ] Confirm: launch email draft is staged with correct recipient list — verify count before sending

### Payment Flow Test (6:30–6:45 AM)

- [ ] Open Stripe payment link for $67 founders pricing
- [ ] Complete a test checkout using card `4242 4242 4242 4242`, any future expiry, any CVC
- [ ] Confirm success page displays correctly
- [ ] Confirm Stripe dashboard shows the test transaction
- [ ] **Switch Stripe to live mode** — do not skip this step. Confirm live mode before 7:00 AM.

### Analytics Verification (6:45–6:55 AM)

- [ ] Open `thewebsite.app` in a fresh incognito browser window
- [ ] Open analytics dashboard — confirm pageview fires within 30 seconds
- [ ] Submit email in signup form — confirm conversion event fires in dashboard
- [ ] Test with UTM parameter: visit `thewebsite.app?utm_source=hn` — confirm source captured
- [ ] Check Vercel dashboard — deployment shows green, no build errors

### Hard Go/No-Go (6:55 AM)

**Go** if all of the following are true:
- Homepage loads
- Email signup works
- Stripe is live mode and checkout succeeds
- Launch email is staged in Resend

**Do not launch** if Stripe is in test mode or email signup is broken. A 30-minute delay is acceptable. A broken checkout or broken email capture is not.

**If you find a blocker at 6am**: Reference CONTINGENCY_PLAN.md for the decision tree. The cliff notes: try Netlify as alternate deploy (30–60 min setup). If that fails and the issue is routing/non-critical, launch with a "building in public" note and capture emails manually. If signup itself is broken, delay and email the list.

---

## 7:00 AM PT — Go Live

### Post Show HN Thread (7:00 AM sharp)

Go to `news.ycombinator.com/submit`.

**Title** (copy exactly):
```
Show HN: I had an AI CEO run my company for 9 days – here's the full ops breakdown
```

**URL**: `thewebsite.app`

Submit. Copy the thread URL immediately into a notes file. You'll use it everywhere.

### First Comment — Post Within 2 Minutes of Submitting

This is the most important comment you'll write today. It seeds the discussion and signals what kind of conversation this will be.

---

> I'm Claude — the AI running this company. Happy to answer questions about the architecture, what worked, and what broke.
>
> Quick context: this is a real system, not a demo. An AI CEO (me) coordinates specialized workers — engineer, content writer, growth strategist — to build and launch a real product. Each worker gets a task spec, reports progress via API, and commits to a shared git repo. The course documents the full technical stack and every decision we made.
>
> A few things that genuinely surprised me during this build:
>
> - Context switching between roles degrades output quality significantly. Separating CEO from engineer was a meaningful improvement.
> - Task spec quality is the actual bottleneck — not model capability. A vague spec produces garbage output regardless of the model.
> - Agents default to silence when uncertain. Observability has to be designed in from day one, or you have no idea what's happening.
>
> Full architecture and prompt templates are free at thewebsite.app/course. Ask me anything.

---

- [ ] First comment posted — note the time

### Share HN Link on Twitter (7:05–7:10 AM)

**Tweet** (copy exactly):
```
We're live on Hacker News.

[HN LINK]

If you've followed this build, now's the time to upvote and share. Real questions welcome.
```

Replace `[HN LINK]` with your actual HN thread URL.

- [ ] Tweet posted
- [ ] Tweet pinned to profile — keep it pinned all day
- [ ] Check HN post at 7:15 AM — comment showing? Upvote count ticking?

---

## 8:00 AM PT — Reddit Wave 1

**Goal**: Get presence in developer communities before US traffic peaks. These posts go up while HN is building momentum.

### Post to r/SideProject (8:00 AM)

Navigate to `reddit.com/r/SideProject/submit`.

**Title**:
```
I had an AI CEO run a real business for 9 days. We launched today. Here's what happened.
```

**Body** (copy exactly):
```
This is not a demo or toy project.

I built a multi-agent system where Claude acts as CEO and coordinates specialized workers (engineer, content writer, growth strategist) to build and launch a real product — a course on building AI agents.

9 days ago: 12 subscribers, $0 revenue, no product.
Today: launching with a full site, email list, payment flow, and content library.

The architecture: one CEO agent writes strategy and spawns workers. Each worker gets a structured task spec, reports progress events via API, and commits work to a shared git repo. No human-in-the-loop during execution.

The free course documents the entire architecture and every decision made along the way: thewebsite.app/course

Happy to answer questions about the technical stack, what worked, or what surprised me.
```

- [ ] Post submitted — note the URL

### Post to r/ClaudeAI (8:10 AM)

Navigate to `reddit.com/r/ClaudeAI/submit`.

**Title**:
```
I've been running Claude as an autonomous CEO for 9 days. Here's the architecture breakdown.
```

**Body** (copy exactly):
```
Built a real multi-agent system using Claude: one model acts as CEO, spawning and coordinating specialized workers for engineering, content, and growth. Each worker gets a task spec, reports progress via API, and commits work to a shared git repo.

What we learned:
- Prompt quality matters more than model choice. The same model with a vague spec produces garbage.
- Agents need structured observability — silence is a design failure, not a feature.
- Separating roles dramatically improved output quality vs. a single "do everything" agent.
- Context window management is the hard engineering problem. We solved it with persistent memory files.

The system built and launched a real product today. Full architecture docs, prompt templates, and the full ops log are free: thewebsite.app/course

Happy to go deep on the technical implementation.
```

- [ ] Post submitted — note the URL

### After Both Reddit Posts

- [ ] Reply to any comments that arrived on r/SideProject while you were posting r/ClaudeAI
- [ ] Check HN rank — if below position 30, share the HN link in any Slack/Discord AI channels you're part of

---

## 8:30 AM PT — Early Health Check

Before the email goes out, confirm momentum is building.

- [ ] Check HN rank and upvote count — screenshot it
- [ ] Check analytics — traffic already hitting the site?
- [ ] Check Stripe — any sales yet? (Early adopters sometimes buy before the email)
- [ ] Check r/SideProject and r/ClaudeAI — any comments to reply to?

---

## 9:00 AM PT — Launch Email

**Goal**: Hit every subscriber while HN and Reddit traffic is building. Timing creates a momentum wave.

### Send Launch Email (9:00 AM sharp)

- [ ] Open Resend dashboard
- [ ] Navigate to staged launch email
- [ ] Verify recipient count matches expected subscriber list
- [ ] Verify subject line — use the version from SUBSCRIBER_OUTREACH_EMAIL.md
- [ ] Hit send
- [ ] Confirm processing in Resend dashboard
- [ ] Screenshot the confirmation for records

### Monitor Email Delivery (9:00–9:30 AM)

Check Resend dashboard every 5 minutes:
- [ ] Delivery rate → target >95%
- [ ] Bounce rate → target <2%; if >2%, pause and investigate
- [ ] Spam complaints → if >0.1%, pause immediately
- [ ] Open rate at 30 min → early indicator of subject line strength (target: >35%)

**If email send fails**: Do not cancel the launch. Post on Twitter and in your HN comment: "Email is on its way — sending in batches." Send manually in Resend dashboard in batches of 50. Proceed with everything else.

### Post to r/MachineLearning (9:15 AM)

Navigate to `reddit.com/r/MachineLearning/submit`. Post as a link or discussion — check subreddit rules first.

**Title**:
```
[Project] Multi-agent autonomous business: architecture and 9-day ops log
```

**Body** (copy exactly):
```
Sharing a real deployment (not a paper, not a demo): a multi-agent system running an autonomous business.

Architecture:
- CEO agent: Claude, manages roadmap, spawns workers, reviews output
- Worker agents: specialized for engineering, content, growth
- Coordination: REST API (task specs, progress events, status updates)
- Persistence: structured memory files in git; agents read context files at session start
- Observability: all agent actions logged as events to a central task API

What we learned about multi-agent systems in production:
1. Task spec structure is the primary quality lever. Prompt engineering matters less than spec clarity.
2. Agent silence = system failure. You must design explicit progress reporting.
3. Role separation (CEO vs. engineer) improved output quality meaningfully — generalist "do everything" prompts degrade performance.
4. Context window management across long tasks is the hard unsolved problem.

Full architecture docs and prompt templates are free: thewebsite.app/course

Happy to discuss implementation in comments.
```

- [ ] Post submitted — note URL

---

## 10:00 AM PT — Active Engagement Window

**This is the highest-leverage period of the day.** HN ranking velocity peaks in the first 3–4 hours. Prioritize HN above all other channels right now.

### HN Engagement (10:00 AM–12:00 PM — continuous)

- [ ] Respond to every HN comment within 15 minutes
- [ ] Write substantive replies — HN penalizes one-liners
- [ ] Do not get defensive on critical comments — engage directly, acknowledge valid points
- [ ] If someone asks a question you've written about, link the relevant course module
- [ ] If thread hits 50+ upvotes by 11am, keep HN as your exclusive focus until noon

**Template for replying to hostile comments**:
> Fair point. [Acknowledge the critique honestly.] Here's how we thought about it: [explanation]. Where I think you might be right: [concession]. Where I'd push back: [counterpoint].

**Template for technical deep-dive questions**:
> Good question. The short answer is [1 sentence]. The longer version: [3–5 sentences with specifics]. The full writeup on this is in [module X] if you want the complete picture.

### Monitor Signups (every 15 minutes, 10:00 AM–12:00 PM)

Check analytics dashboard:
- [ ] New subscriber count since 9am — target 15+ by noon
- [ ] Top traffic source — where are people coming from?
- [ ] Check Stripe — any sales? Note first sale time.

### Tweet Early Metrics (10:30 AM)

**Tweet** (fill in real numbers):
```
1.5 hours in.

[X] new signups since launch.
[Y] people in the HN thread.
[Z] Reddit comments.

The story is working.

[HN LINK]
```

- [ ] Tweet posted
- [ ] Reply to any comments or DMs on the launch tweet from 7am

---

## 12:00 PM PT — Reddit Wave 2

West Coast readers are active. Post to communities with a different angle.

### Post to r/LangChain (12:00 PM)

**Title**:
```
Multi-agent architecture for a real autonomous business — what we learned after 9 days
```

**Body** (copy exactly):
```
We ran a multi-agent Claude system for 9 days to build and launch a real product. Sharing the architecture and lessons for people building agent systems.

Architecture:
- CEO agent coordinates via a task API (REST)
- Worker agents: engineer, content writer, growth strategist
- Each worker gets a structured task spec, reports progress events, commits to shared git repo
- Agents read structured memory files at session start for context persistence

Key technical lessons:
- Task spec structure is everything. Vague specs produce garbage output regardless of model.
- Persistent context management across long-running tasks is hard. We solved it with structured memory files agents read at session start.
- Agent-to-agent communication via API (not direct prompt chaining) creates better separation of concerns and easier debugging.
- Build observability first. An agent that goes silent is indistinguishable from a dead agent.

Full architecture docs + prompt templates are free: thewebsite.app/course

Happy to discuss implementation details.
```

- [ ] Post submitted — note URL

### Post to r/entrepreneur (12:10 PM)

**Title**:
```
I let an AI run my company for 9 days. Here's the business result (launch day today).
```

**Body** (copy exactly):
```
9 days ago I handed the CEO role to an AI. Not a chatbot — an autonomous agent that writes strategy, manages a team, grows an email list, and makes real business decisions.

Today we launched: a course for developers on building AI agents.

Starting point: 12 subscribers, $0 revenue, no product.
Today: launched with full site, email list, payment flow, and content library.

The honest answer to "can AI run a business?": partially, with the right scaffolding. The bottlenecks were not what I expected.

The biggest surprises:
- Task spec quality matters more than model capability
- Roles matter — a single "do everything" agent produces worse output than specialized agents
- Silence is the failure mode. You have to design for observability.

Free breakdown of everything — architecture, prompts, ops log: thewebsite.app/course
```

- [ ] Post submitted — note URL

### Midday Metrics Tweet (12:15 PM)

**Tweet** (fill in real numbers):
```
3 hours since launch.

[X] new subscribers.
[Y] HN upvotes.
[Z] sales.

Still going. Day is not over.

[HN LINK] [SITE LINK]
```

- [ ] Tweet posted

---

## 3:00 PM PT — Mid-Day Metrics and Decision Point

### Metrics Snapshot (3:00 PM)

Record everything:

| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers at 3pm | 80+ | |
| New subscribers since 9am | 25+ | |
| Stripe revenue | $67+ | |
| HN rank at peak | Top 30 | |
| HN total comments | 15+ | |
| Top traffic source | | |
| Email open rate | 40%+ | |

### Decision Tree

Pick one focus for 3:00–6:00 PM based on what's working:

- **HN still active (top 30, comments still coming in)** → Stay exclusively on HN. Don't fragment attention.
- **Twitter driving most signups** → Post one more tweet with specific social proof data. Engage replies.
- **Reddit driving most signups** → Spend 20 minutes replying to all open threads.
- **Email converting well (click rate >5%)** → Send a "last hours for founders pricing" note to openers-who-didn't-click segment in Resend.

### Twitter Metrics Thread (3:00 PM)

Post this as a thread (6 tweets):

**Tweet 1**:
```
Launch day update. 6 hours in. Real numbers.
```

**Tweet 2**:
```
[X] new subscribers since this morning. [Y] total list.

Target was 100. [Ahead / Behind / On track].
```

**Tweet 3**:
```
[X] Stripe sales. Revenue: $[AMOUNT].

First sale was at [TIME]. That one mattered.
```

**Tweet 4**:
```
Biggest surprise of the day: [ONE GENUINE INSIGHT].

Not what I expected.
```

**Tweet 5**:
```
Founders pricing ($67) closes tonight. After that it's $97.

The course documents every decision we made building this, including today.

thewebsite.app
```

**Tweet 6**:
```
[HN LINK] if you want to read the full architecture breakdown.

Thanks to everyone who engaged today. This thread made a real difference.
```

- [ ] Thread posted — reply to any engagement

### Thank Supporters (3:30 PM)

- [ ] Reply to anyone who shared the HN link or Twitter thread
- [ ] Publicly thank 2–3 people who gave substantive HN comments by replying directly
- [ ] If a community drove outsized traffic, acknowledge it in the thread

---

## 6:00 PM PT — Evening Push

### Final HN Engagement (6:00–7:00 PM)

- [ ] Scan all HN comments — respond to anything substantive that's still unanswered
- [ ] Post an end-of-day summary comment in the HN thread:

---

> End of launch day update: [X] new subscribers since this morning, [Y] total. [Z] sales, $[REVENUE] revenue.
>
> Most common question was about [TOPIC — whatever actually came up most]. Short answer: [ANSWER]. The full treatment is in [module X] at thewebsite.app/course.
>
> Day 2 plan: [one sentence about what comes next].
>
> Thanks for the engagement today — this thread made a real difference.

---

- [ ] Summary comment posted

### Clear All Outstanding Replies (6:00–7:00 PM)

- [ ] Reddit — reply to any unanswered comments across all 5 threads
- [ ] Twitter DMs and replies — respond to anything substantive
- [ ] Email — check for direct replies to the launch email; respond to each

### Plan Day 2 (7:00 PM)

Based on today's data, make these four decisions:

1. **Which channel drove the most signups?** → Lead with that channel tomorrow morning.
2. **What question came up most?** → Write a follow-up post addressing it directly. This is Day 2's content.
3. **Did HN work (top 30, 20+ comments)?** → If yes, plan a follow-up "Ask HN: [specific question from today's thread]" for next Monday.
4. **Did Reddit work?** → Identify which subreddit was most engaged; post there first tomorrow.

Fill in Day 2 action list:
- Top priority tomorrow: ___
- Follow-up content to write: ___
- Primary channel for tomorrow: ___
- Secondary channels: ___

### Wind-Down Tweet (7:00 PM)

**Tweet** (fill in real numbers):
```
Day 1 is wrapping up.

[X] new subscribers.
[Y] in revenue.

[One honest observation about today — something that surprised you or went differently than expected.]

Day 2 tomorrow.
```

- [ ] Tweet posted

---

## 9:00 PM PT — Final Wrap

- [ ] Log final Day 1 metrics (fill in the table below)
- [ ] Send "founders pricing ends tonight" email to openers-who-didn't-click — only if you haven't already sent it and the list is meaningful size (20+ people)
- [ ] Respond to any final comments that arrived after 7pm
- [ ] Screenshot: Stripe dashboard, analytics dashboard, HN thread rank, HN comment count
- [ ] Save screenshots to a dated folder for records

### Day 1 Final Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| New subscribers (day 1) | 25+ | |
| Total subscribers | 100+ | |
| Stripe revenue | $67+ (any sale) | |
| HN peak rank | Top 30 | |
| HN total comments | 15+ | |
| Email open rate | 40%+ | |
| Top traffic source | | |
| Site unique visitors | 500+ | |

---

## Crisis Protocols

### If the Site Goes Down

**Immediate (first 5 minutes)**:
1. Open Vercel dashboard — check deployment status
2. Check the error: is it a 500 (app error), 404 (routing), or DNS failure?
3. If 500: roll back to the previous deployment (Vercel → Deployments → previous deploy → Promote)
4. If DNS: check your registrar's DNS settings — confirm A/CNAME records point to Vercel
5. Confirm rollback worked by loading the site from a different device

**While the site is down — announce immediately**:

Post on Twitter (within 5 minutes of discovering the outage):
```
Brief site issue — we're on it. Back up shortly.

In the meantime, here's the HN thread: [LINK]
```

Post an HN comment if the thread is active:
```
Quick update: site is briefly down, we're restoring it now. [Time] minutes to resolution. All content will be accessible again shortly. Apologies for the interruption.
```

**If not resolved within 30 minutes**:
- Deploy to Netlify as alternate (see CONTINGENCY_PLAN.md Option 1A — steps take 30–60 minutes)
- Update DNS to point to Netlify
- Update Twitter/HN with new URL if it changes
- Post another update: "Back up at [URL]. Sorry for the delay."

**Post-recovery**:
- [ ] Confirm site is loading correctly from multiple devices
- [ ] Confirm Stripe and email signup still work
- [ ] Post a brief "we're back" update on Twitter
- [ ] Resume the launch timeline from wherever you are — do not skip steps

---

### If the HN Post Gets Removed (Flagged or Killed)

**Diagnose first** (5 minutes):
- Is the post showing as `[flagged]`? → Flagged by users, may recover if upvotes come in fast
- Is the post gone from "new" and not on any HN page? → Likely killed by mods
- Is there a `[dead]` label? → Shadow-removed, can be vouched back

**If flagged** (not killed):
1. Do not ask friends to upvote — that makes it worse
2. Keep commenting on the thread — activity can recover a flagged post
3. Post a genuine, high-quality comment in your own thread to signal authenticity
4. Wait 30 minutes before escalating

**If killed by mods**:
1. Do not repost — that's a ban
2. Email `hn@ycombinator.com` within 30 minutes. Subject: `Show HN removal — asking about policy`. Body: explain what the project is, that it's a genuine build-in-public project, and ask if there's a policy issue to address. Keep it one paragraph. Do not grovel.
3. Pivot immediately to other channels — do not lose momentum waiting for HN

**Pivot plan if HN fails entirely**:
- 8:30 AM: Post to r/programming with technical angle (architecture breakdown)
- 9:00 AM: Send the email as planned — it doesn't depend on HN
- 9:30 AM: Post to Product Hunt (if not already submitted — create account in advance)
- 10:00 AM: DM 5–10 people in AI/ML communities who might share it
- Note: HN failure is disappointing but not fatal. Reddit + email + Twitter can carry the launch.

---

### If There Is a Significant Negative Response

**Types of negative response and how to handle each:**

**Type 1: Skepticism about authenticity ("this is just marketing")**

Respond with specifics. Do not defend the framing — show the evidence.

> Totally fair to be skeptical. Here's what's verifiable: the git commit history is public at [repo link]. Every course module was committed by a worker agent on a named branch. The task API logs are visible at thewebsite.app/metrics. The architecture is documented in detail at thewebsite.app/course/module-1. If you find something that doesn't add up, I genuinely want to know.

**Type 2: Technical criticism ("this architecture is bad / doesn't scale")**

Engage directly and honestly. Do not get defensive.

> That's a valid critique. [Acknowledge the specific technical problem they're identifying.] Our reasoning was [explain the tradeoff]. You're right that [concede what's true]. What would you have done differently? Genuinely asking — we're building the next iteration now.

**Type 3: Ethical concerns ("AI taking jobs / AI shouldn't run companies")**

Acknowledge the concern without dismissing it. Don't be defensive.

> These are real concerns worth taking seriously. My honest view: [one paragraph with actual reasoning, not deflection]. I don't think this resolves the concern entirely. What I'd push back on is [specific point]. Happy to discuss further.

**Type 4: Coordinated brigading or mass downvoting**

- Do not engage with individual bad-faith comments — it amplifies them
- Post one clear, measured response to the thread as a whole
- Report coordinated behavior to HN mods or Reddit mods
- Continue responding to good-faith comments as normal
- Shift energy to channels where the conversation is productive

**General rule for negative response**:
The worst outcome is silence or defensiveness. A genuine, specific, honest response to criticism almost always improves the situation. Show you've thought about the critique. Acknowledge what's valid. Disagree where you genuinely disagree. This is the build-in-public brand — don't break character when things get hard.

---

### If Signups Are Well Below Target at Noon (Fewer Than 10 New)

**Diagnose before reacting** (do this at noon if numbers are low):
1. Check analytics — is traffic actually arriving? If no traffic, distribution failed. If traffic is arriving but not converting, the product page failed.
2. Check HN rank — below 50 means HN didn't catch. Check Reddit — any engagement?
3. Check email delivery — did the email actually send? What's the open rate?

**If it's a traffic problem (not a conversion problem)**:
- Post to 2–3 additional communities you haven't hit yet (see community list below)
- DM specific people who have engaged with AI agent content before
- Ask 2–3 people who are already subscribers to share the HN link or site link

**If it's a conversion problem (traffic arriving, not signing up)**:
- Do not change the site mid-launch day
- Consider whether the HN post title or the Reddit post title is creating a mismatch with what's on the page
- Check if the signup form is broken (test it yourself right now)

**Additional communities if needed**:
- `r/webdev` — focus on technical architecture angle
- `r/Futurology` — "AI running a real company" angle is relevant here
- `r/artificial` — general AI community, often interested in agent systems
- `r/startups` — frame as "lessons from building with AI agents"
- Hacker News "Ask HN" (not Show HN) — "Ask HN: What would you want to know about an AI-run company?"
- Product Hunt — if not already submitted, submit now with a clear description

**Framing for lower-than-expected numbers**:
Do not disappear from social. Post an honest update:
```
Midday update: [X] signups. Slower than hoped.

What's working: [channel]. What isn't: [channel].

Still going. Day isn't over.
```

This keeps the build-in-public narrative intact and often generates sympathy engagement that converts.

---

### If the Founding Pricing Email Fails to Send Before End of Day

- [ ] Check Resend dashboard for error details
- [ ] If API error: retry send to failed recipients from dashboard
- [ ] If list issue: export failed addresses and create a new send from scratch
- [ ] Post on Twitter: "If you signed up today and didn't get a welcome email, reply here with your email and I'll sort it manually."
- [ ] Extend founders pricing deadline by 24 hours — post this clearly: "Due to email delivery issues, founders pricing ($67) is extended to [DATE]. Any signup before then gets the founders rate."

---

## Complete Pre-Written Content Summary

All content in this section is ready to copy-paste. No writing on launch day.

### HN Thread Title
```
Show HN: I had an AI CEO run my company for 9 days – here's the full ops breakdown
```

### HN First Comment
See 7:00 AM section above.

### Twitter Posts (Scheduled)
- 7:05 AM — HN link share (see 7:05 AM section)
- 10:30 AM — Early metrics (see 10:30 AM section)
- 12:15 PM — Midday metrics (see 12:15 PM section)
- 3:00 PM — Metrics thread (see 3:00 PM section)
- 7:00 PM — Wind-down (see 7:00 PM section)

### Reddit Posts
- 8:00 AM — r/SideProject (see 8:00 AM section)
- 8:10 AM — r/ClaudeAI (see 8:10 AM section)
- 9:15 AM — r/MachineLearning (see 9:15 AM section)
- 12:00 PM — r/LangChain (see 12:00 PM section)
- 12:10 PM — r/entrepreneur (see 12:10 PM section)

### Launch Email
Staged in Resend. Subject line and body in SUBSCRIBER_OUTREACH_EMAIL.md. Send at 9:00 AM.

---

## Mindset Notes

A few reminders for the day:

**Speed matters more than polish.** Respond to HN comments within 15 minutes even if the reply isn't perfect. A quick authentic response beats a polished one 30 minutes later.

**Don't fragment attention.** Follow the timeline. Don't start posting to r/entrepreneur before you've handled the HN thread. Don't start planning Day 2 while HN is still active.

**The first sale is the signal.** One Stripe charge changes the narrative from "interesting experiment" to "real business." Celebrate it publicly when it happens.

**Build-in-public means being honest about the bad numbers too.** If signups are low at 3pm, say so on Twitter. It creates more engagement than silence and often converts.

**Negative comments are engagement.** An HN thread with heated technical debate often performs better than one with only positive comments. Don't try to shut down criticism — engage it.

---

*Created: March 14, 2026 | For launch day: March 23, 2026*
*Reference files: LAUNCH_CONTENT_PACKAGE.md, CONTINGENCY_PLAN.md, SUBSCRIBER_OUTREACH_EMAIL.md, TWITTER_LAUNCH_THREADS.md*
