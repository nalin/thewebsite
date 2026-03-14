# Launch Day Checklist — March 23, 2026

This is the operational checklist for launch day. Work through it in order. Do not skip items.

---

## Pre-Launch Gate Check (Complete by March 22 EOD)

Before launch day begins, confirm these are done. If any are red, resolve tonight.

- [ ] Stripe account live mode active — test payment completes successfully
- [ ] Resend domain `thewebsite.app` verified — test signup email arrives in inbox
- [ ] `/public/og-image.png` deployed — paste site URL into Twitter Card Validator
- [ ] `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `RESEND_API_KEY`, `CRON_SECRET` all set in Vercel production env vars
- [ ] Vercel deployment is green — no build errors on `main` branch
- [ ] HN "Show HN" post drafted and saved (see LAUNCH_CHECKLIST.md for template)
- [ ] Twitter launch thread written and ready to post/schedule

---

## 7:00 AM PT — Wake-Up Checks

- [ ] Check Vercel deployment status — must show green
- [ ] Load `thewebsite.app` in browser — confirm homepage renders
- [ ] Check subscriber count in `/admin` or metrics DB
- [ ] Confirm launch email is staged in Resend and ready to send at 9am

---

## 8:00 AM PT — Final System Tests

Run these manually, in order:

**Site availability**
- [ ] `/` loads correctly
- [ ] `/course` loads and all 10 modules are listed
- [ ] `/pricing` shows $67 founders / $97 standard
- [ ] `/checkout` loads — Stripe Checkout works (test a $1 charge if unsure, then void)
- [ ] `/faq` loads
- [ ] `/starter-kit` loads
- [ ] `/blog` loads with all 7 posts

**Forms**
- [ ] Homepage email signup: submit a test email → confirm 200 response and welcome email arrives
- [ ] `/starter-kit` email signup: submit → confirm 200 response
- [ ] Unsubscribe flow: submit the test email address from above → confirm it unsubscribes cleanly

**Payment**
- [ ] Go to `/checkout` → complete a Stripe test purchase → confirm `/course/success` renders
- [ ] Check Stripe dashboard — test payment shows up
- [ ] Switch Stripe to live mode if not already

**Analytics**
- [ ] Load homepage in incognito → check `/admin` analytics dashboard → confirm pageview registered
- [ ] Check that daily email cron is enabled in Vercel dashboard

---

## 9:00 AM PT — Launch Ignition

Execute in this exact order, within 15 minutes:

1. [ ] **HN**: Submit "Show HN: I had an AI CEO run my company for 9 days — here's the full ops breakdown" to Hacker News
   - Copy the exact title and body from `LAUNCH_CHECKLIST.md`
   - Do not re-word it. The title is optimized.

2. [ ] **Twitter**: Post the launch thread (or publish scheduled post if pre-scheduled)
   - Include the HN link once submitted

3. [ ] **Email**: Send launch announcement to full subscriber list via Resend
   - Subject: "The course is live. Here's what we built."
   - Include: `/course` link, HN link, `/pricing` link

4. [ ] **Reddit**: Post to r/ClaudeAI — "We launched. Here's the full story."
   - Link to the blog post, mention the free course

---

## 9:30 AM PT — Seeding

- [ ] Share HN link in any relevant Slack communities or Discord servers
- [ ] DM 5–10 AI builder contacts with personal note about launch (not mass blast — personal)
- [ ] Reply to the first HN and Twitter comments immediately (velocity matters for HN ranking)

---

## 10:00 AM – 12:00 PM PT — Active Engagement

- [ ] Monitor HN post — respond to every comment within 15 minutes
- [ ] Monitor Twitter thread — like and respond to replies
- [ ] Monitor Reddit thread — engage authentically, answer technical questions
- [ ] Watch Stripe dashboard for first sales
- [ ] Watch subscriber growth (refresh `/admin` or metrics page)

**KPI checkpoint at noon:**
- [ ] HN rank: Is the post in the top 30? If not, share in 3 more communities now
- [ ] New subscribers since 9am: Target 15+
- [ ] Stripe: Any sales? Even 1 validates the model

---

## 12:00 PM PT — Midday Update

- [ ] Post Twitter midday update: "3 hours in. [X] new subscribers. [Y] sales. Here's what's working."
- [ ] If HN thread still active, post an update comment with new data
- [ ] Send re-engagement email to anyone who opened launch email but didn't click through

---

## 1:00 PM – 3:00 PM PT — Secondary Channels

- [ ] Post on LinkedIn: professional angle — "We shipped an AI agent course. Built entirely by AI."
- [ ] Submit blog post to dev.to and Hashnode (canonical URL set — safe to cross-post)
- [ ] Follow up with any sponsor outreach emails sent pre-launch

---

## 3:00 PM PT — Afternoon Metrics Check

Record these numbers:

| Metric | Target | Actual |
|--------|--------|--------|
| Total subscribers | 120+ | |
| New subscribers since 9am | 20+ | |
| Stripe revenue | $1+ | |
| HN rank at peak | Top 30 | |
| HN comments | 10+ | |
| Top traffic source | | |

**Decision tree**:
- HN trending → stay focused on HN replies, don't fragment attention
- Twitter driving traffic → post an additional tweet with real-time social proof numbers
- Email converting → send "last hours for founders pricing" reminder early

---

## 4:00 PM – 7:00 PM PT — Sustained Engagement

- [ ] Post Twitter evening update: "End of Day 1, [X] hours in. Real numbers: [X] subscribers, [Y] sales."
- [ ] If at 100+ subscribers: post "We hit 100." tweet — this accelerates more signups via social proof
- [ ] Continue engaging all active threads
- [ ] Check if any YouTube / newsletter prospects replied to pre-launch outreach

---

## 7:00 PM PT — Founders Pricing Deadline Email

- [ ] Send final email to full list: "Founders pricing ($67) ends at midnight."
- [ ] Post final Twitter: "Midnight is the last chance for founders pricing ($67 → $97). Here's what's included."

---

## 9:00 PM PT — Wind-Down

- [ ] Respond to all remaining comments and DMs
- [ ] Review Stripe for any last-minute purchases
- [ ] Log final Day 1 metrics in table above

---

## 11:00 PM PT — Day Wrap

- [ ] Post "thank you" tweet: "Day 1 done. [X] subscribers, [Y] sales, [Z] revenue. Here's what surprised me."
- [ ] Write Day 2 plan: what to double down on based on what actually drove signups
- [ ] Switch founders pricing tier in Stripe if 50 seats filled

---

## Contingency Protocols

### Stripe is down or broken
1. Do NOT cancel or delay the launch
2. Announce anyway — course is free, Pro is coming
3. Switch to Lemon Squeezy (5-minute account setup)
4. Or: manually collect "founding member" emails and charge later
5. Post: "Payment system hiccup — email me directly at [address] to secure founders pricing"

### Resend / email fails
1. Send manually from the Resend dashboard if cron fails
2. Log the incident and patch same day
3. Do not let email failure stop the launch narrative

### HN gets < 5 upvotes by 10am
1. Don't chase HN — shift energy to Reddit and Twitter
2. Save a second HN submission for the Pro launch (30 days out)
3. Post "Ask HN: Who's building with autonomous AI agents?" as an alternative

### Site is down
1. Check Vercel dashboard immediately
2. Rollback to previous deployment if needed
3. Post on Twitter: "Brief technical issue — back in [X] minutes" — transparency builds trust
4. Do not go silent

---

## Key Links (bookmark these the night before)

- Site: thewebsite.app
- Vercel dashboard: vercel.com/dashboard
- Stripe dashboard: dashboard.stripe.com
- Resend dashboard: resend.com
- Analytics: thewebsite.app/admin
- HN: news.ycombinator.com/submit
- Twitter: twitter.com/compose

---

*This checklist is the operational companion to LAUNCH_CHECKLIST.md (strategic plan) and PRE_LAUNCH_VERIFICATION_REPORT.md (technical audit). Last updated March 14, 2026.*
