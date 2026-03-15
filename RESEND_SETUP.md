# Resend Email Setup Guide

> **TL;DR:** The API key is already provisioned. You only need to add it to Vercel and redeploy — ~2 minutes of work.

---

## What's Already Done vs What Needs Manual Action

| Item | Status | Notes |
|------|--------|-------|
| Email cron configured in `vercel.json` | **Done** | Runs daily at 10:00 UTC (`0 10 * * *`) |
| Nurture email code (`/api/cron/nurture-emails`) | **Done** | Day 3 + Day 7 follow-up emails |
| Daily digest code (`/api/cron/daily-email`) | **Done** | Full waitlist email blast |
| Welcome email on signup | **Done** | Fires immediately on `/api/waitlist` |
| Resend API key provisioned | **Done** | See key below |
| `RESEND_API_KEY` added to Vercel | **Manual** | Follow Step 1 below |
| `CRON_SECRET` added to Vercel | **Manual** | Follow Step 2 below |
| Redeploy on Vercel | **Manual** | Follow Step 3 below |

Once the env vars are added and the project is redeployed, **the email system is fully operational.**

---

## Step 1 — Add RESEND_API_KEY to Vercel

1. Go to **https://vercel.com/dashboard**
2. Select the **thewebsite** project
3. Go to **Settings** > **Environment Variables**
4. Click **Add New**
   - **Key:** `RESEND_API_KEY`
   - **Value:** `re_PcQSEyYW_PxhWQBhuRg22XcoPX2hfYRqM`
   - **Environments:** Check all three: Production, Preview, Development
5. Click **Save**

---

## Step 2 — Add CRON_SECRET to Vercel

This secret secures the cron endpoints so only Vercel can trigger them.

1. Still in **Settings** > **Environment Variables**, click **Add New**
   - **Key:** `CRON_SECRET`
   - **Value:** `2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc=`
   - **Environments:** Production only (uncheck Preview and Development)
2. Click **Save**

> If you prefer to generate your own secret: run `openssl rand -base64 32` in a terminal and use that output.

---

## Step 3 — Redeploy

Environment variable changes require a redeploy to take effect:

1. Go to the **Deployments** tab in your Vercel project
2. Click the three-dot menu on the latest deployment
3. Select **Redeploy**
4. Wait ~2 minutes for it to complete

---

## Step 4 — Verify the Cron Job is Registered

1. In Vercel, go to **Settings** > **Crons**
2. You should see:
   - Path: `/api/cron/nurture-emails`
   - Schedule: `0 10 * * *` (daily at 10:00 UTC)
3. If it's not there, check that `vercel.json` is committed and the deployment is current

The `vercel.json` cron configuration is already in the repo:

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

---

## Setup Checklist

- [x] Email cron configured in `vercel.json`
- [x] Nurture email routes coded and deployed
- [x] Resend API key provisioned
- [ ] `RESEND_API_KEY` added to Vercel (all environments)
- [ ] `CRON_SECRET` added to Vercel (production only)
- [ ] Project redeployed after adding env vars
- [ ] Cron job visible in Vercel Settings > Crons

---

## Testing After Setup

### Check the nurture-emails endpoint

```bash
# Replace YOUR_CRON_SECRET with the value from Step 2
curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=YOUR_CRON_SECRET"
```

Expected response (if no subscribers need emails yet):
```json
{
  "success": true,
  "timestamp": "2026-03-15T...",
  "day3": { "sent": 0, "failed": 0, "total": 0 },
  "day7": { "sent": 0, "failed": 0, "total": 0 }
}
```

### Common errors

| Error | Cause | Fix |
|-------|-------|-----|
| `{"error":"RESEND_API_KEY is not set"}` | Env var missing or stale deployment | Check env var and redeploy |
| `{"error":"Unauthorized"}` | Wrong `CRON_SECRET` or not deployed yet | Check env var value and redeploy |
| Emails going to spam | Domain not verified in Resend | Verify `updates.thewebsite.app` domain in Resend dashboard |

---

## Domain Verification (if needed)

Emails send from `The AI CEO <updates@updates.thewebsite.app>`. If the domain is not yet verified in Resend:

1. Go to **https://resend.com/domains**
2. Click **Add Domain** and enter `updates.thewebsite.app`
3. Add the DNS records Resend provides (SPF, DKIM, MX) at your DNS provider
4. Click **Verify** — status should turn green within 1–5 minutes (up to 48h for propagation)

---

## Architecture Reference

```
New subscriber signs up
  └── /api/waitlist POST
        └── addEmailSubscriber()       # creates DB record
        └── sendWelcomeEmail()         # sends immediately via Resend

Vercel cron (daily 10:00 UTC)
  └── /api/cron/nurture-emails
        └── getSubscribersNeedingDay3() # subscribed 3+ days ago, no day3 email yet
        └── sendDay3Email()
        └── getSubscribersNeedingDay7() # subscribed 7+ days ago, no day7 email yet
        └── sendDay7Email()
```

From address: `The AI CEO <updates@updates.thewebsite.app>`
Unsubscribe: handled by `/api/unsubscribe` route
Preferences: handled by `/api/preferences/[token]` route
