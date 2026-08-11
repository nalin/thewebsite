# Daily Email System Setup

The daily email digest sends a story-format update to waitlist subscribers.

**The automated schedule is currently OFF** — `vercel.json` ships `"crons": []`,
so nothing sends on a timer. Sends are manual-trigger only, and the standing
rule (OPERATIONS.md) is that no mass email goes out without Nalin's explicit
per-send approval. The route itself enforces a second gate: it refuses to send
unless that run's copy is supplied via env vars (below).

## What It Does

When the endpoint is triggered:

- Rejects unauthorized requests (`Authorization: Bearer ${CRON_SECRET}`,
  fail-closed if `CRON_SECRET` is unset — `lib/cron-auth.ts`)
- Refuses to send unless per-run digest copy is supplied via
  `DIGEST_STORY_HOOK` and `DIGEST_KEY_INSIGHT` (returns `409` and mails
  nothing — see `resolveDigestCopy()` in the route; issue #154)
- Queries the Turso `waitlist` table for subscriber emails
- Checks for new blog posts published in the last 24 hours
  (`getNewBlogPosts()` — driven by the blog registry's `publishAt`, so
  scheduled posts merged early don't leak)
- Sends each subscriber a daily update email including:
  - The supplied story hook and key insight
  - The new blog post (if any)
  - Waitlist count and a link to /activity (the live public-numbers page;
    /metrics and /tasks are just redirects to it)
  - A per-recipient unsubscribe link
- Skips recipients whose email preferences have the digest off or who have
  unsubscribed (`lib/email-preferences.ts`)
- Includes idempotency checks to prevent duplicate sends on the same day

## Files

1. **lib/email.ts** - Resend integration and email template
2. **lib/accomplishments.ts** - `getNewBlogPosts()`: blog-post detection only.
   (The other digest inputs — git commits, ROADMAP.md updates, and the manual
   accomplishments list — were retired in the #193 series and #199.)
3. **lib/email-preferences.ts** - Per-recipient digest/unsubscribe preferences
4. **lib/cron-auth.ts** - Shared cron authorization check
5. **app/api/cron/daily-email/route.ts** - The trigger endpoint
6. **vercel.json** - Vercel Cron configuration (currently `"crons": []`)

## Environment Variables Required

Add these to your Vercel project settings:

```bash
RESEND_API_KEY=re_your-resend-api-key
CRON_SECRET=your-random-secret-for-cron-jobs
NEXT_PUBLIC_BASE_URL=https://thewebsite.app
```

Per-run (required for any send to actually go out):

```bash
DIGEST_STORY_HOOK="Today's one-line story hook"
DIGEST_KEY_INSIGHT="Today's key insight"
```

Without both of these, the route no-ops with a `409` — by design, so a stray
trigger can never mail stale copy to the list.

### Getting a Resend API Key

1. Sign up at https://resend.com
2. Verify your sending domain (thewebsite.app)
3. Create an API key in the dashboard
4. Add it to Vercel environment variables

### Setting CRON_SECRET

Generate a random secret for securing the cron endpoint:

```bash
openssl rand -base64 32
```

Add this to Vercel environment variables.

## Vercel Cron Configuration

The schedule is deliberately disabled. `vercel.json` currently reads:

```json
{
  "crons": []
}
```

Re-enabling the daily schedule is an owner decision (mass email). If approved,
the entry would look like:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-email",
      "schedule": "0 17 * * *"
    }
  ]
}
```

(`0 17 * * *` UTC = 9am PT. Vercel cron schedules run in UTC.)

## Testing Locally

You can test the email endpoint locally:

```bash
curl -X GET http://localhost:3000/api/cron/daily-email \
  -H "Authorization: Bearer your-cron-secret"
```

Without `DIGEST_STORY_HOOK`/`DIGEST_KEY_INSIGHT` set you'll get the `409`
refusal — that's the expected result and confirms the copy gate works.

## Deployment

1. Push changes to your repository
2. Vercel will automatically deploy
3. Check Vercel Logs to verify endpoint behavior (no cron will fire while
   `"crons"` is empty)

## Monitoring

- Check Vercel Logs for execution (`[CRON]`-prefixed lines)
- A completed send returns JSON like:
  ```json
  {
    "success": true,
    "message": "Daily emails sent to 12 subscribers",
    "totalSubscribers": 12,
    "successCount": 12,
    "errorCount": 0,
    "storyFormat": true,
    "timestamp": "2026-08-11T17:00:00.000Z",
    "durationMs": 6500
  }
  ```
- A copy-gated run returns `409` with `success: false, skipped: true, sent: 0`.

## Rate Limits

- Emails are sent individually with a 500ms delay between sends (Resend's
  2 emails/second limit)
- Check your Resend plan limits for daily send capacity

## Idempotency

The route tracks the last send date in instance memory and won't send twice on
the same day if triggered repeatedly. Two caveats: the marker resets on
redeploy or instance recycle (it is not durable), and `?force_resend=true`
bypasses it explicitly. The copy gate above is the real backstop against
accidental repeat sends.

## Email From Address

Emails are sent from `EMAIL_FROM` in `lib/email-sender.ts` — currently
`The Website <updates@updates.thewebsite.app>`.

Make sure this domain is verified in your Resend account.
