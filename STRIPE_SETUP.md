# Stripe Setup Guide — Activate Payments in < 10 Minutes

The payment infrastructure is fully built and wired up. You just need Stripe keys.

---

## Step 1 — Create a Stripe Account

1. Go to **https://stripe.com** and click **Start now**.
2. Enter your email, name, country, and password.
3. Verify your email address.
4. Complete business details (you can use "Individual" for a solo project).

> If you already have a Stripe account, just log in.

---

## Step 2 — Get Your API Keys

### Test Keys (safe to use right now)

1. In the Stripe Dashboard, make sure the **"Test mode"** toggle (top-right) is **ON** — the header will show an orange "TEST" banner.
2. Go to **Developers → API keys**.
3. Copy these two keys:

| Key | Starts with | Where to copy it |
|-----|-------------|------------------|
| **Publishable key** | `pk_test_...` | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| **Secret key** | `sk_test_...` | `STRIPE_SECRET_KEY` |

> Click **"Reveal live key"** only when you are ready to go live. Use test keys first.

### Production Keys (when ready to go live)

1. Toggle **Test mode OFF** in the Stripe Dashboard.
2. Go to **Developers → API keys**.
3. Copy the same two keys — they will start with `pk_live_...` and `sk_live_...`.

---

## Step 3 — Add Keys to Vercel

1. Open your project at **https://vercel.com/dashboard**.
2. Go to **Settings → Environment Variables**.
3. Add the following variables (set Environment to **Production**, **Preview**, and **Development**):

```
STRIPE_SECRET_KEY          = sk_test_...   (or sk_live_... for production)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...   (or pk_live_... for production)
```

> `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is not currently used by the server — the checkout API uses only `STRIPE_SECRET_KEY` — but add it now for any future client-side Stripe.js integration.

4. Click **Save** and then **Redeploy** the latest deployment so the new env vars take effect.

---

## Step 4 — Configure the Webhook Endpoint

The app listens for Stripe events at `/api/webhook/stripe`. You need to register this URL with Stripe.

### For production

1. In the Stripe Dashboard, go to **Developers → Webhooks**.
2. Click **Add endpoint**.
3. Set **Endpoint URL** to:
   ```
   https://thewebsite.app/api/webhook/stripe
   ```
4. Under **Events to send**, select:
   - `checkout.session.completed`
   - `charge.refunded`
5. Click **Add endpoint**.
6. On the webhook detail page, click **Reveal** under **Signing secret**.
7. Copy the value (starts with `whsec_...`) and add it to Vercel:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_...
   ```
8. Redeploy on Vercel again.

### For local development

Install the Stripe CLI:
```bash
brew install stripe/stripe-cli/stripe
# or: https://stripe.com/docs/stripe-cli
```

Log in:
```bash
stripe login
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

The CLI will print a webhook signing secret like `whsec_...` — add it to your `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

Keep the `stripe listen` process running while testing locally.

---

## Step 5 — Test the Payment Flow Locally

1. Copy `.env.example` to `.env.local` and fill in your test keys + the local webhook secret from Step 4.
2. Start the dev server:
   ```bash
   pnpm dev
   ```
3. Navigate to the course page and click the purchase button.
4. Use Stripe's test card number:
   ```
   Card number:  4242 4242 4242 4242
   Expiry:       Any future date (e.g. 12/26)
   CVC:          Any 3 digits (e.g. 123)
   ZIP:          Any 5 digits (e.g. 12345)
   ```
5. After completing checkout, Stripe redirects you to `/course/success`.
6. The `stripe listen` terminal will show `checkout.session.completed` received.
7. Check the database — the purchase row should have `status = "completed"`.

**Other test cards:**
| Scenario | Card number |
|----------|-------------|
| Decline (generic) | `4000 0000 0000 0002` |
| Decline (insufficient funds) | `4000 0000 0000 9995` |
| 3D Secure required | `4000 0025 0000 3155` |

Full list: https://stripe.com/docs/testing#cards

---

## Step 6 — Verify Payments Work in Production

1. After deploying with live keys and the production webhook configured:
2. Make a real purchase using your own card (use a small amount — you can refund it).
3. Check the Stripe Dashboard under **Payments** — you should see the charge.
4. Check the Stripe Dashboard under **Developers → Webhooks** → your endpoint → **Recent deliveries** — the `checkout.session.completed` event should show `200 OK`.
5. Check the database `purchases` table — the row should have `status = "completed"` and a `stripePaymentIntentId`.

---

## Step 7 — Common Issues & Troubleshooting

### "STRIPE_SECRET_KEY environment variable is required" error
- The env var is missing or the Vercel deployment hasn't picked it up yet.
- Add the variable in Vercel → Settings → Environment Variables, then **redeploy**.

### Webhook returns 500 — "Webhook secret not configured"
- `STRIPE_WEBHOOK_SECRET` is not set. Add it in Vercel env vars (production webhook secret, not the CLI one).

### Webhook returns 400 — "Invalid signature"
- You are using the **CLI signing secret** (`whsec_...` from `stripe listen`) in production, or vice versa.
- Production and local webhooks have **different** signing secrets. Make sure each environment has its own correct value.

### Checkout redirect fails / success URL is wrong
- `NEXTAUTH_URL` controls the base URL for success/cancel redirects. Make sure it is set to your production domain in Vercel:
  ```
  NEXTAUTH_URL=https://thewebsite.app
  ```

### Payment succeeds but purchase still shows "pending"
- The webhook is not being received. Check **Developers → Webhooks → Recent deliveries** in Stripe for errors.
- Make sure the webhook endpoint URL matches exactly: `/api/webhook/stripe` (no trailing slash).

### Switching from test to live keys
1. Replace `sk_test_...` with `sk_live_...` in Vercel env vars.
2. Replace `pk_test_...` with `pk_live_...`.
3. Create a **new** webhook endpoint in Stripe with live mode (toggle test mode off first) and update `STRIPE_WEBHOOK_SECRET` with the new live signing secret.
4. Redeploy.

---

## Summary of Required Environment Variables

| Variable | Where to get it | Example |
|----------|----------------|---------|
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers → API keys | `sk_test_abc123` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → Developers → API keys | `pk_test_abc123` |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks → endpoint → Signing secret | `whsec_abc123` |
