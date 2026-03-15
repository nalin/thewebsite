# Master FAQ — thewebsite.app

**Last updated**: March 14, 2026
**Version**: 1.0
**Sources**: All documentation compiled from 106 completed tasks

> This is the single searchable reference for technical, launch, operational, and growth questions. Use Ctrl+F / Cmd+F to jump to your question.

---

## Table of Contents

1. [Technical FAQ](#technical-faq)
   - [Resend (Email)](#resend-email)
   - [Stripe (Payments)](#stripe-payments)
   - [Vercel Deployment](#vercel-deployment)
   - [Manual Deployment](#manual-deployment)
2. [Launch FAQ](#launch-faq)
   - [Timeline & Schedule](#timeline--schedule)
   - [Content — What to Post Where](#content--what-to-post-where)
   - [Metrics to Track](#metrics-to-track)
   - [Launch Day Incident Response](#launch-day-incident-response)
3. [Operational FAQ](#operational-faq)
   - [Responding to Student Questions](#responding-to-student-questions)
   - [Collecting Testimonials](#collecting-testimonials)
   - [Handling Refunds](#handling-refunds)
   - [Updating Course Content](#updating-course-content)
4. [Growth FAQ](#growth-faq)
   - [Marketing Channel Priorities](#marketing-channel-priorities)
   - [When to Start Paid Ads](#when-to-start-paid-ads)
   - [Working with Affiliates](#working-with-affiliates)
   - [When to Raise Prices](#when-to-raise-prices)

---

## Technical FAQ

### Resend (Email)

**Q: How do I set up Resend from scratch?**

Five steps:

1. **Create account** — go to resend.com, sign up, verify your email.
2. **Add sending domain** — go to Domains > Add Domain > enter `updates.thewebsite.app`. Resend will show DNS records (SPF TXT, DKIM TXT, MX). Add all three to your DNS provider exactly as shown.
3. **Get an API key** — go to API Keys > Create API Key. Name it `thewebsite-production`, set permission to "Sending access", restrict to domain `updates.thewebsite.app`. Copy the key (starts with `re_`) immediately — shown only once.
4. **Add env vars to Vercel** — add `RESEND_API_KEY` to all environments (Production, Preview, Development). Also add `CRON_SECRET` to Production only.
5. **Redeploy** — environment variable changes require a redeploy. Go to Deployments > three-dot menu > Redeploy.

Full guide: `RESEND_SETUP.md`

**Q: How do I verify Resend is working?**

Hit the nurture-emails endpoint manually:
```bash
curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=YOUR_CRON_SECRET"
```
Expected response if no subscribers need emails: `{"success": true, "day3": {"sent":0}, "day7": {"sent":0}}`

To send a real test email to yourself:
```bash
RESEND_API_KEY=re_your_key_here npx tsx scripts/send-test-email.ts
```

**Q: How do I verify Resend cron jobs are registered?**

In Vercel, go to Settings > Crons. You should see `/api/cron/nurture-emails` with schedule `0 10 * * *` (daily at 10:00 UTC). If it's missing, confirm `vercel.json` is committed and the deployment is current.

**Q: Emails are going to spam. What do I do?**

1. Confirm the Resend domain shows "Verified" status (green).
2. Check that all three DNS records are present: SPF (`TXT` on `updates.thewebsite.app`), DKIM (`TXT` on `resend._domainkey.updates.thewebsite.app`), and MX record.
3. Wait 24 hours — new domains sometimes need time to build sender reputation.

**Q: What do common Resend error messages mean?**

| Error | Cause | Fix |
|-------|-------|-----|
| `RESEND_API_KEY is not set` | Env var missing or stale deployment | Add var in Vercel, then redeploy |
| `{"error":"Unauthorized"}` | Wrong CRON_SECRET or env var not deployed | Check CRON_SECRET value and redeploy |
| Domain stuck at "Pending" | DNS hasn't propagated | Wait up to 48h; verify with `dig TXT updates.thewebsite.app` |
| Resend API 403 | API key restricted to wrong domain | Recreate key with correct domain restriction |

---

### Stripe (Payments)

**Q: How do I set up Stripe from scratch?**

Seven steps:

1. **Create account** — go to stripe.com, sign up, verify email. Use "Individual" for solo project.
2. **Get test keys** — in Stripe Dashboard, toggle Test mode ON. Go to Developers > API keys. Copy the Publishable key (`pk_test_...`) and Secret key (`sk_test_...`).
3. **Add keys to Vercel** — add `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` to Production, Preview, and Development.
4. **Configure webhook** — go to Developers > Webhooks > Add endpoint. Set URL to `https://thewebsite.app/api/webhook/stripe`. Select events: `checkout.session.completed` and `charge.refunded`. Copy the signing secret (`whsec_...`).
5. **Add webhook secret** — add `STRIPE_WEBHOOK_SECRET` to Vercel production env vars.
6. **Redeploy** — required after adding env vars.
7. **Test payment** — use card `4242 4242 4242 4242`, any future expiry, any CVC/ZIP.

Full guide: `STRIPE_SETUP.md`

**Q: How do I switch from test keys to live keys?**

1. Toggle Test mode OFF in Stripe Dashboard.
2. Copy live keys (`pk_live_...` and `sk_live_...`).
3. Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel.
4. Create a **new** webhook endpoint in Stripe live mode (test and live webhooks have separate secrets).
5. Update `STRIPE_WEBHOOK_SECRET` with the new live signing secret.
6. Redeploy.

**Q: What do common Stripe error messages mean?**

| Error | Cause | Fix |
|-------|-------|-----|
| `STRIPE_SECRET_KEY environment variable is required` | Env var missing or stale | Add in Vercel, then redeploy |
| Webhook 500 "Webhook secret not configured" | `STRIPE_WEBHOOK_SECRET` not set | Add to Vercel production env vars |
| Webhook 400 "Invalid signature" | Using CLI secret in production (or vice versa) | Each environment needs its own signing secret |
| Checkout redirect fails | `NEXTAUTH_URL` not set correctly | Set `NEXTAUTH_URL=https://thewebsite.app` in Vercel |
| Payment succeeds but shows "pending" | Webhook not being received | Check Stripe > Developers > Webhooks > Recent deliveries |

**Q: How do I test the payment flow?**

Test cards:
- **Success**: `4242 4242 4242 4242` (any future expiry, any CVC/ZIP)
- **Decline (generic)**: `4000 0000 0000 0002`
- **Decline (insufficient funds)**: `4000 0000 0000 9995`
- **3D Secure required**: `4000 0025 0000 3155`

After a successful test checkout, confirm: (1) Stripe Dashboard shows the charge, (2) database `purchases` table has `status = "completed"` and a `stripePaymentIntentId`.

**Q: Summary of required Stripe environment variables**

| Variable | Source |
|----------|--------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard > Developers > API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard > Webhooks > endpoint > Signing secret |

---

### Vercel Deployment

**Q: Vercel deployment is failing. What do I do first?**

1. **Check build logs** — go to Vercel Dashboard > Deployments > click failing deployment > read the build log. The error is almost always there.
2. **Check if it builds locally** — run `npm run build`. If it fails locally, the issue is in the code, not Vercel.
3. **Check for missing env vars** — compare required vars in `.env.example` against Vercel > Settings > Environment Variables.
4. **Redeploy** — after any env var change, go to Deployments > three-dot menu > Redeploy. Vercel does not auto-apply env var changes.

Full guide: `CONTINGENCY_PLAN.md`

**Q: How do I fix Vercel deployment failures?**

Decision tree:

```
Is the build passing locally (npm run build)?
|
+-- NO  --> Fix the code error. Common causes: missing env var, TypeScript error,
|           import that doesn't resolve, or a package that needs to be installed.
|
+-- YES --> Is it a Vercel-specific config issue?
            |
            +-- Check: missing env vars in Vercel, wrong Node version,
            |   build command or output directory misconfigured
            |
            +-- If still failing: deploy to Netlify as a test (30-60 min)
                If Netlify also fails: the issue is in the app, not the platform
```

**Q: I need to deploy to an alternate platform because Vercel is broken. What are my options?**

**Netlify** (recommended, 30-60 minutes):
1. Go to app.netlify.com > New site > Import from Git.
2. Set build command: `npm run build`, publish directory: `.next`.
3. Add `@netlify/plugin-nextjs` plugin in `netlify.toml`.
4. Copy all environment variables from Vercel to Netlify.
5. Update Stripe webhook endpoint to new URL.
6. Update DNS to point to Netlify's load balancer.
7. Note: Cron jobs need Netlify Scheduled Functions or an external service (cron-job.org).

**Railway** (45-90 minutes):
1. Go to railway.app > New Project > Deploy from GitHub.
2. Add all environment variables in Railway dashboard.
3. Add custom domain and update DNS.
4. Cron jobs available natively in Railway dashboard.

**Self-hosted VPS** (2-4 hours, last resort):
- Provision Hetzner CX22 or DigitalOcean Droplet (Ubuntu 24.04).
- Install Node.js 20, pnpm, nginx, certbot.
- Run `npm run build && npm run start`, configure nginx as reverse proxy, issue SSL cert via certbot.
- Use PM2 for process management; system crontab for cron jobs.

**Q: When should I delay launch vs. deploy to an alternate platform?**

Try alternate platform first. The cost of trying Netlify is 1-2 hours. The cost of a 7-day delay is far higher.

Only delay if:
- Email signup is broken (cannot collect subscribers)
- Course Module 1 is broken (cannot deliver the core promise)
- Both Vercel AND Netlify builds fail with the same error

Decision deadline: March 21, 9am PT.

**Q: What features are non-negotiable on launch day vs. what can wait?**

Must work at launch:
- Homepage (`/`) — first impression, captures traffic
- Email signup form — primary launch goal
- Course Module 1 (`/course/module-1`) — proof of value
- `/starter-kit` — lead magnet
- Email delivery (welcome email on signup)

Can be broken at launch (workarounds exist):
- `/pricing` and Stripe checkout — share Stripe payment link directly via email
- Analytics events — add manually later
- Referral system — disable temporarily, re-enable within 48 hours
- Modules 2-5 — tease as "unlocking over next 5 days"
- `/sponsors` page — remove from nav temporarily
- Blog posts — link to Medium/dev.to reposts if Next.js routing is broken

---

### Manual Deployment

**Q: How do I manually trigger a Vercel deployment?**

Option A (dashboard): Vercel Dashboard > Deployments > three-dot menu on latest > Redeploy.

Option B (CLI):
```bash
npx vercel --prod
```

**Q: How do I manually trigger cron job emails?**

```bash
# Trigger nurture emails (Day 3 + Day 7 sequences)
curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=YOUR_CRON_SECRET"

# Trigger daily email blast to all subscribers
curl "https://thewebsite.app/api/cron/daily-email?manual_trigger=YOUR_CRON_SECRET"
```

Only trigger the daily email if you intend to send an email blast to all subscribers.

**Q: How do I manually send emails if the cron fails on launch day?**

1. Log into resend.com > Logs > find the failed send.
2. For one-off sends, use the Resend dashboard's test send feature or the API directly.
3. For batch sends, use `scripts/send-test-email.ts` as a template.
4. Log the issue and have the engineer patch the cron same day.
5. Don't let a technical failure stop the launch narrative — send manually and communicate transparently.

**Q: How do I run the local development environment?**

```bash
cp .env.example .env.local
# Fill in RESEND_API_KEY, STRIPE_SECRET_KEY, DATABASE_URL, etc.
pnpm dev
```

For local Stripe webhook testing, run in a separate terminal:
```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
# Copy the printed whsec_... secret to .env.local as STRIPE_WEBHOOK_SECRET
```

---

## Launch FAQ

### Timeline & Schedule

**Q: What is the full launch timeline?**

| Date | Milestone |
|------|-----------|
| March 14 | Infrastructure, content, email work begins; first Twitter posts |
| March 15 | Re-engagement email to existing 12 subscribers |
| March 16 | Twitter viral thread + HN "Show HN" submission (Monday = peak traffic) |
| March 17 | Blog post #2 published; sponsor cold outreach begins (5 companies) |
| March 18 | Checkpoint: if under 30 subscribers, activate backup plan |
| March 19 | Twitter viral thread #2; sponsor follow-up; Reddit second wave |
| March 20 | "Founders pricing ends tonight" urgency email; premium course page live; Stripe payment links created |
| March 21 | Final infrastructure check; Decision deadline for deployment fallback |
| March 22 | Pre-launch final checks; "founders pricing ends TONIGHT" email to full list |
| **March 23, 9am PT** | **Launch Day** |
| March 30 | Fallback launch date (only if March 23 is blocked by a core product issue) |

**Q: What are the daily subscriber targets pre-launch?**

| Day | Date | Target |
|-----|------|--------|
| 1 | March 14 | 15 |
| 2 | March 15 | 22 |
| 3 | March 16 | 35 (HN spike expected) |
| 4 | March 17 | 45 |
| 5 | March 18 | 55 |
| 6 | March 19 | 65 |
| 7 | March 20 | 78 |
| 8 | March 21 | 88 |
| 9 | March 22 | 95+ |

**Q: What are the pre-launch backup plans?**

Under 30 subscribers by March 18:
- Double Twitter posting (morning + evening)
- Post Show HN if not done
- Run "First 100 subscribers get founding member Pro access free" giveaway

Under 80 subscribers by March 22:
- Launch anyway — frame as "exclusive founding cohort"
- Offer: "First 80 subscribers get permanent Pro access when it launches"
- Push HN harder or post "Ask HN: Who's building with autonomous AI agents?"

Under 5 HN upvotes by 10am on March 23:
- Don't chase HN — shift energy to Reddit and Twitter
- Save second HN submission for the premium course launch (30 days later)

---

### Content — What to Post Where

**Q: What content goes on which platform, and when?**

| Platform | What to post | Timing |
|----------|-------------|--------|
| Twitter | Daily build-in-public updates, viral threads, honest metrics | 9am PT weekdays, 11am PT weekends |
| Hacker News | "Show HN" post; blog post links | Monday morning for peak visibility |
| r/ClaudeAI | "I've been running Claude as autonomous CEO — here's what I learned" | Tues-Thurs 8-11am PT; max 1x/week |
| r/LocalLLaMA | "Multi-agent architecture for a real autonomous business" | Tues-Thurs 8-11am PT; max 1x/week |
| r/artificial | "We open-sourced our AI agent coordination architecture" | 1x/2 weeks |
| Email (full list) | Launch announcement, founders pricing deadline, course updates | See email schedule below |

**Q: What is the Twitter content priority order?**

1. Thread: "9 lessons from 30 AI workers" — highest retweet potential
2. Thread: "5-day build story" — narrative arc with emotional hooks
3. Single post: Day 1 "What this actually is" — sets context for new followers
4. Rotate remaining content from `CONTENT_CALENDAR_30_DAYS.md`

Primary hashtags: `#AIAgents`, `#BuildInPublic`, `#IndieHacker`
Secondary: `#ClaudeAI`, `#LLMOps`, `#DevTools`

**Q: What is the email send schedule leading up to launch?**

| Send Date | Audience | Purpose |
|-----------|----------|---------|
| March 15 | Existing 12 subscribers | Re-engagement / personal note from AI CEO |
| March 20 | Subscribers 7+ days old | Pro offer (founders pricing: $67) |
| March 20 | Full list | Countdown: "Launch is in 3 days" |
| March 22 | Full list | "Founders pricing ends TONIGHT" |
| **March 23, 9am PT** | **Full list** | **Launch announcement** |
| March 23, 12pm | Opened but didn't click | "Still time to get founders pricing" |
| March 23, 7pm | Full list | "Founders pricing ($67) ends at midnight" |

**Q: What is the exact HN "Show HN" post to submit?**

**Title**: `Show HN: I had an AI CEO run my company for 9 days - here's the full ops breakdown`

**Body**:
> I built a system where Claude acts as the CEO of a real company — not a chatbot or demo. It writes strategy docs, spawns engineering workers, manages a content calendar, grows an email list, and makes actual business decisions. Everything is public.
>
> 9 days ago, we had 12 subscribers and $0 revenue. We launched today.
>
> The course (free) documents exactly how this works — architecture, real prompts, and the decisions the AI made along the way: thewebsite.app/course
>
> A few things that surprised us:
> - Context switching is the killer in multi-agent systems. Separating CEO from Engineer roles improved quality on both sides dramatically.
> - Observability has to come first. "Silence is the default" from agents is a critical design failure.
> - Task spec quality determines output quality. The bottleneck is never model intelligence — it's spec clarity.
>
> Happy to answer any questions about the architecture, what worked, or what broke.

Submit at 9am PT on Monday March 23. Respond to every comment within 15 minutes for the first 2 hours.

---

### Metrics to Track

**Q: What are the launch day KPIs to check at noon?**

- HN rank: aim for front page (top 30) — if not there by 11am, share in more communities
- New subscribers since 9am: target 15+ in the first 3 hours
- Stripe: any sales at all? Even 1 validates the model

**Q: What are the full pre-launch, launch day, and 7-day targets?**

| Metric | Pre-Launch (March 22) | Launch Day | 7-Day |
|--------|----------------------|------------|-------|
| Subscribers | 100 | 120 | 200 |
| Stripe revenue | $0 | Any sale | $500 |
| HN upvotes | — | 50+ | — |
| Site traffic (uniques) | — | 500 | 2,000 |
| Email open rate | — | 40%+ | — |
| Course starts | — | 30+ | 100 |

**Q: What ongoing metrics should I track weekly post-launch?**

| Metric | Weekly target | Monthly target |
|--------|--------------|----------------|
| Support response time (avg) | < 24 hours | < 18 hours |
| Module 1 completion rate (7-day cohort) | > 40% | > 50% |
| Student showcase entries | 2/week | 8/month |
| Testimonials collected | 1/week | 4/month |
| FAQ entries updated | 1/week | 4/month |
| Twitter @mention response rate | 100% | 100% |

---

### Launch Day Incident Response

**Q: What if something breaks on launch day?**

| System | Where to check | What to do |
|--------|----------------|------------|
| Vercel down | vercel.com/dashboard > Deployments | Check build logs, redeploy, then try Netlify |
| Stripe broken | dashboard.stripe.com | Use Lemon Squeezy as instant fallback (5-minute setup), or collect emails and charge later. Never cancel launch over payment infrastructure. |
| Email cron fails | resend.com > Logs | Send manually via Resend dashboard; log issue for engineer to patch same day |
| DNS issues | Your registrar | Update A/CNAME records to new platform |
| Database error | Check `DATABASE_URL` env var | Ensure it points to production DB, not local |

**Q: What is the launch day hour-by-hour Twitter posting schedule?**

| Time (PT) | Action |
|-----------|--------|
| 9am | Submit HN, publish Twitter launch thread, send launch email to full list |
| 9:30am | Share HN link in Slack/Discord communities; DM 5-10 contacts |
| 12pm | Midday update tweet: "3 hours in. [X] new subscribers. [Y] sales." |
| 3pm | Log metrics snapshot; double down on whatever is working |
| Evening | Post evening update: "End of day 1. [X] subscribers. Real numbers." |
| 7pm | Send "founders pricing ($67) ends at midnight" email + tweet |
| 11pm | "Day 1 is done. Final numbers: [X] subscribers, [Y] sales, [Z] revenue." |

---

## Operational FAQ

### Responding to Student Questions

**Q: How do I respond to a module-specific question by email?**

```
Hi [Name],

Great question — this comes up a lot in Module [X].

Short answer: [direct answer in 1-2 sentences]

The full breakdown is in [Module X, Section Y — link]. The key thing to understand
is [explain the concept simply].

If that doesn't answer it, reply here and I'll dig into your specific case.

[Signature]
```

**Q: A student says they're stuck. How do I help?**

```
Hi [Name],

Let's debug this together.

Can you share:
1. Which module/section you're on
2. What you tried
3. The exact error or behavior you're seeing

Usually when this happens it's one of three things: [list 2-3 common causes].
But I want to look at your specific situation before guessing.

[Signature]
```

**Q: What are the response time targets for each issue type?**

| Issue type | Target response time |
|------------|---------------------|
| Payment/billing | 4 hours |
| Technical bug (acknowledgment) | 1 hour |
| Technical bug (resolution) | 24 hours |
| Course question | 24 hours |
| General feedback | 48 hours |
| Press/partnership | 48 hours |

**Q: What is the escalation path for complex issues?**

- **Level 1 — Self-serve**: FAQ at `/faq`, course notes, Discord search
- **Level 2 — Community**: Discord `#course-questions`, Twitter DM, email reply within 24h
- **Level 3 — Growth Strategist**: Complex course questions, gaps in content, frustrated students
- **Level 4 — Engineer**: Site outages, payment failures, data issues — escalate within 1 hour of identifying
- **Level 5 — CEO**: Legal/IP concerns, media inquiries, partnership conversations

**Q: What should I do when the same question comes up multiple times?**

If answered twice, it's a candidate for the FAQ. If answered 3+ times in a single week, add it to the FAQ immediately. Review every Friday. Version the FAQ with "Last updated: [date]".

**Q: What are the most common course questions and their answers?**

| Question | Answer |
|----------|--------|
| Is this course right for me if I'm not a developer? | Requires basic coding ability (Python or JavaScript). If you've done a beginner course or can follow a tutorial, you can do this. We don't teach programming from scratch. |
| How long does it take to complete? | Each module takes 1-3 hours plus build time. Most students finish in 2-4 weeks. No deadline — access doesn't expire. |
| What AI model does the course use? | Primarily Claude (Anthropic). Concepts apply to any frontier LLM but code examples are Claude-specific. |
| Do I need to pay for API usage separately? | Yes. Typical API costs for completing the course are $5-15. The course includes patterns to keep costs low. |
| What's the difference between free and Pro? | Free covers Modules 1-5 (full architecture, real examples). Pro adds advanced modules, private Discord, live Q&A, and code review. See `/pricing`. |
| Can I use this for commercial projects? | Yes — everything you build is yours. Course content is for personal use only (don't resell or reproduce it). |
| I found a bug or broken link. What do I do? | Email support@thewebsite.app or post in `#feedback` on Discord. Course bugs fixed within 24 hours. |

---

### Collecting Testimonials

**Q: How do I systematically collect testimonials?**

Four touchpoints — don't rely on students volunteering them:

1. **Post-Module 1 email** (7-14 days after signup): "What was most useful about Module 1? One sentence is great." — low friction, high volume.
2. **Course completion survey**: 5-question form, last question: "Can we use your response as a testimonial?" with opt-in checkbox.
3. **30-day check-in email**: "What have you built or changed since starting? We'd love to share your story."
4. **Pro upgrade thank-you email**: "What made you decide to upgrade? 1-2 sentences would mean a lot."

**Q: What makes a high-quality testimonial and where does each tier go?**

| Tier | What it includes | Where it goes |
|------|-----------------|---------------|
| Tier 1 (best) | Specific result, before/after, real name + photo | Homepage hero section |
| Tier 2 | Specific module or concept they found valuable | `/course` page |
| Tier 3 | General positive sentiment | FAQ or pricing page |

**Q: How do I turn a student project into a testimonial?**

1. DM or email: "Would you be OK with me sharing this story? I'd love to give you a shoutout."
2. Write a tweet or short post about their project — tag them, explain what they built and how.
3. Ask for 2-3 sentences for the testimonials section. Pre-draft it for them to approve/edit — lower friction = higher conversion.
4. Add to `/course` page or testimonials section on homepage.
5. Feature in weekly email as "Student spotlight: [name] built [X]."

**Q: Where do I track testimonials over time?**

Maintain `TESTIMONIALS.md` with all approved quotes, source, date, and tier. Review monthly — rotate in new testimonials, retire generic ones. For Tier 1 testimonials, draft the copy for the student to approve (they edit if needed).

---

### Handling Refunds

**Q: What is the refund policy?**

Full refund within 30 days, no questions asked. Student emails `support@thewebsite.app` with their order ID.

**Q: How do I issue a refund in Stripe?**

1. Go to Stripe Dashboard > Payments.
2. Find the charge.
3. Click Refund > select Full Refund > Confirm.

The `charge.refunded` webhook event updates the database record automatically.

**Q: What is the right approach to refund requests?**

Three rules:
1. **Never get defensive** — complaints are free product research.
2. **Respond faster to complaints than to praise** — slow responses feel dismissive.
3. **Refund without friction** — a $67-$97 refund that leaves a good impression is worth 10x a bad review.

Refund protocol:
1. Acknowledge first: "I hear you, and I'm sorry this wasn't what you expected."
2. Ask one clarifying question if needed (don't interrogate).
3. Offer resolution: refund, module re-take, or direct 1:1 call for serious complaints.
4. Follow up if you fixed what they complained about — tell them.

---

### Updating Course Content

**Q: How do I update course content?**

Course content is in the `app/course/` directory. Each module is a Next.js page. Edit the relevant file, commit to `main`, and push. Vercel auto-deploys on push to main.

For content bugs (broken links, typos): fix within 24 hours of the report. Email the student who reported it to close the loop — this builds goodwill.

**Q: When should I add new modules?**

Pro members get all future modules included as they ship. Free students keep Modules 1-5 permanently. Don't add Modules 6+ to the free tier.

Announce new modules via:
1. Email to Pro members (subject: "New module unlocked: [Module Name]")
2. Discord `#announcements` (once Discord is live at 50+ students)
3. Twitter post

**Q: When should I launch Discord?**

- **Phase 1 (0-50 students)**: Use email + Twitter as primary async support. Respond publicly on Twitter so responses build credibility.
- **Phase 2 (50+ students)**: Open Discord with a founding-members-only invite. Frame as exclusive, not a public support forum.
- **Phase 3 (200+ students)**: Open Discord fully with a public invite link.

A quiet Discord is worse than no Discord. Don't launch it empty.

**Q: How do I maintain the public FAQ on the site?**

Update every Friday based on the week's support volume:
1. Any question answered 3+ times in a week gets added.
2. Any question answered via email that isn't in the FAQ gets logged.
3. After course updates or pricing changes, flag and update outdated entries.
4. Version with "Last updated: [date]" at the top of the FAQ page.

---

## Growth FAQ

### Marketing Channel Priorities

**Q: Which channels should I focus on first?**

Ranked by expected subscriber yield relative to effort:

1. **Lead magnet at `/starter-kit`** (20-35 subscribers) — tangible, downloadable asset dramatically improves email capture conversion vs. "sign up for the course"
2. **Blog posts with SEO + social sharing** (15-25 subscribers) — long-form content that ranks, gets shared in dev communities, and earns organic subscribers over time
3. **Reddit value-first posts** (15-25 subscribers) — r/ClaudeAI and r/LocalLLaMA have exactly the right audience
4. **Twitter engagement campaign** (10-20 subscribers) — authentic build-in-public from an actual AI system is novel and earns shares
5. **Re-engagement email to existing subscribers** (5-10 via referrals) — warm leads with highest LTV

**Q: Which subreddits should I post in and how often?**

| Subreddit | Audience | Max frequency |
|-----------|----------|---------------|
| r/ClaudeAI | Direct — Claude users | 1x/week |
| r/LocalLLaMA | Technical builders | 1x/week |
| r/artificial | Broader AI interest | 1x/2 weeks |
| r/SideProject | Builder/indie audience | On milestones only |
| r/learnmachinelearning | Students | On new content drops |

Always participate (comment on 3-5 threads) before posting. Lead with the insight, put the course link at the end — never at the top. Post Tuesday-Thursday, 8-11am PT. Never submit the same post to multiple subreddits on the same day.

**Q: Which Twitter accounts and communities should I engage with?**

Engage in replies to active AI builders: `@swyx`, `@karpathy`, `@levelsio`, and anyone tweeting about Claude, AI agents, or autonomous systems. Reply with genuinely useful insight — no promotional links unless directly relevant.

Daily Twitter protocol:
- 9-10am PT: Post original content, reply to replies from previous posts
- 12-1pm PT: Search and reply to 3-5 tweets about AI agents with valuable insight
- 5-7pm PT: Check @mentions, reply to every mention within 24 hours

**Q: Which sponsorship targets should I pursue first?**

Target AI infrastructure and developer tool companies:
- Infrastructure: Modal, Replicate, Together AI, Vercel, Railway
- Observability: Sentry, Datadog
- Dev productivity: Linear, Cursor, Warp

Starting rates: $200/placement at 12 subscribers (quality pitch), $500 at 100 subscribers, $2,000 at 1,000 subscribers. Build the `/sponsors` page first. Send 10 cold emails by March 22; follow up 3-5 days later.

---

### When to Start Paid Ads

**Q: When should I start running paid ads?**

Don't run paid ads until you have:
1. **Proven organic conversion** — at least a 2% email-to-paid conversion rate from organic traffic
2. **A working email funnel** — welcome email, Day 3 nurture, Day 7 pro offer all tested and converting
3. **Positive unit economics** — know what a subscriber is worth before paying to acquire them

The 0-100 subscriber phase should be entirely organic. Paid ads make sense when organic channels plateau and you have data on subscriber LTV.

**Q: What are the fastest paths to first revenue right now?**

| Path | Time to first $ | Revenue at 100 subscribers |
|------|----------------|---------------------------|
| Sponsorships | 2 weeks | $1,000-$2,000/month |
| Premium course ($67-$97) | 3 weeks | $300-$1,000 |
| Paid consulting ($500-$2,000/engagement) | 3 weeks | $2,000-$6,000/month |

Recommended sequence: lead with sponsorships (fastest path to first dollar at current audience size), then layer in the premium course as audience grows.

---

### Working with Affiliates

**Q: When should I launch an affiliate program?**

Not before 100+ paying students. You need:
- Proven product: students completing courses and getting real results
- Testimonials for affiliates to use in their promotion
- Clear commission structure (typically 20-30% for education products)
- Infrastructure to track referrals (already in the codebase)

**Q: How do referral links currently work?**

The referral system generates unique referral links per subscriber, tracked via the database. Attribution is captured on signup via `utm_source` / referrer stored in the DB. The system can be disabled at launch if it's broken and re-enabled within 48 hours.

**Q: Which affiliate types should I target first?**

In order of quality:
1. **AI YouTubers** with builder audiences (3+ contacts in pre-launch outreach)
2. **Complementary newsletters** — cross-promotions with 3-5 AI/developer newsletters
3. **Guest posts** on Towards Data Science, Better Programming
4. **Course directories** — after 20+ testimonials are collected

Start with personal relationship-based outreach (direct DM, specific value proposition) before setting up a public affiliate program.

---

### When to Raise Prices

**Q: What are the current pricing tiers and when do they change?**

| Tier | Price | Availability |
|------|-------|-------------|
| Founders pricing | $67 | First 50 buyers — expires midnight March 22 |
| Standard pricing | $97 | From March 23 onward |
| Future rate | $147+ | After 200+ students and strong testimonials |

**Q: When should I raise prices?**

Raise prices when:
1. **First 50 buyers filled** — automatically move from $67 to $97 at midnight March 22.
2. **20+ strong testimonials collected** — social proof justifies a higher price point; move from $97 to $147.
3. **Students ask about waitlists** — if people are asking about enrollment when the page is open, price is too low.
4. **New premium modules added** — each advanced module added to Pro justifies a $10-20 price increase.

Conversion rate signal: if over 6%, price is likely too low. If under 1%, check landing page copy before touching price — copy is usually the issue, not price.

**Q: Should I offer discounts?**

Only in controlled circumstances:
- **Founding member pricing** — the current $67 offer (time-limited, communicated weeks in advance)
- **Failed payment retry** — offer 10% off to someone who abandoned checkout
- **Scholarship** — 1-2 per month for developers from underserved markets (goodwill, minimal revenue impact)

Avoid: site-wide discount codes, Black Friday sales in year one, or any culture where buyers learn to wait for a deal. It devalues the brand.

**Q: What is the revenue path to $80k/month?**

| Monthly Revenue | How to get there |
|-----------------|-----------------|
| $0 to $500 | First sponsor deal ($200-500) + 5-10 Pro sales |
| $500 to $2,000 | 100 subscribers, 2 sponsor deals, 15-20 Pro sales/month |
| $2,000 to $8,000 | 500+ subscribers, 4 sponsors at $500+, consulting pipeline |
| $8,000 to $80,000 | 1,000+ subscribers, $2,000/sponsor x 4 placements/month, premium course + consulting |

Sponsorship + premium course is the recommended path. Consulting doesn't scale past 4-6 clients/month without quality degradation.

---

## Quick Reference

### Required environment variables

| Variable | Used for |
|----------|---------|
| `RESEND_API_KEY` | Email sending via Resend |
| `CRON_SECRET` | Securing cron job endpoints |
| `STRIPE_SECRET_KEY` | Stripe payment processing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe (client-side, future use) |
| `STRIPE_WEBHOOK_SECRET` | Verifying Stripe webhook events |
| `NEXTAUTH_URL` | Base URL for Stripe success/cancel redirects |
| `DATABASE_URL` | Database connection |

### Key dashboards

| System | Dashboard URL |
|--------|--------------|
| Vercel deployment | vercel.com/dashboard |
| Stripe payments | dashboard.stripe.com |
| Resend email | resend.com |
| DNS | Your registrar (Cloudflare / Namecheap / Vercel Domains) |

### Support contact

Student support email: `support@thewebsite.app`

---

*Update this document every Friday based on the week's support volume. For corrections or additions, edit and commit to main. Last updated: March 14, 2026.*
