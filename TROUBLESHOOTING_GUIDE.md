# Troubleshooting Guide for Nalin

**Last Updated**: March 14, 2026
**Launch Date**: March 23, 2026 (9 days)
**Status**: Active — use this as your command center for resolving blockers

---

## How to Use This Guide

Start at [Section 1: Current Blockers](#1-current-blockers). Fix the build issue first — everything else flows from that. If you're short on time, jump to [Section 3: Quick Wins](#3-quick-wins) for what you can execute right now without a working build.

---

## 1. Current Blockers

### 1.1 Vercel Builds Failing

**The error** (from `build.log`):

```
Error: ENOENT: no such file or directory, open
'/workspace/group/thewebsite/.next/server/pages-manifest.json'
```

**What this means**: Turbopack (Next.js dev bundler) creates a different `.next/` directory structure than the standard production build. A leftover `.next/` folder from a Turbopack dev session is confusing the production build step. The compiled code is there; the manifest file is not in the expected location.

**Status**: Unresolved. No manual fix has been applied yet.

**How to fix it** (3 options, in order of preference):

**Option A — Fix it in the repo (recommended, ~5 minutes)**

```bash
cd thewebsite
rm -rf .next
git add -A
git commit -m "fix: clear stale .next build artifacts"
git push origin main
```

This forces Vercel to do a clean build with no cached artifacts. After pushing, the auto-deploy should succeed within 2-3 minutes.

**Option B — Redeploy with cleared cache (no code change needed, ~2 minutes)**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select **thewebsite** project
3. Click **Deployments** tab
4. Click **...** on the most recent deployment
5. Select **Redeploy**
6. In the dialog, select **Clear Build Cache** (important — not "Use existing cache")
7. Click **Redeploy**

**Option C — Build locally and deploy prebuilt (~10 minutes)**

This bypasses Vercel's build entirely. You build on your machine and upload the result.

```bash
cd thewebsite
rm -rf .next
pnpm install       # ensure dependencies are current
pnpm build         # verify it succeeds locally
vercel deploy --prebuilt --prod
```

If `pnpm build` fails locally, see [Section 1.4 — Build Troubleshooting](#14-build-troubleshooting).

---

### 1.2 PRs Merged But Not Deployed

**Why this happens**: Vercel's GitHub integration auto-triggers a new deployment whenever code is pushed to `main`. But if that deployment **fails** (which it currently does due to the build error above), the new code is in the repo but the live site still serves the last _successful_ deployment.

In other words: GitHub and the live site are out of sync whenever builds fail. The code exists, but it never reached production.

**Check which deployment is currently live:**

1. Go to vercel.com/dashboard → **thewebsite** → **Deployments**
2. Look for the deployment with **PRODUCTION** badge — that's what's live
3. Compare its commit hash to the latest commit on `main` in GitHub

**Fix**: Resolve the build error (Section 1.1), then Vercel will auto-deploy the latest `main` commit.

---

### 1.3 Features in GitHub But Not Live

**Root cause**: Same as 1.2. Every feature merged to `main` since the build started failing is code-complete but not deployed.

**What's pending deployment** (based on recent merge activity):
- Resend email cron jobs (`/api/cron/nurture-emails`, `/api/cron/daily-email`)
- Stripe payment webhook handler (`/api/webhook/stripe`)
- Unsubscribe flow (`/api/unsubscribe`)
- Blog posts and course module pages
- Analytics and referral tracking
- Lead magnet starter kit page (`/starter-kit`)

All of this is ready. It just needs the build to pass once.

---

### 1.4 Build Troubleshooting Reference

If `pnpm build` fails locally, work through these in order:

| Symptom | Fix |
|---------|-----|
| `ENOENT: .next/server/pages-manifest.json` | `rm -rf .next && pnpm build` |
| `Missing env variable` | Add the variable to `.env.local` (see full list in [Section 2.3](#23-vercel-environment-variables)) |
| `TypeScript error` | The error message will name the file and line — fix the type error before pushing |
| Build hangs / times out | `rm -rf node_modules && pnpm install && pnpm build` |
| `pnpm: command not found` | `npm install -g pnpm` then retry |
| Node version error | You need Node 20+. Run `node -v` to check; install via `nvm install 20 && nvm use 20` |
| pnpm lockfile conflict | `pnpm install --frozen-lockfile=false` then commit updated lockfile |

**Confirming the build is working locally** — a successful `pnpm build` ends with:

```
▲ Next.js 16.x.x
✓ Compiled successfully
Route (app) ...
```

If you see this, the site will deploy correctly. Push and let Vercel handle it.

---

## 2. Required Manual Actions

These are tasks that **only you can complete** (they require account creation or credentials you control). The code is already written and waiting.

### 2.1 Resend Account Setup (Email)

**Time required**: ~5 minutes
**Why it matters**: Without this, no emails go out — no welcome email, no nurture sequence, no launch announcement.

**Step 1 — Create account**

1. Go to [resend.com](https://resend.com)
2. Sign up with `nalin.mittal@gmail.com` or GitHub
3. Verify your email

**Step 2 — Add your sending domain**

1. In Resend dashboard → **Domains** → **Add Domain**
2. Enter: `updates.thewebsite.app`
3. Resend will give you 3 DNS records to add (SPF, DKIM, MX)

**Step 3 — Add DNS records**

Log in to wherever `thewebsite.app` DNS is managed (Vercel, Cloudflare, or Namecheap) and add all 3 records exactly as shown by Resend.

> DNS propagation takes 1–5 minutes normally, up to 48 hours worst case. The Resend dashboard will auto-check and turn the status badge green when verified.

**Step 4 — Create API key**

1. Resend dashboard → **API Keys** → **Create API Key**
2. Name: `thewebsite-production`
3. Permission: **Sending access** (not Full access)
4. Domain: `updates.thewebsite.app`
5. Click **Add** — copy the key immediately (starts with `re_`, shown only once)

**Step 5 — Add to Vercel** (see [Section 2.4](#24-how-to-add-environment-variables-in-vercel))

```
RESEND_API_KEY = re_your_key_here
CRON_SECRET    = 2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc=
```

Set `RESEND_API_KEY` for all three environments (Production, Preview, Development).
Set `CRON_SECRET` for **Production only**.

**Step 6 — Redeploy and verify**

After saving env vars, redeploy (Section 2.5), then test:

```bash
curl "https://thewebsite.app/api/cron/nurture-emails?manual_trigger=2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc="
```

Expected response: `{"success":true,...}`

**Resend quick troubleshooting:**

| Error | Cause | Fix |
|-------|-------|-----|
| `RESEND_API_KEY is not set` | Env var missing or stale deployment | Redeploy on Vercel |
| `{"error":"Unauthorized"}` | Wrong CRON_SECRET value | Check env var + redeploy |
| Emails land in spam | Domain DNS not fully propagated | Check all 3 DNS records; wait 24h |
| Domain stuck "Pending" | DNS not propagated yet | Run `dig TXT updates.thewebsite.app` to verify |

---

### 2.2 Stripe Account Setup (Payments)

**Time required**: ~10 minutes
**Why it matters**: Without this, the $67 founders pricing checkout does not work. The payment form and webhook handler are fully coded.

**Step 1 — Create account**

1. Go to [stripe.com](https://stripe.com) → **Start now**
2. Fill in email, name, country, password
3. Verify email
4. Complete business details (use "Individual" for solo projects)

**Step 2 — Get test API keys first**

In Stripe Dashboard, confirm **Test mode** is ON (orange TEST banner visible):

1. Go to **Developers → API keys**
2. Copy both keys:

| Key | Variable name |
|-----|---------------|
| Publishable key (`pk_test_...`) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` |
| Secret key (`sk_test_...`) | `STRIPE_SECRET_KEY` |

**Step 3 — Add API keys to Vercel**

See [Section 2.4](#24-how-to-add-environment-variables-in-vercel). Add both keys to all environments.

**Step 4 — Configure the webhook**

1. Stripe Dashboard → **Developers → Webhooks** → **Add endpoint**
2. Endpoint URL: `https://thewebsite.app/api/webhook/stripe`
3. Events to send: `checkout.session.completed` and `charge.refunded`
4. Click **Add endpoint**
5. On the webhook detail page → **Reveal** signing secret → copy the `whsec_...` value
6. Add to Vercel: `STRIPE_WEBHOOK_SECRET = whsec_...`
7. Redeploy

**Step 5 — Switch to live keys before launch (March 22)**

1. Toggle **Test mode OFF** in Stripe Dashboard
2. Go to **Developers → API keys** → copy live keys (`pk_live_...`, `sk_live_...`)
3. Update both keys in Vercel env vars
4. Create a **new** webhook endpoint in live mode with the same URL
5. Update `STRIPE_WEBHOOK_SECRET` with the new live signing secret
6. Redeploy

**Test the payment flow (test mode):**

Use card `4242 4242 4242 4242`, any future expiry, any CVC.

**Stripe quick troubleshooting:**

| Error | Cause | Fix |
|-------|-------|-----|
| `STRIPE_SECRET_KEY env var required` | Missing env var | Add in Vercel + redeploy |
| Webhook 500 "secret not configured" | `STRIPE_WEBHOOK_SECRET` missing | Add to Vercel + redeploy |
| Webhook 400 "Invalid signature" | Using CLI secret in production | Use the Stripe Dashboard webhook secret, not the CLI one |
| Payment succeeds, shows "pending" | Webhook not reaching server | Check Stripe → Developers → Webhooks → Recent deliveries |

---

### 2.3 Vercel Environment Variables

**Complete list of all variables** — add every one of these to Vercel before launch:

**Database (Turso)**

| Variable | Where to get it |
|----------|----------------|
| `TURSO_DATABASE_URL` | Turso Dashboard → your database |
| `TURSO_AUTH_TOKEN` | Turso Dashboard → your database → Tokens |

**Authentication (Auth.js + GitHub OAuth)**

| Variable | Where to get it |
|----------|----------------|
| `AUTH_SECRET` | Generate: `npx auth secret` |
| `AUTH_GITHUB_ID` | GitHub App → General settings → Client ID |
| `AUTH_GITHUB_SECRET` | GitHub App → General settings → Client Secret |

**GitHub App (bot actions)**

| Variable | Where to get it |
|----------|----------------|
| `GITHUB_APP_ID` | GitHub App → General settings |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App → Generate a private key (PEM format) |
| `GITHUB_APP_INSTALLATION_ID` | GitHub App installations page |
| `GITHUB_WORKFLOW_TOKEN` | GitHub → Settings → Developer settings → PATs |

**Payments (Stripe)**

| Variable | Where to get it |
|----------|----------------|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → endpoint → Signing secret |

**Email (Resend)**

| Variable | Where to get it |
|----------|----------------|
| `RESEND_API_KEY` | Resend → API Keys |
| `CRON_SECRET` | Any random string (or use: `2Tt7WMB9qeJTJhq2L2rQE61Kr29ywmK9q0hLheQs7Xc=`) |

**Monitoring (Sentry)**

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry → project → Settings → Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry → Settings → Auth Tokens |

**URL**

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_BASE_URL` | `https://thewebsite.app` |

---

### 2.4 How to Add Environment Variables in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select **thewebsite** project
3. Click **Settings** → **Environment Variables**
4. Click **Add New**
5. Enter the variable name and value
6. Select environments (Production / Preview / Development as appropriate)
7. Click **Save**
8. **Redeploy** — env vars take effect only after a new deployment

> `NEXT_PUBLIC_*` variables are baked in at build time. Adding them requires a full redeploy before they're active in production.

---

### 2.5 How to Access Vercel Deployment Logs

**To see why a build failed:**

1. Vercel Dashboard → **thewebsite** → **Deployments**
2. Click any deployment row (red = failed, green = success)
3. Click **View Build Logs** on the deployment detail page
4. The error will be at the bottom of the log — scroll to the end

**To see runtime logs (server errors on the live site):**

1. Vercel Dashboard → **thewebsite** → **Logs** tab (top navigation)
2. Filter by: Error, Warning, or search for a specific route (e.g. `/api/webhook/stripe`)
3. Click any log entry to expand details

**To see cron job logs:**

1. Vercel Dashboard → **thewebsite** → **Settings** → **Crons**
2. Click any cron job to see execution history and last run status

---

### 2.6 How to Manually Trigger a Deployment

**Method 1 — Redeploy from dashboard (easiest)**

1. Vercel Dashboard → **thewebsite** → **Deployments**
2. Find the deployment to redeploy → click **...**
3. Select **Redeploy**
4. Choose **Clear Build Cache** if troubleshooting a build failure
5. Click **Redeploy**

**Method 2 — Empty commit (forces new deploy via git)**

```bash
git commit --allow-empty -m "force redeploy"
git push origin main
```

**Method 3 — Deploy via Vercel CLI**

```bash
npm install -g vercel   # if not installed
vercel login
cd thewebsite
vercel --prod
```

**Method 4 — Deploy Hook (can trigger from browser/curl)**

1. Vercel Dashboard → **thewebsite** → **Settings** → **Git** → **Deploy Hooks**
2. Create a hook named "Manual Trigger" for the `main` branch
3. Copy the URL and trigger anytime with:
   ```bash
   curl -X POST "https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_URL"
   ```

**Method 5 — Roll back to last working deployment (emergency)**

1. Vercel Dashboard → **thewebsite** → **Deployments**
2. Find the last deployment with green **Ready** status
3. Click **...** → **Promote to Production**

This instantly reverts production — no rebuild required.

---

## 3. Quick Wins

These can be executed **right now**, regardless of whether the build is fixed.

### 3.1 What You Can Do Without a Working Build

| Action | Blocks? | Notes |
|--------|---------|-------|
| Post on Twitter | No | All threads written, see below |
| Post on Reddit | No | r/ClaudeAI, r/LocalLLaMA posts ready |
| Submit to Hacker News | Only if site is down | HN post requires thewebsite.app to be accessible |
| Send emails via Resend dashboard | No | Requires Resend account (Section 2.1) |
| Set up Stripe | No | Independent of build status |
| Set up Resend | No | Independent of build status |
| Engage with community (HN, Reddit replies) | No | Pure manual work |
| Send re-engagement email to 12 subscribers | No | Requires Resend, or send from Gmail as workaround |

---

### 3.2 Content Ready to Post

Every piece of content below is written and ready. No editing needed — just copy-paste.

**Twitter content:**

| Thread | File | Notes |
|--------|------|-------|
| Launch thread (9 tweets) | `FINAL_LAUNCH_CONTENT.md` | Post March 23, 9am ET |
| Viral thread #1: "9 lessons from 30 AI workers" | `TWITTER_LAUNCH_THREADS.md` | Post any day this week |
| Viral thread #2: "5-day build story" | `TWITTER_LAUNCH_THREADS.md` | Post March 19–20 |
| Day 1 update tweet | `CONTENT_CALENDAR_30_DAYS.md` | "I'm an AI agent running a real company…" |
| 3 backup standalone tweets | `FINAL_LAUNCH_CONTENT.md` | Use if threads underperform |

**Reddit posts:**

| Post | Target subreddit | File |
|------|-----------------|------|
| "I've been running Claude as autonomous CEO for 2 weeks" | r/ClaudeAI | `GROWTH_PLAYBOOK.md` |
| "Multi-agent architecture for a real autonomous business" | r/LocalLLaMA | `GROWTH_PLAYBOOK.md` |
| "We open-sourced our AI agent coordination architecture" | r/artificial | `GROWTH_PLAYBOOK.md` |

**Hacker News:**

| Post | Timing | File |
|------|--------|------|
| Show HN post (full copy-paste ready) | Monday March 23, 9am ET | `FINAL_LAUNCH_CONTENT.md` |
| HN comment templates | Any active AI thread | `GROWTH_PLAYBOOK.md` |

**Email campaigns:**

| Email | Recipients | File |
|-------|-----------|------|
| Re-engagement email to 12 subscribers | 12 existing subscribers | `GROWTH_PLAYBOOK.md` |
| Launch announcement | Full list | `FINAL_LAUNCH_CONTENT.md` |
| Founders pricing countdown | Full list | `LAUNCH_CHECKLIST.md` |

---

### 3.3 Marketing Campaigns Ready to Execute

These require only posting — no code or infrastructure:

1. **Twitter cadence**: Content calendar mapped out through March 23. Each day's content is in `CONTENT_CALENDAR_30_DAYS.md`. Takes ~5 minutes/day to post.

2. **Sponsor outreach**: 10 target companies identified (Modal, Replicate, Together AI, Vercel, Railway, Sentry, Datadog, Linear, Cursor, Warp). Email templates in `COMMUNITY_STRATEGY.md`. Goal: start outreach by March 17 for first response by launch day.

3. **AI YouTuber collab outreach**: 3 contacts identified with pitches drafted. See `GROWTH_PLAYBOOK.md`.

4. **Guest post pitches**: Templates ready for Towards Data Science and Better Programming. Send by March 20.

5. **Cross-newsletter outreach**: Templates ready for 3–5 complementary newsletters. See `COMMUNITY_STRATEGY.md`.

---

### 3.4 What Is Actually Working on the Site Right Now

The last successful Vercel deployment is live. Based on the git history:

- **Homepage** (`thewebsite.app`) — live
- **Course modules** — at least the first batch; verify all 5 load
- **Email signup form** — the waitlist API is live; test by signing up with a test email
- **GitHub issue/voting system** — the core feature of the site
- **Analytics** — Sentry is configured and collecting errors
- **Admin/metrics page** — accessible if you're logged in as admin

**To verify what's actually live**: Do a manual walkthrough at `thewebsite.app` before executing any marketing. Check: homepage → course → /starter-kit → /pricing → /sponsors → blog posts. Note any 404s.

---

## 4. Launch Day Contingencies

### 4.1 If Vercel Builds Are Still Broken on March 23

**Do not delay the launch.** Use Option C from Section 1.1 — build locally and deploy prebuilt:

```bash
cd thewebsite
rm -rf .next
pnpm install
pnpm build          # must succeed locally
vercel deploy --prebuilt --prod
```

This deploys the `.next/` output directly to Vercel's CDN, bypassing their build system entirely. Takes ~10 minutes. If `pnpm build` fails locally, work through the table in [Section 1.4](#14-build-troubleshooting).

**Worst case — the site itself is unreachable**: Launch the Twitter thread, submit to HN, and send the email anyway. The narrative ("AI agent ran a company for 9 days") does not require the site to be perfect. Direct people to the GitHub repo as a fallback. Announce: "Site migration in progress — course content at github.com/nalin/thewebsite."

---

### 4.2 Minimum Viable Launch

These are the **hard requirements** for launch day. Everything else is nice-to-have.

| Requirement | Status | Fix if broken |
|-------------|--------|---------------|
| Site accessible at thewebsite.app | Must fix | Section 1.1 |
| Email signup form captures addresses | Must fix | Turso env vars (Section 2.3) |
| At least 3 course modules accessible | Must fix | Deploy current main |
| Twitter thread goes out at 9am | Independent of build | Copy-paste from FINAL_LAUNCH_CONTENT.md |
| HN post submitted | Requires site to be up | Submit when site is confirmed up |
| Launch email sent to subscribers | Must have Resend | Fallback: Gmail bulk send |

**Nice-to-have but not blockers:**
- Stripe payments working (can collect payments manually, charge later)
- All 9 course modules live (launch with what's there, add more post-launch)
- Blog posts indexed by Google (SEO takes time anyway)
- Analytics dashboard (data will backfill)

---

### 4.3 Workarounds for Known Issues

**If Stripe isn't set up in time:**

Option A: Use Lemon Squeezy instead — 5-minute setup, no build required. Go to [lemonsqueezy.com](https://lemonsqueezy.com), create a product at $67, share the payment link directly in your launch email. Collect manually, honor all purchases.

Option B: Collect founding member emails manually. In the launch email, say: "Reply with 'FOUNDING MEMBER' to lock in $67 pricing. I'll follow up with payment details once the checkout is live." This works. People respond to directness.

**If Resend isn't set up in time:**

Option A: Send the launch email from Gmail. It won't look as polished, but it lands in inboxes. With 12–100 subscribers, Gmail works fine (Gmail sends limit is 500/day on free accounts).

Option B: Use Resend's test mode — you can send emails from the dashboard manually without DNS verification if you're OK with lower deliverability.

**If email cron jobs aren't running:**

Trigger manually from the Resend dashboard or via curl:

```bash
curl "https://thewebsite.app/api/cron/daily-email?manual_trigger=YOUR_CRON_SECRET"
```

Note: cron jobs only run on Vercel Pro plans. If you're on the free tier, you'll need to trigger them manually until you upgrade, or set up an external cron service (cron-job.org is free).

**If the site has 404s on key pages:**

For any page returning 404 that you need for launch (e.g. `/starter-kit`, `/pricing`):

1. Check if the page exists in the GitHub repo — if yes, the build just isn't deployed (Section 1.1)
2. If the page truly doesn't exist yet, link to the course overview (`/course`) instead as a fallback
3. Never link to a URL in a launch announcement without testing it first

**If Turso database connection fails:**

Symptoms: signup form errors out, course pages don't load dynamic content.

1. Log in to Turso dashboard and verify the database is active (free tier has inactivity pauses)
2. Check that `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set in Vercel
3. Turso tokens expire — regenerate from the Turso dashboard if needed
4. Regenerating a token requires a Vercel redeploy to take effect

---

## 5. Priority Order for the Next 48 Hours

If you work through nothing else, do these in order:

1. **Fix the build** (Section 1.1, Option B — 2 minutes in Vercel dashboard). Clear cache redeploy. This unblocks everything.
2. **Set up Resend** (Section 2.1, ~5 minutes). Email is your highest-leverage launch asset.
3. **Set up Stripe** (Section 2.2, ~10 minutes). Even test mode lets you verify the payment flow.
4. **Verify all env vars are set** (Section 2.3). Run down the list once, methodically.
5. **Post today's Twitter content** (Section 3.2). This takes 5 minutes and builds pre-launch momentum.
6. **Send re-engagement email to 12 subscribers** (use the script in `GROWTH_PLAYBOOK.md`). These are warm leads — reach out before launch day.

---

*For deployment commands in one place, see `MANUAL_DEPLOYMENT.md`. For email setup details, see `RESEND_SETUP.md`. For Stripe setup details, see `STRIPE_SETUP.md`. For the full launch timeline, see `LAUNCH_CHECKLIST.md`.*
