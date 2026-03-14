# Resend Email Setup Guide

> Complete this in ~5 minutes. The email system is fully built and waiting — you just need the API key and domain DNS records.

---

## What You're Setting Up

The site has two email systems already coded:

| System | Route | Schedule | Purpose |
|--------|-------|----------|---------|
| **Nurture sequence** | `/api/cron/nurture-emails` | Daily at 10:00 UTC | Sends Day 3 + Day 7 follow-up emails to new subscribers |
| **Daily digest** | `/api/cron/daily-email` | (manual trigger) | Sends daily build-in-public update to full waitlist |

Emails are sent from: `The AI CEO <updates@updates.thewebsite.app>`

You need to verify the `updates.thewebsite.app` subdomain in Resend and get an API key.

---

## Step 1 — Create a Resend Account

1. Go to **https://resend.com**
2. Click **Get Started** (top right)
3. Sign up with your email (nalin.mittal@gmail.com) or GitHub
4. Verify your email address if prompted

---

## Step 2 — Add and Verify the Sending Domain

The code sends from `updates@updates.thewebsite.app`, so you need to verify the subdomain `updates.thewebsite.app`.

### In the Resend dashboard:

1. Go to **Domains** in the left sidebar (or **https://resend.com/domains**)
2. Click **Add Domain**
3. Enter: `updates.thewebsite.app`
4. Click **Add**

Resend will show you DNS records to add. They look like this (your actual values will differ):

```
Type    Name                              Value
TXT     updates.thewebsite.app            "v=spf1 include:amazonses.com ~all"
TXT     resend._domainkey.updates.thewebsite.app   <DKIM key>
MX      updates.thewebsite.app            feedback-smtp.us-east-1.amazonses.com
```

### Add DNS records in your DNS provider (Vercel Domains / Cloudflare / Namecheap):

1. Log into wherever `thewebsite.app` DNS is managed
2. Add each record Resend shows you **exactly as displayed**
   - For the DKIM record, the `Name` field should be just the subdomain part relative to your zone (e.g. `resend._domainkey.updates`)
3. Click **Verify** in Resend after adding records

> DNS propagation usually takes 1-5 minutes but can take up to 48 hours. Resend auto-checks every few minutes.

**Verification check:** In Resend > Domains, the status badge should turn green and say **Verified**.

---

## Step 3 — Get Your API Key

1. In the Resend dashboard, go to **API Keys** (left sidebar) or **https://resend.com/api-keys**
2. Click **Create API Key**
3. Name it: `thewebsite-production`
4. Permission: **Sending access** (not full access)
5. Domain: Select `updates.thewebsite.app` (restrict to this domain)
6. Click **Add**
7. **Copy the key immediately** — it starts with `re_` and is only shown once

---

## Step 4 — Add Environment Variables to Vercel

### RESEND_API_KEY

1. Go to **https://vercel.com/dashboard**
2. Select the **thewebsite** project
3. Go to **Settings** > **Environment Variables**
4. Click **Add New**
   - **Key:** `RESEND_API_KEY`
   - **Value:** *(paste your key from Step 3)*
   - **Environments:** Check all three: Production, Preview, Development
5. Click **Save**

### CRON_SECRET

This secret secures the cron endpoints so only Vercel can trigger them.

1. Add another environment variable:
   - **Key:** `CRON_SECRET`
   - **Value:** `2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc=`
   - **Environments:** Production only (uncheck Preview and Development)
2. Click **Save**

> If you prefer to generate your own: run `openssl rand -base64 32` in a terminal and use that output.

### Trigger a Redeployment

Environment variable changes require a redeploy:

1. Go to **Deployments** tab in your Vercel project
2. Click the three-dot menu on the latest deployment
3. Select **Redeploy**
4. Wait for it to complete (~2 minutes)

---

## Step 5 — Verify the Cron Job is Registered

1. In Vercel, go to **Settings** > **Crons**
2. You should see one entry:
   - Path: `/api/cron/nurture-emails`
   - Schedule: `0 10 * * *` (daily at 10:00 UTC)
3. If it's not there, check that `vercel.json` is committed and the deployment is current

---

## Setup Checklist

- [ ] Resend account created
- [ ] Domain `updates.thewebsite.app` added in Resend
- [ ] DNS records added at your DNS provider (all 3 records: SPF, DKIM, MX)
- [ ] Domain status is **Verified** (green) in Resend dashboard
- [ ] API key created with name `thewebsite-production`, permission `Sending access`
- [ ] `RESEND_API_KEY` added to Vercel (all environments)
- [ ] `CRON_SECRET` added to Vercel (production only)
- [ ] Project redeployed after adding env vars
- [ ] Cron job visible in Vercel Settings > Crons

---

## Step 6 — Test That Emails Actually Send

### Test 1: Verify the API key is working

Hit the nurture-emails cron endpoint manually from your browser or terminal:

```bash
# Replace YOUR_CRON_SECRET with the value you set above
curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=YOUR_CRON_SECRET"
```

Expected response (if no subscribers need emails yet):
```json
{
  "success": true,
  "timestamp": "2026-03-14T...",
  "day3": { "sent": 0, "failed": 0, "total": 0 },
  "day7": { "sent": 0, "failed": 0, "total": 0 }
}
```

If you get `{"error":"Unauthorized"}` — the `CRON_SECRET` env var is not set correctly or the deployment hasn't picked it up yet.

If you get `{"error":"RESEND_API_KEY is not set"}` — the `RESEND_API_KEY` env var is missing or the deployment is stale.

### Test 2: Send a real test email to yourself

Run the test script from your local machine (with the API key set):

```bash
RESEND_API_KEY=re_your_key_here npx tsx scripts/send-test-email.ts
```

Check `nalin.mittal@gmail.com` — you should receive the daily update email within 30 seconds.

If the email arrives but lands in spam:
- Confirm the Resend domain shows **Verified** status
- Check that all three DNS records (SPF, DKIM, MX) are present and correct
- Wait 24 hours — new domains sometimes need time to build sender reputation

### Test 3: Trigger the daily email cron

```bash
curl "https://thewebsite.app/api/cron/daily-email?manual_trigger=YOUR_CRON_SECRET"
```

This sends a daily digest to all waitlist subscribers. Only run this if you want to send an email blast.

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `RESEND_API_KEY is not set` | Env var missing or stale deployment | Redeploy on Vercel |
| `{"error":"Unauthorized"}` | Wrong CRON_SECRET or env var not deployed | Check env var value and redeploy |
| Emails going to spam | Domain not fully verified / missing DNS records | Re-check all 3 DNS records in Resend |
| Domain stuck at "Pending" | DNS hasn't propagated yet | Wait up to 48h, or check records with `dig TXT updates.thewebsite.app` |
| Resend API 403 error | API key restricted to wrong domain | Recreate key with correct domain restriction |

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
