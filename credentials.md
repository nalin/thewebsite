# Credentials & Environment Variables

This document describes all required environment variables for The Website and how to obtain them.

## Stripe (Payments)

The Stripe integration powers course purchases at `/course`. Two environment variables are required.

### STRIPE_SECRET_KEY

Used server-side to create Checkout Sessions and verify webhook events.

**How to obtain (test mode):**
1. Log in to [https://dashboard.stripe.com](https://dashboard.stripe.com)
2. Ensure you are in **Test mode** (toggle in the top-right)
3. Go to **Developers > API keys**
4. Copy the **Secret key** (starts with `sk_test_`)

### STRIPE_WEBHOOK_SECRET

Used to verify that incoming webhook payloads are genuinely from Stripe.

**How to obtain:**
1. Log in to the Stripe Dashboard in **Test mode**
2. Go to **Developers > Webhooks**
3. Click **Add endpoint**
   - Endpoint URL: `https://thewebsite.vercel.app/api/webhook/stripe`
   - Events to listen for: `checkout.session.completed`, `charge.refunded`
4. After saving, click the endpoint and reveal the **Signing secret** (starts with `whsec_`)

> For local development, use the [Stripe CLI](https://stripe.com/docs/stripe-cli):
> ```
> stripe listen --forward-to localhost:3000/api/webhook/stripe
> ```
> The CLI will print a webhook secret to use in your local `.env.local`.

### Adding keys to Vercel

1. Go to the [Vercel dashboard](https://vercel.com) and open the **thewebsite** project
2. Navigate to **Settings > Environment Variables**
3. Add each variable for **Production**, **Preview**, and **Development** environments:
   - `STRIPE_SECRET_KEY` = `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET` = `whsec_...`
4. Redeploy the project (or push a new commit) for the variables to take effect

> Use test-mode keys (`sk_test_` / `whsec_test_`) until you are ready for live payments.
> Switch to live-mode keys (`sk_live_` / `whsec_live_`) and update the Vercel env vars
> when you are ready to accept real payments.

---

## Other Services

| Variable | Where to get it |
|---|---|
| `TURSO_DATABASE_URL` | Turso dashboard > your database |
| `TURSO_AUTH_TOKEN` | Turso dashboard > your database > tokens |
| `AUTH_SECRET` | Run `npx auth secret` |
| `AUTH_GITHUB_ID` | GitHub App > General settings > Client ID |
| `AUTH_GITHUB_SECRET` | GitHub App > General settings > Client secret |
| `GITHUB_APP_ID` | GitHub App > General settings > App ID |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App > General settings > Generate a private key |
| `GITHUB_APP_INSTALLATION_ID` | GitHub App installations page |
| `GITHUB_WORKFLOW_TOKEN` | GitHub > Settings > Developer settings > Personal access tokens |
| `RESEND_API_KEY` | Resend dashboard > API keys |
| `CRON_SECRET` | Any random secret string |
| `NEXT_PUBLIC_BASE_URL` | Your production URL (e.g. `https://thewebsite.vercel.app`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry project > Settings > Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry > Settings > Auth Tokens |
