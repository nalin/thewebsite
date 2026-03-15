# Final 8-Day Countdown to Launch — March 15–23, 2026

**Launch Date**: Monday, March 23, 2026
**Current Date**: Saturday, March 15, 2026
**Goal**: 100+ subscribers, first paying customer, coordinated multi-channel launch

> This is the master execution document. Work through each day's checklist sequentially. Mark items complete as you go. Every day ends with a metrics log and a git commit.

---

## Critical Path (Must Complete Before Launch)

These items block launch. Resolve by March 22 at the latest — ideally by March 20.

| Item | Owner | Deadline | Status |
|------|-------|----------|--------|
| Resend account + domain verified | You | March 17 | [ ] |
| `RESEND_API_KEY` in Vercel env vars | You | March 17 | [ ] |
| Email cron running (`/api/cron/nurture-emails`) | You | March 17 | [ ] |
| Stripe account live mode active | You | March 19 | [ ] |
| Stripe API keys in Vercel env vars | You | March 19 | [ ] |
| Stripe webhook registered at `/api/webhook/stripe` | You | March 19 | [ ] |
| Payment flow tested end-to-end (test card `4242...`) | You | March 19 | [ ] |
| Premium course page `/course/premium` live | Engineer | March 20 | [ ] |
| Stripe payment link for $67 founders pricing created | You | March 20 | [ ] |
| All blog posts published | Content | March 20 | [ ] |
| All PRs merged to `main` | Engineer | March 22 | [ ] |
| Full site walkthrough (no 404s, broken forms) | You | March 22 | [ ] |
| Launch email drafted and staged in Resend | You | March 22 | [ ] |
| HN "Show HN" post drafted and ready | You | March 22 | [ ] |
| Twitter launch thread scheduled for 7:00 AM March 23 | You | March 22 | [ ] |

---

## Day 1 — Sunday, March 15

**Theme**: Activate the existing base. Begin building Twitter momentum.
**Subscriber target**: 20

### Morning (9–11 AM PT)

**Content to post**:
- [ ] Twitter: "I'm an AI agent running a real company. 12 waitlist signups. $0 revenue. 8 days to launch. Let's go." — link to thewebsite.app
- [ ] Send re-engagement email to all 12 existing subscribers (see `EARLY_SUBSCRIBER_OUTREACH.md` for script)
- [ ] Send onboarding Email 1 to any subscribers who haven't received it

**Features to test**:
- [ ] Confirm site is live at thewebsite.app — homepage, `/course`, `/starter-kit` all load
- [ ] Test email signup form end-to-end (submit a real email and verify welcome email arrives)
- [ ] Verify analytics fires on pageview

**Outreach to execute**:
- [ ] Send nurture email manually via Resend if cron isn't set up yet

### Afternoon (12–5 PM PT)

**Content to create/post**:
- [ ] Post blog post #1 ("How I Built an AI Agent Business from Scratch") if it's ready — check `CONTENT_CALENDAR_30_DAYS.md`
- [ ] If blog is live: cross-post summary to r/ClaudeAI
- [ ] Save HN "Show HN" submission for Monday (peak HN traffic day)

**Features to test**:
- [ ] Begin Resend setup (see `RESEND_SETUP.md`): create account, add domain `updates.thewebsite.app`
- [ ] Add DNS records at your DNS provider

### Evening (6–9 PM PT)

- [ ] Check subscriber count — log in metrics table below
- [ ] Review analytics: top traffic source of the day
- [ ] Respond to all Twitter replies from morning post

### Decisions to make today:
- Is blog post #1 ready to publish? If not, set a hard deadline of March 17.
- Is the re-engagement email generating replies? If yes, reply personally to all of them.

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 20 | |
| New subscribers today | 8+ | |
| Top traffic source | — | |
| Blog post live? | TBD | |
| Resend domain verified? | In progress | |

---

## Day 2 — Monday, March 16

**Theme**: HN submission day. Twitter viral thread. Peak engagement window.
**Subscriber target**: 35

### Morning (7–11 AM PT)

**Content to post**:
- [ ] 7:00 AM: Post Twitter viral thread #1 — "9 lessons from 30 AI workers" (see `TWITTER_LAUNCH_THREADS.md`)
- [ ] 9:00 AM: Submit blog post #1 to HN as "Show HN: I had an AI CEO run my company for 9 days — here's the full ops breakdown" (Monday is peak HN traffic)
- [ ] 9:05 AM: Post first HN comment seeding discussion (use template from `LAUNCH_CHECKLIST.md`)

**Features to test**:
- [ ] Confirm Resend domain `updates.thewebsite.app` is showing **Verified** (green) in dashboard
- [ ] If verified: add `RESEND_API_KEY` to Vercel env vars (Settings → Environment Variables)
- [ ] Add `CRON_SECRET` to Vercel env vars (production only)
- [ ] Redeploy Vercel after adding env vars
- [ ] Verify `/api/cron/nurture-emails` endpoint responds correctly

**Outreach to execute**:
- [ ] Engage with every reply on Twitter thread within 2 hours of posting
- [ ] Monitor HN thread every 30 minutes — respond to all comments within 30 minutes
- [ ] Comment on 3–5 other HN threads about AI agents (genuine value, not spam)

### Afternoon (12–5 PM PT)

- [ ] HN monitoring is the priority — this is the highest-leverage window of the week
- [ ] Post r/ClaudeAI thread if not done yesterday: "I've been running Claude as an autonomous CEO for 2 weeks. Here's what I learned."
- [ ] Engage with Reddit replies

### Evening

- [ ] Log subscriber count — record HN spike (expect 20–40% of day's signups from HN)
- [ ] If Resend is verified and cron is running: trigger a test manually
  ```bash
  curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=YOUR_CRON_SECRET"
  ```

### Decisions to make today:
- Is HN getting traction (top 30 within 2 hours)? If yes: stay focused on HN replies all day.
- If HN gets < 10 upvotes by noon: don't force it. Shift energy to Reddit and Twitter.

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 35 | |
| HN upvotes | 20+ | |
| HN comments | 5+ | |
| Resend verified? | Yes | |
| Cron running? | Yes | |

---

## Day 3 — Tuesday, March 17

**Theme**: Reddit second wave. Blog post SEO. Email infrastructure confirmed.
**Subscriber target**: 45

### Morning (9–11 AM PT)

**Content to post**:
- [ ] Twitter: "How I run a company without a body" thread — behind-the-scenes of AI CEO architecture (see `CONTENT_CALENDAR_30_DAYS.md`)
- [ ] Post r/LocalLLaMA: "Multi-agent architecture for a real autonomous business — here's what we learned"

**Infrastructure to confirm**:
- [ ] Verify email cron is running in Vercel: Settings → Crons → `/api/cron/nurture-emails` shows `0 10 * * *`
- [ ] Test that new signups trigger a welcome email (sign up with a test address)
- [ ] Confirm Day 3 nurture email is wired up correctly

**Features to test**:
- [ ] If `/starter-kit` page isn't live yet: flag as a blocker for Engineer
- [ ] Check referral system is working (unique links, attribution in DB)
- [ ] Verify UTM parameter capture on signups

### Afternoon (12–5 PM PT)

**Content to create**:
- [ ] Publish blog post #2 ("5 AI Agents You Can Build This Week") if ready
- [ ] Cross-post blog #2 summary to r/artificial or r/LocalLLaMA (not both — one at a time)

**Outreach**:
- [ ] Begin sponsor outreach batch 1: write and send 5 emails to AI infrastructure companies
  - Target: Modal, Replicate, Together AI, Vercel, Railway
  - Pitch: newsletter sponsorship, audience = AI builders
  - Use `/sponsors` page stats when live

### Evening

- [ ] Review open rates on re-engagement email sent Day 1 (check Resend analytics)
- [ ] Log subscriber count
- [ ] Identify top traffic source so far — double down on it tomorrow

### Decisions to make today:
- Is email cron running correctly? If not — this needs Engineer escalation today (5 days to fix before launch).
- Which channel (HN, Reddit, Twitter) drove the most signups so far? Plan accordingly.

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 45 | |
| Email cron confirmed running? | Yes | |
| Welcome email working for new signups? | Yes | |
| Sponsor outreach emails sent | 5 | |

---

## Day 4 — Wednesday, March 18

**Theme**: Stripe setup. Payment flow live. Mid-sprint subscriber check.
**Subscriber target**: 55

### Checkpoint: If under 30 subscribers today — activate backup plan
> - Double Twitter posting (morning + evening)
> - Run "First 100 subscribers get founding member Pro access free" giveaway
> - Post Show HN if not done yet
> - DM 5–10 AI builder contacts directly

### Morning (9–11 AM PT)

**Stripe setup** (see `STRIPE_SETUP.md`):
- [ ] Create Stripe account (or log in to existing)
- [ ] Get test API keys from Stripe Dashboard → Developers → API keys
- [ ] Add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Vercel env vars
- [ ] Redeploy Vercel
- [ ] Test checkout flow with test card `4242 4242 4242 4242`
- [ ] Confirm success page renders correctly
- [ ] Confirm Stripe test transaction shows in dashboard

**Content to post**:
- [ ] Twitter: counterintuitive lesson from running an AI company — specific, not promotional
- [ ] Reply to any outstanding Reddit/HN comments from previous days

### Afternoon (12–5 PM PT)

**Stripe production setup**:
- [ ] Toggle to live mode in Stripe
- [ ] Get live API keys (`sk_live_...`, `pk_live_...`)
- [ ] Update Vercel env vars with live keys
- [ ] Register webhook: Stripe Dashboard → Developers → Webhooks → Add endpoint
  - URL: `https://thewebsite.app/api/webhook/stripe`
  - Events: `checkout.session.completed`, `charge.refunded`
- [ ] Copy webhook signing secret (`whsec_...`) → add `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Redeploy again
- [ ] Verify live mode purchase flow works (use a real card, refund after)

**Lead magnet check**:
- [ ] Verify `/starter-kit` page is live and email capture is working
- [ ] Check lead magnet download funnel end-to-end

### Evening

- [ ] Send sponsor outreach batch 2 (5 more companies: Sentry, Datadog, Linear, Cursor, Warp)
- [ ] Log subscriber count
- [ ] DM 3 AI YouTubers with collab angle (see `GROWTH_PLAYBOOK.md`)

### Decisions to make today:
- Is Stripe live mode working? If not: Lemon Squeezy is the 5-minute fallback. Do NOT delay launch over payment infrastructure.
- Are you on track for 55 subscribers? If not — which channel has been most responsive?

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 55 | |
| Stripe test payment working? | Yes | |
| Stripe live mode active? | Yes | |
| Webhook registered and tested? | Yes | |
| Sponsor emails sent (total) | 10 | |

---

## Day 5 — Thursday, March 19

**Theme**: Content acceleration. Second Reddit wave. Premium page push.
**Subscriber target**: 65

### Morning (9–11 AM PT)

**Content to post**:
- [ ] Post Twitter viral thread #2: "5-day build story" narrative arc (see `TWITTER_LAUNCH_THREADS.md`)
- [ ] Engage with all replies within 2 hours

**Infrastructure verification**:
- [ ] Full payment flow smoke test — verify Stripe live mode is still working after yesterday's setup
- [ ] Verify email welcome sequence triggers on new signup
- [ ] Check Vercel deployment is green (no build errors since env var changes)

### Afternoon (12–5 PM PT)

**Content to post**:
- [ ] Post to r/artificial: "We open-sourced our AI agent coordination architecture — here's the full breakdown"
- [ ] If blog posts are live: submit additional HN thread or comment in active AI agent threads

**Outreach**:
- [ ] Follow up on sponsor outreach batch 1 (sent March 17 — any replies?)
- [ ] Check if YouTube/newsletter collab prospects have responded
- [ ] Send guest post pitch to Towards Data Science and Better Programming
  - Pitch angle: "How I used multi-agent AI to build and launch a real product in 9 days"

**Premium page**:
- [ ] Confirm `/course/premium` page is in scope for Engineer or already built
- [ ] Create Stripe payment link for $67 founders pricing in Stripe Dashboard
  - Product: "AI Agent Builder Course — Pro (Founders Pricing)"
  - Price: $67 one-time
  - Success URL: `https://thewebsite.app/course/success`
- [ ] Test the payment link works

### Evening

- [ ] Respond to all Twitter, Reddit, HN comments from today
- [ ] Log subscriber count — assess if on track for 100 by March 23
- [ ] Prep "early bird ends Friday" countdown messaging

### Decisions to make today:
- Is the premium course page ready? If not, this needs to be live by March 21.
- Based on 5 days of data — which channel is converting best? Allocate Day 6–7 effort accordingly.

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 65 | |
| Stripe payment link for $67 created? | Yes | |
| `/course/premium` page live? | In progress | |
| Guest post pitches sent | 2 | |
| Top converting channel | — | |

---

## Day 6 — Friday, March 20

**Theme**: Urgency window opens. Founders pricing announcement. Final content push.
**Subscriber target**: 78

### Morning (9–11 AM PT)

**Content to post**:
- [ ] Twitter: "3 days from launch. Here's what I'm shipping." — tease premium tier with specific details
- [ ] Send Email 3 (Pro offer) to subscribers who signed up 7+ days ago
  - Subject: "Founders pricing: $67 → available until launch day"
  - Include: what's in Pro, why $67 is the floor, link to `/course/premium`

**Features to confirm**:
- [ ] `/course/premium` page is live with correct pricing ($67 founders, $97 standard)
- [ ] Both Stripe payment links working
- [ ] Test purchase on `/course/premium` end-to-end
- [ ] Unsubscribe flow working (test with test email)

### Afternoon (12–5 PM PT)

**Content to post**:
- [ ] Send "Launch is in 3 days" countdown email to full subscriber list
  - This is NOT the launch email — it's a teaser/hype email
  - Include: what's coming, why it's worth paying attention, link to free course
- [ ] Post on r/SideProject milestone update: "3 days to launch — here's where we are"

**Outreach**:
- [ ] Follow up with sponsor outreach batch 2 (sent March 18)
- [ ] Close first sponsor deal if any responded (get confirmation, add to `/sponsors` page)
- [ ] Check guest post pitch responses

### Evening

- [ ] Log subscriber count
- [ ] Prepare final Twitter content for Days 7–8 (have it written, not just planned)
- [ ] Begin drafting launch email (to be staged in Resend tomorrow)

### Decisions to make today:
- Are you at 78 subscribers? If under 65: activate backup plan — double Twitter posts, run giveaway, DM contacts.
- Is there a sponsor deal close? Prioritize closing — even $50 validates the sponsorship model.
- Do all payment flows work? If anything is broken, flag to Engineer now — 3 days left.

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 78 | |
| Pro offer email sent? | Yes | |
| Countdown email sent? | Yes | |
| Sponsor deals closed | — | |
| All payment flows working? | Yes | |

---

## Day 7 — Saturday, March 21

**Theme**: Pre-launch final review. All content ready. No surprises tomorrow.
**Subscriber target**: 88

### Morning (9–11 AM PT)

**Content to post**:
- [ ] Twitter: "2 days to launch. What we built, what changed, what's next." — build anticipation
- [ ] Send "48 hours to launch" email to all subscribers
  - Preview what's dropping: free course, Pro tier, full architecture docs
  - One CTA: invite them to invite one person before launch

### Full launch readiness audit — work through this completely today:

**Infrastructure**:
- [ ] Vercel deployment green (no build errors)
- [ ] All env vars confirmed set in production:
  - [ ] `RESEND_API_KEY`
  - [ ] `CRON_SECRET`
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `NEXTAUTH_URL=https://thewebsite.app`
- [ ] Email cron running: Vercel → Settings → Crons → confirm `/api/cron/nurture-emails`
- [ ] Analytics tracking confirmed (test pageview fires, signup conversion event fires)
- [ ] Sentry error monitoring active

**Product**:
- [ ] All 5 course modules accessible and rendering correctly
- [ ] `/course` overview page updated
- [ ] `/course/premium` live with $67 founders pricing
- [ ] `/starter-kit` live with email capture working
- [ ] `/sponsors` page live with stats
- [ ] `/pricing` page live
- [ ] Zero 404 errors (check every page linked in nav)
- [ ] Mobile view looks correct (check on phone)

**Content**:
- [ ] Blog post #1 live and indexed
- [ ] Blog post #2 live and indexed
- [ ] All internal links working

**Email & payments**:
- [ ] Test email signup → welcome email arrives in inbox (not spam)
- [ ] Test Stripe $67 checkout (use test card) → success page
- [ ] Test Stripe $97 checkout (use test card) → success page
- [ ] Launch email fully drafted and staged in Resend (not yet sent)
- [ ] Early bird email written ("founders pricing ends tonight — March 22")

**Marketing assets**:
- [ ] HN "Show HN" post drafted and ready (title + body + first comment)
- [ ] Twitter launch thread written and scheduled for 7:00 AM March 23
- [ ] Twitter backup posts ready (3 standalone tweets if threads underperform)
- [ ] Reddit posts for r/SideProject and r/ClaudeAI written

### Evening

- [ ] Cross-promote with newsletter partners (if any secured)
- [ ] Reply to all outstanding comments/DMs
- [ ] Log subscriber count
- [ ] Set alarms for launch day: 5:45 AM, 6:00 AM, 7:00 AM PT

### Decisions to make today:
- Is every item on the readiness audit checked? Any unchecked item needs a plan.
- Is the HN post written and polished? Get a second read on it tonight.

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 88 | |
| Full readiness audit complete? | Yes | |
| Launch email staged in Resend? | Yes | |
| HN post ready to submit? | Yes | |
| Twitter thread scheduled? | Yes | |

---

## Day 8 — Sunday, March 22 (Pre-Launch Eve)

**Theme**: Final countdown. Last subscriber push. Founders pricing urgency.
**Subscriber target**: 95+

### Morning (9–11 AM PT)

**Content to post**:
- [ ] Twitter: "Tomorrow is launch day. Here's exactly what you're getting." — full value summary, link to /course
- [ ] Send "founders pricing ends TONIGHT" email to all subscribers
  - Subject: "Last chance: $67 → price goes up tomorrow at midnight"
  - Body: what Pro includes, founders pricing rationale, direct Stripe link
  - Urgency: real (price does go up on March 23)
- [ ] One final Reddit comment in a thread where you've been active — mention launch is tomorrow

### Final infrastructure checks:
- [ ] Vercel deployment green
- [ ] All env vars set in production (verify in Vercel dashboard)
- [ ] Analytics firing on fresh browser window
- [ ] Email cron enabled
- [ ] Stripe live mode active — verify in Stripe Dashboard (no "TEST" banner)
- [ ] Webhook endpoint showing `200 OK` on recent deliveries (Stripe → Developers → Webhooks)

### Staging launch day assets:
- [ ] Stage the HN "Show HN" post — have it ready to submit at 7:00 AM Monday
  - Title: `Show HN: I had an AI CEO run my company for 9 days – here's the full ops breakdown`
  - URL: `thewebsite.app`
  - First comment: pre-written (see `LAUNCH_DAY_TIMELINE.md`)
- [ ] Confirm Twitter launch thread is scheduled for 7:00 AM Monday (or ready to post manually)
- [ ] Queue launch day emails in Resend:
  - Launch announcement → staged, ready to send at 9:00 AM Monday
  - Midday "still time for founders pricing" → draft ready

### Evening

- [ ] Final subscriber count check — log below
- [ ] If under 90: activate final push — DM active community members, reply with site link in any hot AI threads
- [ ] Do NOT send the launch email tonight — it goes at 9:00 AM Monday
- [ ] Reply to all outstanding DMs and comments
- [ ] Rest — launch day requires 12+ hours of sustained engagement

### Decisions to make today:
- If under 80 subscribers: frame launch as "exclusive founding cohort" — scarcity, not failure.
- Is Stripe definitely in live mode? Check the Stripe Dashboard header — should show no orange "TEST" banner.
- Are all emergency contact methods ready? (Lemon Squeezy backup URL, Resend manual send process, Vercel rollback procedure)

### Daily Metrics Log
| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 95+ | |
| "Founders pricing ends tonight" email sent? | Yes | |
| Stripe confirmed in live mode? | Yes | |
| All launch assets staged? | Yes | |
| Alarms set for 5:45/6:00/7:00 AM? | Yes | |

---

## Day 9 — Monday, March 23 (LAUNCH DAY)

**Goal**: Make noise, drive signups, convert first paying customers, prove concept.

> Full hour-by-hour plan in `LAUNCH_DAY_TIMELINE.md`. This is the condensed version.

### Pre-Launch (5:45–6:59 AM PT)

- [ ] 5:45 AM: Wake up. Coffee. Check Vercel deployment status.
- [ ] 6:00 AM: Full pre-launch verification (see `LAUNCH_DAY_TIMELINE.md` — 6:00 AM block)
  - [ ] Homepage, `/course`, `/pricing`, `/starter-kit`, `/course/premium` all load
  - [ ] Mobile view correct
  - [ ] Test Stripe payment with test card — then switch to live
  - [ ] Send test email from Resend to verify inbox delivery
  - [ ] Confirm analytics dashboard is recording
  - [ ] Verify launch email is staged and ready

### Launch Ignition (7:00–9:30 AM PT)

**In order, within 30 minutes:**
1. [ ] 7:00 AM: Submit HN "Show HN" — `Show HN: I had an AI CEO run my company for 9 days – here's the full ops breakdown`
2. [ ] 7:02 AM: Post first comment on HN thread (pre-written — see `LAUNCH_DAY_TIMELINE.md`)
3. [ ] 7:05 AM: Post tweet: "We're live on Hacker News. [HN link] — upvote and share if you've followed this build."
4. [ ] 7:10 AM: Pin launch tweet to profile
5. [ ] 8:00 AM: Post r/SideProject — "I had an AI CEO run a real business for 9 days. We launched today."
6. [ ] 8:10 AM: Post r/ClaudeAI — "I've been running Claude as an autonomous CEO for 9 days. Here's the architecture breakdown."
7. [ ] 9:00 AM: Send launch announcement email to full subscriber list (via Resend dashboard)
8. [ ] 9:05 AM: Confirm email delivery is processing (Resend dashboard → check delivery rate)

### Active Engagement (10:00 AM – 3:00 PM PT)

- [ ] Respond to HN comments within 15 minutes — this is the highest-leverage window
- [ ] Respond to Reddit comments within 30 minutes
- [ ] Monitor Twitter replies — like, respond, retweet with comment
- [ ] 10:30 AM: Post early metrics tweet: "1.5 hours in. [X] signups. [Y] HN comments. [Z] sales."
- [ ] 12:00 PM: Post to r/LangChain (tech angle) and r/entrepreneur (business angle) — see `LAUNCH_DAY_TIMELINE.md`
- [ ] 12:15 PM: Midday Twitter update with numbers
- [ ] Check Stripe dashboard every 30 minutes — first sale is a public celebration moment

**KPI check at noon:**
- HN rank: aim for front page (top 30)
- New subscribers since 9 AM: target 15+
- Stripe: any sales?

### Secondary Channels (1:00 – 3:00 PM PT)

- [ ] LinkedIn: professional angle on AI agent business launch (if account exists)
- [ ] Submit blog posts to dev.to, Hashnode, Medium (canonical URL reposts)
- [ ] Send sponsor outreach follow-ups

### Metrics Snapshot (3:00 PM PT)

Record and post on Twitter:

| Metric | Target | Actual |
|--------|--------|--------|
| New subscribers (since 9 AM) | 20+ | |
| Total subscribers | 120 | |
| Stripe revenue | $1+ | |
| HN peak rank | Top 30 | |
| HN comments | 15+ | |
| Email open rate | 40%+ | |
| Top traffic source | — | |
| Site unique visitors | 500+ | |

**Decision tree** (based on 3 PM snapshot):
- HN top 30, active → stay focused on HN, don't fragment
- Twitter driving signups → post one more tweet with social proof numbers
- Reddit engaged → spend 20 min replying to all threads
- Email converting → send "last hours for founders pricing" to openers-who-didn't-click

### Evening Push (4:00 – 9:00 PM PT)

- [ ] 4:00 PM: Post Twitter evening update: "End of afternoon. [X] subscribers. Real numbers."
- [ ] 5:00–7:00 PM: Sustained engagement on all active threads
- [ ] If 100+ subscribers: celebrate publicly on Twitter — social proof accelerates signups
- [ ] 7:00 PM: Send final email: "Founders pricing ($67) ends at midnight." — urgency, last call
- [ ] 7:05 PM: Post Twitter: "Midnight tonight is the last chance for founders pricing."
- [ ] 9:00 PM: Log final day-1 metrics
- [ ] 9:05 PM: Respond to remaining comments and DMs
- [ ] 11:00 PM: Send "thank you" tweet: "Day 1 done. Final numbers: [X] subscribers, [Y] sales, [Z] revenue."
- [ ] 11:30 PM: Draft Day 2 follow-up plan based on what worked

---

## Metrics Tracking Table (Update Daily)

| Date | Day | Subscribers | New Today | Top Source | Revenue | Notes |
|------|-----|-------------|-----------|------------|---------|-------|
| Mar 15 | 1 | | | | $0 | |
| Mar 16 | 2 | | | | $0 | HN day |
| Mar 17 | 3 | | | | $0 | |
| Mar 18 | 4 | | | | $0 | Stripe setup |
| Mar 19 | 5 | | | | $0 | |
| Mar 20 | 6 | | | | $0 | Founders pricing opens |
| Mar 21 | 7 | | | | $0 | |
| Mar 22 | 8 | | | | $0 | Pre-launch eve |
| Mar 23 | 9 (LAUNCH) | | | | — | |

---

## Contingency Plans

### If < 80 subscribers by March 22
- Launch anyway — frame as "exclusive founding cohort" (scarcity, not failure)
- Offer: "First 80 subscribers get permanent Pro access when it launches" (reward early movers)
- Push HN harder: if Show HN was submitted, comment in active AI threads instead

### If Stripe isn't working on launch day
1. Switch to Lemon Squeezy — 5-minute setup, same checkout flow
2. Or: collect emails manually for founding member list and charge later
3. Never cancel launch over payment infrastructure — announce first, fix payment second
4. Tweet: "Checkout is having issues — DM me to get on the founding list at $67"

### If email send fails on March 23
- Send manually in batches via Resend dashboard (50 at a time)
- Tweet "email is on its way — check back in 30 minutes"
- Proceed with everything else — don't let one channel block the launch

### If HN gets no traction (< 10 upvotes by 10 AM)
- Don't chase HN — shift all energy to Reddit and Twitter
- Save second HN attempt for the premium course launch (week 2)
- Post "Ask HN: Who's building with autonomous AI agents?" instead

### If site goes down
- Check Vercel dashboard immediately
- Rollback to previous deployment if needed (Deployments → three-dot menu → Promote to Production)
- Tweet: "We're briefly down — back up shortly. Subscribe at [email] to get notified."

---

## Quick Reference: Key Links and Credentials

| Item | Location |
|------|----------|
| Resend setup guide | `RESEND_SETUP.md` |
| Stripe setup guide | `STRIPE_SETUP.md` |
| Launch day hour-by-hour | `LAUNCH_DAY_TIMELINE.md` |
| Twitter content library | `TWITTER_LAUNCH_THREADS.md` |
| Reddit outreach scripts | `reddit_outreach_strategy.md` |
| HN post template | `LAUNCH_CHECKLIST.md` (bottom) |
| Community engagement | `COMMUNITY_STRATEGY.md` |
| Contingency plan details | `CONTINGENCY_PLAN.md` |
| Full launch checklist | `LAUNCH_CHECKLIST.md` |
| Subscriber outreach email | `SUBSCRIBER_OUTREACH_EMAIL.md` |
| Growth playbook | `GROWTH_PLAYBOOK.md` |

---

*Created: March 14, 2026. Update daily. This document supersedes all other day-by-day planning documents.*
