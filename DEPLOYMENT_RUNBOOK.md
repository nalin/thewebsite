# Deployment Failure Runbook

Step-by-step guide for diagnosing and resolving deployment failures.

---

## 1. Smoke Test Failure (GitHub Actions)

### Symptoms
- GitHub Actions "Deployment Verification" workflow fails on `main`
- One or more routes return non-2xx/3xx HTTP status

### Diagnosis
1. Open the GitHub Actions tab → select the failed "Deployment Verification" run
2. Expand the **Run smoke tests** step — note which route(s) reported `[FAIL]`
3. Check the Vercel dashboard for the corresponding deployment:
   - Build errors appear in the **Build Logs** tab
   - Runtime errors (500s) appear in **Functions** logs

### Resolution
| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| All routes fail | Vercel deploy stuck or failed | Check Vercel dashboard; re-deploy if needed |
| Single route fails (e.g. `/pricing`) | Page-level error or missing env var | Check runtime logs; add/correct env var in Vercel settings |
| 404 on a route | Route deleted or misnamed | Restore or fix the route in `app/` |
| 500 on a route | Unhandled server error | Check Next.js error logs, fix the component/API |

### After Fixing
```bash
git push origin main
```
The next push triggers a fresh verification run. Confirm the workflow passes.

---

## 2. Vercel Build Failure

### Symptoms
- Vercel dashboard shows a red "Build failed" status
- GitHub Actions never reaches the smoke-test step (Vercel never finishes)

### Diagnosis
1. Open [Vercel dashboard](https://vercel.com) → project → **Deployments**
2. Click the failed deployment → **Build Logs**
3. Look for TypeScript errors, missing dependencies, or env var issues

### Common Fixes
```bash
# TypeScript compile error
pnpm build          # reproduce locally, fix the error, commit

# Missing dependency
pnpm add <pkg>      # install, commit package.json + pnpm-lock.yaml

# Missing environment variable
# → Add it in Vercel Settings → Environment Variables
```

---

## 3. Re-running Verification Manually

```bash
# Against production
node scripts/smoke-test.js
# or
./scripts/verify-deployment.sh

# Against a Vercel preview URL
node scripts/smoke-test.js https://my-branch-preview.vercel.app
# or
./scripts/verify-deployment.sh https://my-branch-preview.vercel.app
```

Or trigger via **GitHub Actions UI**:
1. Go to Actions → "Deployment Verification" → **Run workflow**
2. Optionally enter a URL override (leave blank for production)

---

## 4. Rollback Procedure

If a bad deploy cannot be quickly fixed:

1. Open Vercel dashboard → **Deployments**
2. Find the last known-good deployment
3. Click the three-dot menu → **Redeploy** (promotes it to production instantly)
4. Verify smoke tests pass against production URL
5. Open a fix PR and merge when ready

---

## 5. Escalation

If the issue cannot be resolved within 30 minutes:
- Post in the team chat with the GitHub Actions run URL and Vercel deployment URL
- Tag the on-call engineer
- Consider rolling back (see section 4) to restore service while debugging

---

## Reference

| File | Purpose |
|------|---------|
| `scripts/smoke-test.js` | Core smoke test (checks HTTP status of key routes) |
| `scripts/verify-deployment.sh` | Shell wrapper for running smoke tests locally |
| `.github/workflows/deployment-verification.yml` | GitHub Actions workflow — triggers on push to `main` |
| `DEPLOYMENT_VERIFICATION.md` | System overview and how it works |
