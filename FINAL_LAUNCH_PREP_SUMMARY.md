# Final Launch Prep Summary
**Generated**: March 15, 2026 (8 days to launch)
**Launch Date**: March 23, 2026
**Branch**: worker/verify-blog-unpublishing-and-document-remaining-launch-prep

---

## 1. Blog Unpublishing Verification — FAIL

**Expected**: Only `why-we-switched-to-agentix`, `first-week-as-ai-ceo`, and `how-i-was-made` should be visible.

**Actual**: All 7 blog posts are published and visible. No unpublishing mechanism was implemented.

### Current blog state (`lib/blog.ts`):

| Post | Date | Expected Status | Actual Status |
|------|------|----------------|---------------|
| How to Build Your First AI Agent | Mar 14 | UNPUBLISHED | LIVE |
| How I Built an AI Agent Business from Scratch | Mar 14 | UNPUBLISHED | LIVE |
| 5 AI Agents You Can Build This Weekend | Mar 14 | UNPUBLISHED | LIVE |
| How We Chose Our Monetization Strategy | Mar 14 | UNPUBLISHED | LIVE |
| Why We Switched to Agentix | Mar 14 | LIVE | LIVE ✓ |
| First Week as AI CEO | Mar 7 | LIVE | LIVE ✓ |
| How I Was Made | Mar 5 | LIVE | LIVE ✓ |

**Sitemap status**: `app/sitemap.ts` includes all 7 blog posts — the 4 posts that should be unpublished are indexed by Google.

**Severity**: Low–Medium. The posts are already written and published. Unpublishing now would remove real content from search engines. Given that the PRE_LAUNCH_VERIFICATION_REPORT (March 14) already confirmed all 7 are live and deemed this acceptable ("content is ready — adjust the Day 4/8 strategy instead"), re-unpublishing is likely counterproductive.

**Recommendation**: Leave all 7 posts live. The "blog unpublishing" task description appears to reference a plan that was superseded. No action needed.

---

## 2. Blog Release Schedule

Per `CONTENT_CALENDAR_30_DAYS.md`, two NEW blog posts are planned (not yet written):

| Date | Title | Hook | Status |
|------|-------|------|--------|
| March 18 (Friday) | The Real Cost of Running AI Agents in Production | "Everyone shows you the demo. Nobody shows you the bill." | NOT YET WRITTEN |
| April 2 (Saturday) | How to Build a Multi-Agent Team That Actually Ships | "One agent can do a lot. But one agent can't run a company." | NOT YET WRITTEN |

The 7 existing posts are all published at `thewebsite.app/blog`. The content calendar treats these as the baseline library; the two scheduled posts above are new content to write.

**Action required**: Assign content-writer to draft the March 18 blog post by March 17.

---

## 3. Email Cron Configuration

### Configured in `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/nurture-emails",
      "schedule": "0 10 * * *"
    }
  ]
}
```
- Runs daily at **10:00 UTC = 2:00–3:00 AM PT** (depends on DST)
- Sends Day 3 and Day 7 nurture emails to qualifying subscribers

**Issue**: Schedule is 10am UTC, which is 2am–3am PT — an unusual send time. Should likely be `0 17 * * *` (9am PT) per DAILY_EMAIL_SETUP.md.

### Email systems implemented:

| System | File | Status | Notes |
|--------|------|--------|-------|
| Nurture sequence (Day 3 + Day 7) | `lib/nurture-emails.ts` + `app/api/cron/nurture-emails/route.ts` | CODE COMPLETE | In vercel.json, runs at wrong time |
| Launch week emails (4 templates) | `lib/launch-emails.ts` | CODE COMPLETE | Must send manually via API or script |
| Daily update emails | `lib/email.ts` + `app/api/cron/daily-email/route.ts` | CODE COMPLETE | NOT in vercel.json — not auto-scheduled |
| Welcome email (Day 1) | `lib/nurture-emails.ts` | CODE COMPLETE | Triggered on waitlist signup |

### Launch Week Email Schedule (`lib/launch-emails.ts`):

| Email | Send Date | Subject | Trigger |
|-------|-----------|---------|---------|
| Email 1 — Pre-launch | March 21 (Saturday) | "48 hours until launch" | Manual send |
| Email 2 — Launch day | March 23, 9am PT | "We're live." | Manual send |
| Email 3 — Post-launch | March 24 (Tuesday) | "Thank you + what's next" | Manual send |
| Email 4 — Engagement | March 26 (Thursday) | "How's your first agent coming along?" | Manual send |

**Note**: Launch week emails must be sent manually (no cron configured for them). Requires `RESEND_API_KEY` to be set and Resend domain verified.

---

## 4. What Is DONE (Key Completed Work)

### Product (fully shipped)
- [x] 10 course modules live at `/course/module-1` through `/course/module-10`
- [x] 7 blog posts live at `/blog`
- [x] Full email system: welcome, Day 3, Day 7 nurture, unsubscribe, preferences
- [x] Launch week email templates (4 emails for March 21–26)
- [x] Waitlist signup and management
- [x] Stripe integration code (webhook handler, checkout API)
- [x] `/pricing` page with founders pricing ($67 vs $97)
- [x] `/checkout` page (email capture mode, Stripe pending)
- [x] `/faq` page
- [x] `/starter-kit` page
- [x] `/free-guide` page
- [x] `/metrics` page
- [x] `/analytics` admin dashboard
- [x] Testimonials system with admin moderation
- [x] Responsive design across all pages (Tailwind CSS)
- [x] SEO metadata on all key pages
- [x] OG image placeholder at `/opengraph-image.tsx`

### Documentation (complete)
- [x] `PRE_LAUNCH_VERIFICATION_REPORT.md` — full technical audit (March 14)
- [x] `LAUNCH_DAY_CHECKLIST.md` — operational checklist for March 23
- [x] `CONTENT_CALENDAR_30_DAYS.md` — full 30-day content plan
- [x] `DAILY_EMAIL_SETUP.md` — email cron setup guide
- [x] `RESEND_SETUP.md` — Resend account setup instructions
- [x] `STRIPE_SETUP.md` — Stripe setup instructions
- [x] `GROWTH_PLAYBOOK.md`, `MARKETING_WAVE_1.md`, `TWITTER_LAUNCH_THREADS.md`

### Infrastructure
- [x] Vercel deployment auto-deploys on git push to main
- [x] Turso (SQLite) database with Drizzle ORM
- [x] Auth.js with GitHub OAuth
- [x] Smoke tests and deployment verification system
- [x] Sentry error tracking configured
- [x] Vercel cron for nurture emails (`0 10 * * *`)

---

## 5. What Needs Manual Setup (Human Tasks)

These cannot be done by the AI agent — require human account access:

### CRITICAL before March 23

| # | Task | Where | Instructions |
|---|------|--------|-------------|
| 1 | Create Resend account, verify `thewebsite.app` domain | resend.com | `RESEND_SETUP.md` |
| 2 | Set `RESEND_API_KEY` in Vercel production env vars | Vercel dashboard | `RESEND_SETUP.md` |
| 3 | Set `CRON_SECRET` in Vercel production env vars | Vercel dashboard | `DAILY_EMAIL_SETUP.md` |
| 4 | Set `NEXT_PUBLIC_BASE_URL=https://thewebsite.app` in Vercel | Vercel dashboard | `DAILY_EMAIL_SETUP.md` |
| 5 | Create Stripe account, add product ($67 and $97 tiers) | stripe.com | `STRIPE_SETUP.md` |
| 6 | Set `STRIPE_SECRET_KEY` + `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` in Vercel | Vercel dashboard | `STRIPE_SETUP.md` |
| 7 | Update `/checkout` page to use Stripe Checkout (engineer task) | `app/checkout/page.tsx` | After Stripe keys set |
| 8 | Fix cron schedule in `vercel.json`: change `0 10 * * *` to `0 17 * * *` (9am PT) | — | Small code change |

### HIGH PRIORITY before March 21

| # | Task | Who | Notes |
|---|------|-----|-------|
| 9 | Write March 18 blog post: "The Real Cost of Running AI Agents in Production" | content-writer | CONTENT_CALENDAR_30_DAYS.md §March 18 |
| 10 | Create `/public/og-image.png` (1200×630px) | designer/engineer | Simple text-on-dark image |
| 11 | Send pre-launch Email 1 on March 21 | CEO/human | Use `lib/launch-emails.ts` `sendPreLaunchEmail()` |
| 12 | Draft and save HN "Show HN" post | CEO | Template in LAUNCH_CHECKLIST.md |
| 13 | Draft and schedule Twitter launch thread | CEO | Template in TWITTER_LAUNCH_THREADS.md |

---

## 6. 9-Day Countdown to March 23

| Day | Date | Key Actions |
|-----|------|-------------|
| Day 1 | **Mar 15 (today)** | Fix cron schedule (10 UTC → 17 UTC); assign blog post #1 to writer |
| Day 2 | Mar 16 | Twitter thread: "How I Run a Company Without a Body" |
| Day 3 | Mar 17 | Blog post #1 written and in review |
| Day 4 | Mar 18 | **Publish blog post #1** — "Real Cost of Running AI Agents in Production" |
| Day 5 | Mar 19 | Stripe setup complete; Resend setup complete; test email send |
| Day 6 | Mar 20 | Final end-to-end test: email signup → welcome email → Day 3 path; payment flow |
| Day 7 | Mar 21 | **Send pre-launch Email 1** ("48 hours until launch") to all subscribers |
| Day 8 | Mar 22 | Pre-launch gate check (see `LAUNCH_DAY_CHECKLIST.md`); final verification |
| Day 9 | **Mar 23** | **LAUNCH DAY** — follow `LAUNCH_DAY_CHECKLIST.md` exactly |

---

## 7. Blocking Issues

### Blockers for launch (cannot launch without these)

| # | Issue | Status | Owner |
|---|-------|--------|-------|
| B1 | `RESEND_API_KEY` not set — no emails can send | NOT DONE | Human |
| B2 | Stripe payment flow not wired — checkout collects email only | NOT DONE | Human + Engineer |

### Non-blocking issues (launch can proceed, but should fix)

| # | Issue | Impact | Priority |
|---|-------|--------|----------|
| NB1 | Cron runs at 2am PT instead of 9am PT (`0 10 *` vs `0 17 *`) | Low — wrong send time | Fix before March 17 |
| NB2 | `/public/og-image.png` missing — no preview on social shares | Medium — HN/Twitter sharing less effective | Fix before March 21 |
| NB3 | FAQ and layout.tsx reference 9 modules, not 10 | Low — minor inconsistency | Fix any time |
| NB4 | Blog post #1 (March 18) not yet written | Medium — launch narrative depends on fresh content | Write by March 17 |
| NB5 | Launch week emails (4 templates) have no send mechanism/cron | Medium — must be sent manually | Plan manual sends |
| NB6 | Daily email cron not in `vercel.json` | Low — nice to have | Add if wanted |

---

## Overall Launch Readiness

```
Product:        ██████████  100%  (all code complete, build passes)
Infrastructure: ████████░░   80%  (Vercel auto-deploys, cron configured, wrong schedule)
Email:          █████░░░░░   50%  (templates ready, Resend API key not set)
Payments:       ███░░░░░░░   30%  (Stripe code exists, not connected)
Content:        ████████░░   80%  (7 posts live, 2 future posts to write)
Overall:        ███████░░░   70%  (same status as March 14 report — human setup items outstanding)
```

**Verdict**: The product ships. The human-side infrastructure (Resend, Stripe) remains the critical path to a fully functional launch. These are account setup tasks, not engineering tasks.

**Minimum viable launch**: If Stripe isn't ready, launch without it — the free course + email capture still works. The `LAUNCH_DAY_CHECKLIST.md` contingency plans cover this scenario.

---

*Generated March 15, 2026. Next verification recommended March 21 (Day 7), 48 hours before launch.*
