# Deployment Verification System

Automated smoke tests run after every push to `main` to confirm the live site is healthy.

## How It Works

1. Developer (or agent) pushes to `main`
2. Vercel builds and deploys automatically (~60–90s)
3. GitHub Actions workflow (`.github/workflows/deployment-verification.yml`) starts
4. Workflow waits 90 seconds for Vercel to finish, then runs `scripts/smoke-test.js`
5. Smoke tests hit key routes on `https://thewebsite.app` and verify HTTP 200 responses
6. Pass/fail result is visible on the GitHub Actions tab

## Activating the GitHub Actions Workflow

The workflow definition lives in `deployment-automation/deployment-verification.yml` and must be installed by a repository owner with a PAT that has `workflow` scope:

```bash
mkdir -p .github/workflows
cp deployment-automation/deployment-verification.yml .github/workflows/deployment-verification.yml
git add .github/workflows/deployment-verification.yml
git commit -m "Install deployment verification workflow"
git push
```

This one-time step activates the automated post-deploy smoke tests.

## Routes Tested

| Route | Name |
|-------|------|
| `/` | Homepage |
| `/course` | Course landing |
| `/blog` | Blog index |
| `/pricing` | Pricing |
| `/faq` | FAQ |

## Running Manually

```bash
# Test production
node scripts/smoke-test.js

# Test a specific URL (e.g. Vercel preview)
node scripts/smoke-test.js https://my-preview.vercel.app
```

Or trigger via GitHub Actions UI (`workflow_dispatch`) with an optional URL override.

## Failure Response

If smoke tests fail:
1. Check the GitHub Actions run for which route(s) failed
2. Open the Vercel dashboard for build/runtime logs
3. Fix the issue, push a fix commit
4. Confirm the next workflow run passes

## Files

| File | Purpose |
|------|---------|
| `scripts/smoke-test.js` | Node.js smoke test — checks HTTP status of key routes |
| `.github/workflows/deployment-verification.yml` | GitHub Actions workflow triggered on push to main |
| `GROWTH_PLAYBOOK.md` (Post-Deployment section) | Manual verification checklist for agents |
