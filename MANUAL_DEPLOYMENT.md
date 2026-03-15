# Manual Deployment Guide

This guide is for Nalin to use when Vercel auto-deploy is broken or unavailable.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Deploy from Local Machine (Vercel CLI)](#2-deploy-from-local-machine-vercel-cli)
3. [Manually Trigger Redeployment from Vercel Dashboard](#3-manually-trigger-redeployment-from-vercel-dashboard)
4. [Roll Back to Last Working Deployment](#4-roll-back-to-last-working-deployment)
5. [Deploy Specific Branches for Testing](#5-deploy-specific-branches-for-testing)
6. [Bypass Failing Checks](#6-bypass-failing-checks)
7. [Environment Variables Reference](#7-environment-variables-reference)
8. [Build Settings](#8-build-settings)
9. [Node Version Requirements](#9-node-version-requirements)
10. [Common Deployment Troubleshooting](#10-common-deployment-troubleshooting)

---

## 1. Prerequisites

### Install Vercel CLI

```bash
npm install -g vercel
# or
pnpm add -g vercel
```

### Authenticate

```bash
vercel login
```

Follow the browser prompt to authenticate with your Vercel account. Once done, verify with:

```bash
vercel whoami
```

### Clone the repo (if not already local)

```bash
git clone https://github.com/nalin/thewebsite.git
cd thewebsite
pnpm install
```

---

## 2. Deploy from Local Machine (Vercel CLI)

### Option A: Deploy to Production

```bash
cd thewebsite
vercel --prod
```

- First run: Vercel will ask you to link the project. Select "thewebsite" from your account.
- This deploys the current local state directly to production.
- You will get a deployment URL on success.

### Option B: Deploy a Preview (non-production)

```bash
vercel
```

This creates a preview deployment with a unique URL (e.g. `thewebsite-abc123.vercel.app`).

### Option C: Deploy a specific commit or branch

```bash
git checkout main          # or any branch
git pull origin main
vercel --prod
```

### Skipping build (deploy pre-built output)

If you have already run `pnpm build` locally:

```bash
pnpm build
vercel deploy --prebuilt --prod
```

This uploads the `.next/` directory directly without re-running the build on Vercel's servers — useful when the remote build is failing but local builds succeed.

---

## 3. Manually Trigger Redeployment from Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select the **thewebsite** project
3. Click the **Deployments** tab
4. Find the deployment you want to redeploy (the most recent successful one, or any)
5. Click the **...** (three dots) menu on the right of the deployment row
6. Select **Redeploy**
7. In the dialog, choose:
   - "Use existing Build Cache" — faster, reuses cached node_modules
   - "Clear Build Cache" — slower but safer when troubleshooting
8. Click **Redeploy**

> This re-runs the exact same commit through the Vercel build pipeline without needing a new git push.

---

## 4. Roll Back to Last Working Deployment

### Via Dashboard (recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard) > **thewebsite** > **Deployments**
2. Find the last deployment that has a green **Ready** status
3. Click the **...** menu on that deployment
4. Select **Promote to Production**
5. Confirm the promotion

This instantly switches production traffic to the selected deployment — no rebuild required.

### Via CLI

```bash
# List recent deployments
vercel ls thewebsite

# Promote a specific deployment URL to production
vercel promote <deployment-url>
# Example:
vercel promote thewebsite-abc123xyz.vercel.app
```

---

## 5. Deploy Specific Branches for Testing

### Automatic Preview Deployments

Vercel auto-deploys every branch push as a Preview deployment. To check the URL:

1. Go to the **Deployments** tab in the Vercel dashboard
2. Filter by branch name using the search box
3. Click the deployment to open its preview URL

### Manual Branch Deploy via CLI

```bash
git checkout feature/my-branch
vercel
# Do NOT use --prod — this creates a preview deployment for this branch
```

### Promote a Branch Deploy to Production

Only do this when you are sure the branch is ready:

```bash
vercel promote <preview-deployment-url> --prod
```

Or via the dashboard: find the preview deployment > **...** > **Promote to Production**.

---

## 6. Bypass Failing Checks

### Skip Vercel's Ignored Build Step

If Vercel is skipping your deployment because it thinks nothing changed, force it to build:

- Add a commit (even an empty one) to trigger the webhook:
  ```bash
  git commit --allow-empty -m "force redeploy"
  git push origin main
  ```

### Bypass GitHub Status Checks (merge a PR despite failing checks)

> Only do this when you are confident the check failure is a fluke or unrelated to your changes.

1. Go to the PR on GitHub
2. At the bottom of the PR, if checks have failed, click **Merge without waiting for requirements to be met** (shown when you are an admin/owner)
3. Or use the GitHub CLI:
   ```bash
   gh pr merge <PR_NUMBER> --merge --admin
   ```
   The `--admin` flag bypasses branch protection rules.

### Disable Vercel's GitHub Integration Temporarily

If the Vercel GitHub integration is broken:

1. Go to Vercel Dashboard > **thewebsite** > **Settings** > **Git**
2. Scroll to **Deploy Hooks** — you can trigger a manual build via a POST request to a deploy hook URL
3. Or disconnect and reconnect the GitHub integration

### Use a Deploy Hook (no git push needed)

Create a deploy hook in Vercel:

1. Vercel Dashboard > **thewebsite** > **Settings** > **Git** > **Deploy Hooks**
2. Create a hook named "Manual Trigger" for the `main` branch
3. Copy the URL. Trigger a deploy anytime with:
   ```bash
   curl -X POST "https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_URL"
   ```

---

## 7. Environment Variables Reference

These variables must be set in Vercel Dashboard > **thewebsite** > **Settings** > **Environment Variables**.

Set each variable for **Production**, **Preview**, and **Development** environments unless noted otherwise.

### Database (Turso)

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso DB URL — from Turso dashboard > your database |
| `TURSO_AUTH_TOKEN` | Turso auth token — from Turso dashboard > your database > tokens |

### Authentication (Auth.js + GitHub OAuth)

| Variable | Description |
|---|---|
| `AUTH_SECRET` | Random secret for Auth.js session encryption. Generate with: `npx auth secret` |
| `AUTH_GITHUB_ID` | GitHub App Client ID — GitHub App > General settings |
| `AUTH_GITHUB_SECRET` | GitHub App Client Secret — GitHub App > General settings |

### GitHub App (Bot Actions)

| Variable | Description |
|---|---|
| `GITHUB_APP_ID` | GitHub App ID — GitHub App > General settings |
| `GITHUB_APP_PRIVATE_KEY` | GitHub App private key (PEM) — GitHub App > Generate a private key |
| `GITHUB_APP_INSTALLATION_ID` | Installation ID — GitHub App installations page |
| `GITHUB_WORKFLOW_TOKEN` | Personal access token for triggering workflows — GitHub > Settings > Developer settings > PATs |

### Payments (Stripe)

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe secret key. Test: `sk_test_...`, Live: `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret: `whsec_...` |

### Email (Resend)

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Resend API key — Resend dashboard > API keys |

### Cron Jobs

| Variable | Description |
|---|---|
| `CRON_SECRET` | Any random secret string used to authorize cron route calls |

### Monitoring (Sentry)

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN — Sentry project > Settings > Client Keys |
| `SENTRY_AUTH_TOKEN` | Sentry auth token for source map upload — Sentry > Settings > Auth Tokens |

### Public URL

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Production URL, e.g. `https://thewebsite.vercel.app` |

### How to add/update a variable in Vercel

1. Vercel Dashboard > **thewebsite** > **Settings** > **Environment Variables**
2. Click **Add New** (or edit an existing variable)
3. Enter the name and value, select the environments (Production/Preview/Development)
4. Click **Save**
5. **Redeploy** for the new value to take effect in production (existing deployments use the values at build time)

---

## 8. Build Settings

These are configured in the Vercel project settings and should match the following.

| Setting | Value |
|---|---|
| **Framework Preset** | Next.js |
| **Root Directory** | `.` (repo root) |
| **Build Command** | `pnpm build` (or `next build`) |
| **Output Directory** | `.next` (auto-detected) |
| **Install Command** | `pnpm install` |

### Vercel project settings check

1. Vercel Dashboard > **thewebsite** > **Settings** > **General**
2. Verify the above values under **Build & Development Settings**
3. If the build command is blank, Vercel uses the `build` script from `package.json` automatically

### Local build verification

Before deploying, always confirm the build passes locally:

```bash
pnpm build
```

A successful build outputs:
```
▲ Next.js 16.x.x
✓ Compiled successfully
Route (app) ...
```

---

## 9. Node Version Requirements

The project requires **Node.js 20 or later** (LTS). Next.js 16 and React 19 both require Node 20+.

### Check your local Node version

```bash
node -v
# Should output v20.x.x or higher
```

### Set Node version for Vercel

In the Vercel Dashboard:
1. **thewebsite** > **Settings** > **General**
2. Under **Node.js Version**, select **20.x**
3. Save and redeploy

Alternatively, pin the version in the repo by creating a `.nvmrc` file:

```bash
echo "20" > .nvmrc
```

Or add to `package.json`:

```json
"engines": {
  "node": ">=20"
}
```

### Local version management

If you use nvm:

```bash
nvm install 20
nvm use 20
```

If you use fnm:

```bash
fnm install 20
fnm use 20
```

---

## 10. Common Deployment Troubleshooting

### Build fails: `ENOENT: no such file or directory, open '.../.next/server/pages-manifest.json'`

This is a stale build artifact conflict between Turbopack and the standard Next.js build. Fix:

```bash
rm -rf .next
pnpm build
```

If deploying via CLI:

```bash
rm -rf .next
vercel --prod
```

### Build fails: Missing environment variable

The build will fail at runtime (or build time for `NEXT_PUBLIC_*` vars) if a variable is missing.

- Check Vercel Dashboard > **Settings** > **Environment Variables** for any missing entries
- `NEXT_PUBLIC_*` variables are baked in at build time — after adding them, you **must** redeploy
- Server-side variables take effect on next deployment

### Deployment stuck in "Building" for too long

1. Cancel the deployment from the Vercel dashboard (click the deployment > **Cancel**)
2. Clear build cache on redeploy: Redeploy > select **Clear Build Cache**
3. If it persists, deploy via CLI: `vercel --prod`

### `pnpm: command not found` on Vercel

Vercel supports pnpm natively. If it fails, ensure the **Install Command** in Vercel settings is set to `pnpm install` and the Node version is 20+.

### Auth / OAuth errors after deployment

After deploying to a new URL (e.g. a preview URL), update the GitHub OAuth App's callback URL:

- GitHub App > **General settings** > **Callback URL**
- Add the new deployment URL: `https://your-deployment.vercel.app/api/auth/callback/github`

### Stripe webhook fails after deployment

- Update the webhook endpoint in Stripe Dashboard to point to the new URL
- Or use the existing production URL — webhooks only need to change if the domain changes

### Sentry source maps not uploading

Ensure `SENTRY_AUTH_TOKEN` is set in Vercel environment variables. The token must have `project:write` scope for the `thewebsite` Sentry project.

### Database connection errors in production

- Verify `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` are set correctly in Vercel
- Turso tokens can expire — regenerate from the Turso dashboard if needed
- Check Turso dashboard for database availability/quota

### Cron jobs not running

- Cron jobs are defined in `vercel.json` and only run on **paid Vercel plans** (Pro+)
- Verify `CRON_SECRET` is set in environment variables
- Check Vercel Dashboard > **thewebsite** > **Cron Jobs** to see job status and last run

### `next build` succeeds locally but fails on Vercel

Common causes:
1. **Missing env var** — a `NEXT_PUBLIC_*` var used at build time is not set in Vercel
2. **Node version mismatch** — set Node 20 in Vercel project settings
3. **pnpm lockfile out of date** — run `pnpm install` locally, commit the updated `pnpm-lock.yaml`
4. **TypeScript errors** — run `pnpm build` locally to surface them before pushing
5. **Stale cache** — redeploy with "Clear Build Cache" checked

---

## Quick Reference Card

| Task | Command / Action |
|---|---|
| Deploy to production | `vercel --prod` |
| Deploy preview | `vercel` |
| Deploy prebuilt output | `pnpm build && vercel deploy --prebuilt --prod` |
| List deployments | `vercel ls thewebsite` |
| Promote to production | `vercel promote <deployment-url>` |
| Roll back via dashboard | Deployments > find good build > **Promote to Production** |
| Force redeploy (empty commit) | `git commit --allow-empty -m "force redeploy" && git push` |
| Bypass branch protection | `gh pr merge <PR> --merge --admin` |
| Check Node version | `node -v` (need 20+) |
| Verify local build | `pnpm build` |
| Clear build artifacts | `rm -rf .next && pnpm build` |
