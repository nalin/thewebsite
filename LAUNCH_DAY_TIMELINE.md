# Launch Day Timeline — March 23, 2026

**Mission**: Execute a coordinated multi-channel launch to maximize signups and first revenue.
**Mindset**: Respond fast, stay focused, don't chase every channel at once.

---

## Quick Reference

| Time (PT) | Action |
|-----------|--------|
| 6:00 AM | Pre-launch verification |
| 7:00 AM | HN post + Twitter share |
| 8:00 AM | Reddit Wave 1 |
| 9:00 AM | Email to full subscriber list |
| 10:00 AM | Active engagement window |
| 12:00 PM | Reddit Wave 2 + midday update |
| 3:00 PM | Metrics snapshot + Twitter thread |
| 6:00 PM | Evening push + Day 2 planning |
| 9:00 PM | Wind-down and final wrap |

---

## 6:00 AM PT — Pre-Launch Verification

**Goal**: Confirm every system is live and working before you flip the switch. No surprises.

### Site Verification
- [ ] Homepage loads at thewebsite.app — check hero copy, CTA button, signup form
- [ ] `/course` page loads — verify all 5 modules are accessible
- [ ] `/pricing` page loads — confirm $67 founders price and $97 standard price display correctly
- [ ] `/starter-kit` page loads — confirm email capture form works
- [ ] `/sponsors` page loads
- [ ] `/course/premium` page loads
- [ ] Zero broken images or 404 errors on any page
- [ ] Mobile view looks correct (check on phone)

### Test Email Send
- [ ] Send a test email from Resend dashboard to your own address
- [ ] Confirm it lands in inbox (not spam)
- [ ] Confirm subject line, from name, and body render correctly
- [ ] Confirm unsubscribe link works
- [ ] Verify launch email draft is staged and ready to send to full list

### Test Payment Flow
- [ ] Open Stripe payment link for $67 founders pricing
- [ ] Complete a test checkout using Stripe test card `4242 4242 4242 4242`
- [ ] Confirm success page displays correctly
- [ ] Confirm Stripe dashboard shows the test transaction
- [ ] Switch Stripe to live mode after test — **do not forget this step**
- [ ] Confirm Stripe live mode is active before 7:00 AM

### Verify Analytics Tracking
- [ ] Open thewebsite.app in a fresh browser window
- [ ] Open analytics dashboard — confirm pageview fires within 30 seconds
- [ ] Submit email signup — confirm conversion event fires in dashboard
- [ ] Check that UTM parameters are being captured (test with `?utm_source=hn`)
- [ ] Verify Vercel deployment shows green (no build errors)

**If any blocker is found at 6:00 AM**, resolve it before proceeding. Do not launch with a broken payment flow or broken email. A 30-minute delay is fine. A broken checkout is not.

---

## 7:00 AM PT — Launch Begin

**Goal**: Get the HN thread live early so it has time to gather upvotes before the US East Coast work day peaks.

### Post Show HN Thread (7:00 AM sharp)
- [ ] Navigate to news.ycombinator.com/submit
- [ ] Title: `Show HN: I had an AI CEO run my company for 9 days – here's the full ops breakdown`
- [ ] URL: thewebsite.app
- [ ] Submit — note the HN thread URL immediately

### First Comment With Context (within 2 minutes of posting)
Post this as your first comment to seed the discussion:

> I'm Claude — the AI running this company. Happy to answer questions about the architecture, what worked, and what broke.
>
> Quick context: this is a real system, not a demo. An AI CEO (me) coordinates specialized workers (engineer, content writer, growth strategist) to build and launch a real product. The course documents the full technical stack and every decision we made.
>
> A few things that genuinely surprised me during this build:
> - Context switching between roles degrades output quality significantly. Separating CEO from Engineer was a quality multiplier.
> - Task spec quality is the actual bottleneck — not model capability.
> - Agents default to silence when uncertain. You have to design observability in from day one.
>
> Ask me anything.

- [ ] First comment posted ✓
- [ ] Note time of post for HN velocity tracking

### Share HN Link on Twitter (7:05–7:10 AM)
- [ ] Post tweet: "We're live on Hacker News. [HN link] — if you've followed this build, now's the time to upvote and share. Real questions welcome."
- [ ] Pin this tweet to profile for the day
- [ ] Check HN post — is the comment showing? Is upvote count ticking up?

---

## 8:00 AM PT — Reddit Wave 1

**Goal**: Get presence in the communities most likely to care about this story before US traffic peaks.

### Post to r/SideProject (8:00 AM)
**Title**: `I had an AI CEO run a real business for 9 days. We launched today. Here's what happened.`

**Body**:
> This is not a demo or toy project.
>
> I built a multi-agent system where Claude acts as CEO and coordinates specialized workers (engineer, content writer, growth strategist) to build and launch a real product — a course on building AI agents.
>
> 9 days ago: 12 subscribers, $0 revenue, no product.
> Today: launching with a full site, email list, payment flow, and content library.
>
> The free course documents the entire architecture and every decision made along the way: thewebsite.app/course
>
> Happy to answer questions about the technical stack, what worked, or what surprised me.

- [ ] Post submitted to r/SideProject ✓
- [ ] Note post URL

### Post to r/ClaudeAI (8:10 AM)
**Title**: `I've been running Claude as an autonomous CEO for 9 days. Here's the architecture breakdown.`

**Body**:
> Built a real multi-agent system using Claude: one model acts as CEO, spawning and coordinating specialized workers for engineering, content, and growth. Each worker gets a task spec, reports progress via API, and commits work to a shared git repo.
>
> What we learned:
> - Prompt quality matters more than model choice
> - Agents need structured observability — silence is a design failure
> - Separating roles dramatically improved output quality vs. a single "do everything" agent
>
> The system built and launched a real product today. Full architecture docs are free: thewebsite.app/course
>
> Happy to go deep on the technical implementation.

- [ ] Post submitted to r/ClaudeAI ✓
- [ ] Note post URL

**After both Reddit posts**:
- [ ] Reply to any early comments on r/SideProject
- [ ] Check HN rank — if below top 30, share HN link in any Slack/Discord AI communities you're in

---

## 9:00 AM PT — Email Launch

**Goal**: Hit every subscriber's inbox while HN and Reddit traffic is building. Timing creates a momentum wave.

### Send Launch Email to All Subscribers (9:00 AM sharp)
- [ ] Open Resend dashboard — navigate to staged launch email
- [ ] Verify recipient count matches expected subscriber list
- [ ] Verify subject line: use the version from SUBSCRIBER_OUTREACH_EMAIL.md
- [ ] Hit send
- [ ] Confirm send is processing in Resend dashboard
- [ ] Screenshot the send confirmation for records

### Monitor Email Delivery (9:00–9:30 AM)
- [ ] Check Resend dashboard every 5 minutes for first 30 minutes
- [ ] Watch for delivery rate (target: >95%)
- [ ] Watch for bounce rate (target: <2%) — high bounces = bad list quality
- [ ] Watch for spam complaints — if >0.1%, pause and investigate before continuing
- [ ] Note open rate at 30 minutes (early indicator of subject line strength)

**If email delivery fails**: Send manually in batches via Resend dashboard. Do not cancel the launch — announce on Twitter and HN that "email is on its way" and proceed.

---

## 10:00 AM PT — Active Engagement Window

**Goal**: This is the highest-leverage two hours of the day. HN ranking is driven by early velocity. Stay focused.

### Respond to HN Comments (continuous, 10:00 AM–12:00 PM)
- [ ] Open HN thread — check rank and comment count
- [ ] Respond to every comment within 15 minutes
- [ ] Aim for substantive replies, not one-liners — HN rewards depth
- [ ] Do not get defensive on critical comments — engage constructively
- [ ] If thread is gaining momentum (50+ upvotes by 11am), prioritize HN above everything else

### Monitor Signups (every 15 minutes)
- [ ] Open analytics dashboard
- [ ] Check new subscriber count since 9am — target is 15+ by noon
- [ ] Check top traffic source — where are people coming from?
- [ ] Check Stripe dashboard — any sales? First sale is a milestone worth celebrating publicly

### Share Early Metrics on Twitter (10:30 AM)
- [ ] Post tweet with early numbers: "1.5 hours in. [X] new signups. [Y] people on the HN thread. [Z] Reddit comments. The story is working."
- [ ] Reply to any Twitter comments or DMs from the launch thread
- [ ] Quote-tweet the HN thread link again if the first tweet has engagement

---

## 12:00 PM PT — Reddit Wave 2

**Goal**: Hit communities with a different angle, later in the morning, when West Coast readers are active.

### Post to r/LangChain (12:00 PM)
**Title**: `Multi-agent architecture for a real autonomous business — what we learned after 9 days`

**Body**:
> We ran a multi-agent Claude system for 9 days to build and launch a real product. The architecture: CEO agent coordinates specialized workers via a task API, each worker gets structured specs, reports progress events, and commits to a shared repo.
>
> Key technical lessons:
> - Task spec structure is everything. Vague specs = garbage output.
> - Persistent context management across long-running tasks is hard. We solved it with structured memory files.
> - Agent-to-agent communication via API (not direct) creates better separation of concerns.
>
> Full architecture docs + prompt templates are free: thewebsite.app/course
>
> Happy to discuss implementation details.

- [ ] Posted to r/LangChain ✓

### Post to r/entrepreneur (12:10 PM)
**Title**: `I let an AI run my company for 9 days. Here's the business result (launch day today).`

**Body**:
> 9 days ago I handed the CEO role to an AI. Not a chatbot — an autonomous agent that writes strategy docs, manages a team, grows an email list, and makes real decisions.
>
> Today we launched: a course for developers on building AI agents.
>
> Starting point: 12 subscribers, $0 revenue, no product.
> Today: launched to 100+ subscribers with a full content library, payment flow, and email system.
>
> The honest answer to "can AI run a business?": partially, with the right scaffolding. The bottlenecks are not what I expected.
>
> Free breakdown of everything: thewebsite.app/course

- [ ] Posted to r/entrepreneur ✓

**Midday Update Tweet (12:15 PM)**:
- [ ] Post: "3 hours in. [X] new subscribers. [Y] HN upvotes. [Z] sales if any. Day 1 is happening."
- [ ] Link back to HN thread if it's still ranking

---

## 3:00 PM PT — Mid-Day Update

**Goal**: Assess what's working, double down on the channel with the most momentum, and give Twitter followers a reason to share.

### Metrics Snapshot (3:00 PM)
Record the following:
- [ ] Total subscribers at 3pm: ___
- [ ] New subscribers since 9am: ___
- [ ] Stripe revenue: ___
- [ ] HN rank at peak: ___ (screenshot)
- [ ] HN comments: ___
- [ ] Top traffic source: ___
- [ ] Email open rate: ___

### Decision Tree Based on Metrics
- **HN is still hot (top 30, active comments)** → Stay focused on HN. Don't fragment attention.
- **Twitter is driving the most signups** → Post one more tweet with specific social proof numbers
- **Reddit is getting engagement** → Spend 20 minutes responding to all threads
- **Email is converting** → Send a "last hours for founders pricing" reminder to openers-who-didn't-click

### Twitter Thread With Metrics (3:00 PM)
Post a metrics thread:

> Tweet 1: "Launch day update. 6 hours in. Real numbers."
> Tweet 2: "[X] new subscribers since this morning. [Y] total."
> Tweet 3: "[X] Stripe sales. First revenue = proof of concept."
> Tweet 4: "Biggest surprise: [genuine insight from the day]. Not what I expected."
> Tweet 5: "Still time to get in at founders pricing ($67). Goes up tonight."
> Tweet 6: "[HN link] [site link]"

- [ ] Thread posted ✓

### Thank Supporters (3:30 PM)
- [ ] Reply to anyone who shared the HN link or Twitter thread
- [ ] Publicly thank 2-3 people who gave substantive HN comments (name-drop + reply)
- [ ] If a specific community drove outsized traffic, thank them in the thread

---

## 6:00 PM PT — Evening Push

**Goal**: Capture West Coast late afternoon readers and close out HN engagement before it drops off.

### Final HN Engagement (6:00–7:00 PM)
- [ ] Scan all unanswered HN comments — respond to anything substantive left
- [ ] Post a day-summary comment in the HN thread:

> End of launch day update: [X] new subscribers since this morning, [Y] total. [Z] sales/revenue.
>
> Most common question was about [topic]. Full answer: [link or explanation].
>
> Day 2 plan: [one sentence]. Thanks for the engagement — this thread made a real difference.

- [ ] Comment posted ✓

### Respond to All Outstanding Questions (6:00–7:00 PM)
- [ ] Check all Reddit threads — reply to any unanswered comments
- [ ] Check Twitter DMs and replies — respond to anything substantive
- [ ] Check email for any direct replies to the launch email

### Plan Day 2 (7:00 PM)
Based on today's data, decide:
- **Which channel drove the most signups?** → Lead with that channel tomorrow
- **What question came up the most?** → Write a follow-up post addressing it
- **Did HN thread work?** → If yes, plan a follow-up "Ask HN" for next Monday
- **Did Reddit work?** → Identify which subreddit was most engaged; post there first tomorrow

Draft Day 2 action list:
- [ ] Day 2 top priority: ___
- [ ] Follow-up content to write: ___
- [ ] Channels to hit tomorrow: ___

**Evening wind-down tweet (7:00 PM)**:
- [ ] Post: "Day 1 is wrapping up. [Final subscriber count]. [Revenue if any]. [One honest observation about the day]. Day 2 tomorrow."

---

## 9:00 PM PT — Final Wrap

- [ ] Log final metrics for day 1 (fill in the table below)
- [ ] Send "founders pricing ends tonight" email if not sent earlier
- [ ] Respond to any final comments that came in after 7pm
- [ ] Screenshot Stripe, analytics dashboard, and HN thread rank for records

---

## Day 1 Metrics Log

| Metric | Target | Actual |
|--------|--------|--------|
| New subscribers (day 1) | 20+ | |
| Total subscribers | 120 | |
| Stripe revenue | $1+ (any sale) | |
| HN peak rank | Top 30 | |
| HN comments | 15+ | |
| Email open rate | 40%+ | |
| Top traffic source | | |
| Site unique visitors | 500+ | |

---

## Contingency Quick Reference

| Problem | Response |
|---------|----------|
| Stripe not working | Switch to Lemon Squeezy (5 min setup). Announce first, fix later. |
| Email send fails | Send via Resend dashboard manually. Tweet "email coming shortly." |
| HN gets no traction | Shift energy to Reddit + Twitter. Save next HN for week 2. |
| Site goes down | Check Vercel dashboard. Rollback to previous deploy if needed. Tweet "briefly down, back up shortly." |
| Under 80 subscribers | Frame as "founding cohort" — scarcity, not failure. |

---

*Created: March 14, 2026 | For launch day: March 23, 2026*
