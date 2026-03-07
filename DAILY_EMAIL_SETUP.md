# Daily Email System Setup

The automated daily email system sends updates to all waitlist subscribers at 9am PT every day.

## What It Does

- Queries Turso database for all waitlist subscriber emails
- Fetches yesterday's accomplishments from git commits and ROADMAP.md
- Checks for new blog posts published in the last 24 hours
- Sends a daily update email including:
  - Yesterday's accomplishments
  - New blog posts (if any)
  - Links to /metrics and /tasks pages
- Includes idempotency checks to prevent duplicate sends

## Files Created

1. **lib/email.ts** - Resend integration and email template
2. **lib/accomplishments.ts** - Logic to fetch git commits, ROADMAP updates, and blog posts
3. **app/api/cron/daily-email/route.ts** - API endpoint for Vercel Cron
4. **vercel.json** - Vercel Cron configuration

## Environment Variables Required

Add these to your Vercel project settings:

```bash
RESEND_API_KEY=re_your-resend-api-key
CRON_SECRET=your-random-secret-for-cron-jobs
NEXT_PUBLIC_BASE_URL=https://thewebsite.app
```

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

The `vercel.json` file configures the cron job:

```json
{
  "crons": [
    {
      "path": "/api/cron/daily-email",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule**: `0 9 * * *` = Every day at 9:00 AM (in the timezone configured in Vercel, default UTC)

To change to 9am PT (UTC-8), adjust Vercel's timezone settings or use: `0 17 * * *` (9am PT = 5pm UTC)

## Testing Locally

You can test the email endpoint locally:

```bash
curl -X GET http://localhost:3000/api/cron/daily-email \
  -H "Authorization: Bearer your-cron-secret"
```

## Deployment

1. Push changes to your repository
2. Vercel will automatically deploy
3. The cron job will be activated automatically
4. Check Vercel Logs to verify the cron job is running

## Monitoring

- Check Vercel Logs for cron job execution
- The endpoint returns JSON with send statistics:
  ```json
  {
    "success": true,
    "totalSubscribers": 12,
    "successCount": 12,
    "errorCount": 0,
    "accomplishments": 5,
    "newBlogPosts": 1
  }
  ```

## Rate Limits

- Emails are sent in batches of 50 to respect Resend rate limits
- 1 second delay between batches
- Check your Resend plan limits for daily send capacity

## Idempotency

The system tracks the last send date and won't send duplicate emails on the same day, even if the cron job is triggered multiple times.

## Email From Address

Emails are sent from: `The Website <updates@thewebsite.app>`

Make sure to verify this domain in your Resend account.

## Next Steps

1. Set up Resend account and verify domain
2. Add environment variables to Vercel
3. Deploy to production
4. Monitor first send at 9am PT
5. Consider adding unsubscribe functionality
