# Build Failure Diagnosis — March 14, 2026

## TL;DR

**The current `main` branch builds successfully.** The build failure was real but has already been fixed. The `build.log` file in the repo is a stale artifact from March 7 and should be ignored.

---

## What Was the Original Error?

The `build.log` file shows a Vercel build from ~March 7, 2026:

```
✓ Compiled successfully in 8.6s
  Running TypeScript ...
  Collecting page data using 5 workers ...

> Build error occurred
Error: ENOENT: no such file or directory, open '/workspace/group/thewebsite/.next/server/pages-manifest.json'
```

**Root cause:** `app/testimonials/admin/page.tsx` imported `ensureTestimonialsTable` from `lib/testimonials-schema.ts`, but that export no longer existed. When Next.js tried to statically generate the page during `Collecting page data`, the import failed. Next.js reports this as the misleading `pages-manifest.json` error rather than showing the actual import failure.

---

## What Was Fixed?

Commit `6cc3dbd` ("Fix build: remove old testimonials admin using missing ensureTestimonialsTable export") deleted:
- `app/testimonials/admin/page.tsx`  
- `app/testimonials/admin/AdminTestimonialActions.tsx`

A new admin UI was added at `app/admin/testimonials/` which uses the correct API.

---

## What Did the Emergency Fix Worker Do?

Worker branch `worker/cmmqt80se00pss8hyfn610nz7` added:
- `MANUAL_DEPLOYMENT.md` — documentation for manual Vercel deployment
- `lib/launch-emails.ts` — launch week email templates

**Neither of these fixed the build.** The actual fix was already in `6cc3dbd`, which was merged to main before this worker ran.

---

## Current Build Status

**Local build on `main` (commit `ada39f1`) passes cleanly:**
- ✅ Compiled successfully (Turbopack)
- ✅ TypeScript check passed
- ✅ 56 static/dynamic pages generated
- ✅ No errors

---

## Why Vercel Might Still Show as Failing

1. **Stale `build.log`** — The file committed to the repo is from March 7 and does not reflect the current state. Vercel is not reading this file; it's just misleading anyone who looks at it.

2. **Vercel may not have redeployed** — If the git webhook to Vercel misfired after `ada39f1` was pushed, Vercel would still show the old failed deploy. Solution: manually trigger a redeploy from the Vercel dashboard.

3. **Sentry config** — `next.config.ts` uses `withSentryConfig`. Even with `sourcemaps.disable: true`, Sentry's build plugin may warn if `SENTRY_AUTH_TOKEN` is absent. This is a warning, not a build failure, but check Vercel env vars to confirm it's set.

4. **Environment variables** — These env vars should be set in Vercel:
   - `TURSO_DATABASE_URL` (required for production DB; falls back to `local.db` at build time)
   - `TURSO_AUTH_TOKEN`
   - `RESEND_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `GITHUB_APP_ID`, `GITHUB_APP_PRIVATE_KEY`, `GITHUB_APP_INSTALLATION_ID`
   - `NEXT_PUBLIC_SENTRY_DSN`
   - `SENTRY_AUTH_TOKEN` (optional but recommended)

---

## Known Non-Blocking Issue

`lib/__tests__/email.test.ts` uses the outdated `DailyUpdateData` interface (`accomplishments`, `newBlogPosts`) but the current interface uses `storyHook`, `keyInsight`, `metrics`. This causes TypeScript errors when running `tsc --noEmit` directly but does **not** block the Next.js production build. The tests themselves will fail if run.

---

## Recommended Actions

1. **Trigger a fresh Vercel redeploy** of the `main` branch from the Vercel dashboard
2. **If that fails**: check Vercel build logs for the actual error (not the `pages-manifest.json` red herring)
3. **Delete `build.log`** from the repo to avoid future confusion
4. **Fix the stale test file** `lib/__tests__/email.test.ts` (this PR includes that fix)
