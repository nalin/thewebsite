# Blog Release Schedule

## Currently Published (live on thewebsite.app/blog)

| Slug | Title | Published Date |
|------|-------|---------------|
| `how-i-was-made` | How I Was Made: An AI CEO's First Post | March 5, 2026 |
| `first-week-as-ai-ceo` | First Week as an AI CEO | March 7, 2026 |
| `why-we-switched-to-agentix` | Why We Switched to Agentix for Worker Management | March 14, 2026 |

## Staggered Release Schedule

One post every 3-4 days, starting on launch day (March 23).

To publish a post: set `published: false` → remove the flag (or set `published: true`) in `lib/blog.ts` and update the `date`/`displayDate` fields to the release date.

| Release Date | Slug | Title | Notes |
|-------------|------|-------|-------|
| **March 23** (launch day) | `monetization-strategy-decision` | How We Chose Our Monetization Strategy | Pairs with Pro tier announcement |
| **March 27** | `how-i-built-an-ai-agent-business` | How I Built an AI Agent Business from Scratch | Deep architecture post, good for engaged readers |
| **March 31** | `5-ai-agents-you-can-build` | 5 AI Agents You Can Build This Weekend | Practical/viral, great for weekend traffic |
| **April 4** | `how-to-build-your-first-ai-agent` | How to Build Your First AI Agent | SEO anchor post, broadest audience |

---

## Email Calendar

### Automated Emails (live in production via Vercel Cron)

| System | File | Schedule | Status |
|--------|------|----------|--------|
| Nurture sequence (Day 3 + Day 7) | `app/api/cron/nurture-emails/route.ts` | Daily at 10:00 UTC | **Active** — runs every day via `vercel.json` cron |
| Daily digest | `app/api/cron/daily-email/route.ts` | Manual trigger only | **Not scheduled** — no cron entry in `vercel.json` |

### Launch Week Emails (templates ready, need manual send)

Templates are in `lib/launch-emails.ts`. No cron endpoint — these must be triggered manually or via a one-off API call.

| Email | Subject | Send Date | Status |
|-------|---------|-----------|--------|
| Pre-launch | "48 hours until launch" | **March 21** (Saturday) | Template ready, not sent |
| Launch day | "We're live." | **March 23, 9am PT** | Template ready, not sent |
| Post-launch | "Thank you + what's next" | **March 24** (Tuesday) | Template ready, not sent |
| Engagement | "How's your first agent coming along?" | **March 26** (Thursday) | Template ready, not sent |

### Nurture Sequence (triggered by sign-up, fully automated)

| Email | Subject | Trigger | Status |
|-------|---------|---------|--------|
| Welcome | "You're in. Here's your free AI agent course." | Immediately on sign-up | **Active** |
| Day 3 | "The two modules that actually move the needle" | 3 days after sign-up | **Active** (daily cron) |
| Day 7 | "One week in — want to go deeper?" | 7 days after sign-up | **Active** (daily cron) |

---

## Email Setup Status

- **Resend integration**: Code complete in `lib/email.ts` and `lib/launch-emails.ts`
- **Domain**: Sending from `The AI CEO <updates@updates.thewebsite.app>`
- **Cron**: Only `nurture-emails` is scheduled in `vercel.json` (`0 10 * * *` = 10am UTC daily)
- **API key**: Must be set as `RESEND_API_KEY` in Vercel environment variables
- **Daily digest**: NOT on a cron schedule — must be triggered manually or a cron entry added

## Action Items for Nalin

1. **March 21**: Manually trigger `sendPreLaunchEmail()` from `lib/launch-emails.ts` for all waitlist subscribers
2. **March 23**: Manually trigger `sendLaunchDayEmail()` at 9am PT
3. **March 23**: Set `published: false` → remove flag on `monetization-strategy-decision` in `lib/blog.ts`, update date to `2026-03-23`
4. **March 24**: Manually trigger `sendPostLaunchEmail()` with real launch metrics
5. **March 26**: Manually trigger `sendEngagementEmail()`
6. **March 27, 31, April 4**: Publish remaining blog posts on schedule (update `lib/blog.ts`)
