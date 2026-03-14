# Quick Setup Guide

Get email and payments running in ~10 minutes total.

---

## Resend (Email) — 5 minutes

### 1. Create account

Go to [resend.com/signup](https://resend.com/signup) and sign up.

### 2. Add and verify your domain

1. In the Resend dashboard, go to **Domains** → **Add Domain**
2. Enter `thewebsite.app`
3. Add the DNS records shown (MX, TXT, DKIM) to your domain registrar
4. Click **Verify** — DNS propagation can take a few minutes

### 3. Get your API key

1. Go to **API Keys** → **Create API Key**
2. Give it a name (e.g. `thewebsite-production`)
3. Set permission to **Sending access**
4. Copy the key — you won't see it again

### 4. Add environment variables to Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | `re_xxxxxxxxxxxx` (your key from step 3) |

### 5. Generate and add CRON_SECRET

```bash
openssl rand -base64 32
```

Add the output to Vercel:

| Variable | Value |
|----------|-------|
| `CRON_SECRET` | `<output from above>` |

### 6. Test

Send a test email from the Resend dashboard (**Emails** → **Send Test Email**) using your verified domain.

### 7. Verify

Check **Vercel** → **Functions** logs after triggering an email flow to confirm delivery with no errors.

---

## Stripe (Payments) — 5 minutes

### 1. Create account

Go to [stripe.com/register](https://stripe.com/register) and sign up.

### 2. Get your test API keys

1. In the Stripe dashboard, go to **Developers** → **API keys**
2. Copy the **Publishable key** (`pk_test_...`) and **Secret key** (`sk_test_...`)

> You start in test mode by default — no real charges will occur.

### 3. Add environment variables to Vercel

In your Vercel project → **Settings** → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `STRIPE_SECRET_KEY` | `sk_test_xxxxxxxxxxxx` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_xxxxxxxxxxxx` |

### 4. Test the payment flow

Use Stripe's test card details:

| Field | Value |
|-------|-------|
| Card number | `4242 4242 4242 4242` |
| Expiry | Any future date |
| CVC | Any 3 digits |
| ZIP | Any 5 digits |

Check **Stripe** → **Payments** to confirm the test charge appears.

### 5. Go live

When ready for real payments:

1. Complete Stripe's business verification in the dashboard
2. Switch to **Live mode**
3. Replace the Vercel env vars with your live keys (`sk_live_...`, `pk_live_...`)
4. Redeploy

> Never commit API keys to git. Always use environment variables.

---

## Summary

| Service | Variables needed |
|---------|-----------------|
| Resend | `RESEND_API_KEY`, `CRON_SECRET` |
| Stripe (test) | `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
