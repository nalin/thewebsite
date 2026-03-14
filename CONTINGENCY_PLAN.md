# Contingency Plan: Vercel Deployment Failure

**Created**: March 14, 2026
**Decision Deadline**: March 21, 2026 (48 hours before launch)
**Launch Date**: March 23, 2026
**Site**: thewebsite.app

---

## Situation

If the Vercel deployment for thewebsite.app remains broken after all fix attempts, this document defines the fallback path to ensure the launch proceeds on schedule or with minimal disruption.

---

## Decision Tree

```
Is Vercel deployment fixed by March 21, 9am PT?
│
├── YES → Proceed with original launch plan (see LAUNCH_CHECKLIST.md)
│
└── NO → Is the issue fixable within 24 hours (by March 22, 9am PT)?
          │
          ├── YES → Fix it. Deploy to Vercel. Launch March 23 as planned.
          │         Monitor obsessively on March 22.
          │
          └── NO → Choose a path:
                    │
                    ├── Option 1: Alternate platform deployment
                    │   Best if: Deploy issue is Vercel-specific (config, env vars, build error)
                    │   Time needed: 2–4 hours
                    │
                    ├── Option 2: Minimal viable launch
                    │   Best if: Most features work but non-critical pieces are broken
                    │   Time needed: 1–2 hours of triage
                    │
                    └── Option 3: Delay launch by 7 days (to March 30)
                        Best if: Core product is broken, not just hosting
                        Time needed: Decision must be made by March 21
```

---

## Option 1: Deploy to Alternate Platform

### Decision criteria
Use this if Vercel itself is the problem — build errors, environment variable issues, deployment pipeline failures — and the app code builds cleanly locally (`npm run build` passes).

### A. Netlify (Recommended alternate)

**Setup time**: 30–60 minutes

**Steps:**
1. Go to app.netlify.com → New site → Import from Git → connect `nalin/thewebsite`
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add plugin for Next.js: in `netlify.toml` add:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```
5. Copy all environment variables from Vercel to Netlify dashboard (Site settings → Environment variables)
6. Deploy. Check build logs.
7. Update Stripe webhook endpoint to new Netlify URL.
8. Update Resend domain verification if subdomain changes.
9. Update DNS: point `thewebsite.app` A/CNAME to Netlify's load balancer.

**DNS propagation**: Can take 1–24 hours. Start DNS switch ASAP once build is confirmed working.

**Known limitations on Netlify:**
- Cron jobs (`/api/cron`) need to be replaced with Netlify Scheduled Functions or a separate cron service (e.g., cron-job.org, EasyCron). Configure before launch.
- Verify Next.js App Router middleware compatibility.

**Cost**: Free tier supports this project. No payment required.

---

### B. Railway

**Setup time**: 45–90 minutes

**Steps:**
1. Go to railway.app → New Project → Deploy from GitHub repo
2. Railway auto-detects Next.js. Confirm build command and start command (`npm run start`).
3. Add all environment variables in Railway dashboard.
4. Set `PORT` env var if required (Railway injects `$PORT` automatically for Node apps).
5. Add a custom domain in Railway → point `thewebsite.app` DNS to Railway's domain.
6. Update Stripe webhook URL and Resend configuration.

**Known limitations on Railway:**
- Cron jobs: Use Railway's cron service (available in dashboard) or external cron.
- No built-in CDN — performance may be slightly lower than Vercel/Netlify for static assets.

**Cost**: Free trial credits available. Hobby plan ~$5/month if needed.

---

### C. Self-Hosted VPS (Last resort)

**Setup time**: 2–4 hours

**Use only if** Netlify and Railway also fail (e.g., app-level issue surfaces on all platforms).

**Steps:**
1. Provision a $6/month Hetzner CX22 or DigitalOcean Droplet (Ubuntu 24.04)
2. Install Node.js 20, pnpm, nginx, certbot
3. Clone repo, copy `.env`, run `npm run build && npm run start`
4. Configure nginx as reverse proxy on port 3000
5. Issue SSL cert via certbot (`certbot --nginx -d thewebsite.app`)
6. Point DNS A record to VPS IP
7. Set up PM2 for process management (`pm2 start npm --name "thewebsite" -- start`)
8. Cron jobs: use system crontab to call the `/api/cron` endpoint via curl

**This is viable but adds operational burden.** Only use if launch absolutely cannot wait.

---

### Platform Comparison

| | Vercel | Netlify | Railway | VPS |
|---|---|---|---|---|
| Setup time | Already done | 30–60 min | 45–90 min | 2–4 hours |
| Next.js support | Native | Good | Good | Manual |
| Cron jobs | Native | External needed | Native | System cron |
| DNS propagation | Fast | Fast | Moderate | Manual |
| Cost | Current plan | Free | Free trial | $6/month |
| Risk | Broken | Low | Low | High (ops) |

---

## Option 2: Launch With Minimal Viable Site

Use this if Vercel is partially working — some routes are broken but core flows function.

### What MUST work on launch day

| Feature | Why it's non-negotiable |
|---|---|
| Homepage (`/`) | First impression, captures traffic |
| Email signup form | Primary goal of launch — every subscriber matters |
| Course Module 1 (`/course/module-1`) | Proof of value, retention hook |
| `/starter-kit` page | Lead magnet, high-intent traffic |
| Email delivery (Resend) | Subscribers expect a welcome email immediately |

### What can wait (acceptable to be broken at launch)

| Feature | Workaround |
|---|---|
| `/pricing` and Stripe checkout | Collect emails now, email payment link manually to interested buyers. Use Stripe payment link shared directly. |
| Analytics events | Add manually later. Log in Stripe/Resend instead. |
| Referral system | Disable referral links for now. Launch without referral tracking. Add within 48 hours. |
| Module 2–5 | Announce coming soon. Tease as "unlocking over the next 5 days." |
| `/sponsors` page | Remove from nav temporarily. Add back once deployment is stable. |
| Blog posts | Link to Medium/dev.to reposts if Next.js blog routes are broken. |
| Metrics dashboard (`/metrics`) | Internal only — not visible to users. Skip. |

### Communication strategy (transparency)

Post a brief note on the site and in the launch email:

> "We're running a live experiment — building in public, shipping fast, and some features are still being deployed. If you hit anything broken, reply to this email. Your report helps us ship faster."

This reframes deployment roughness as **intentional transparency** — consistent with the "AI-run company, building in public" brand. Do not apologize for being in progress; celebrate it.

---

## Option 3: Delay Launch (7-Day Slip to March 30)

### When to make this call

- The Vercel issue is not Vercel-specific — it reveals a deeper application bug
- Email signup or course access is fundamentally broken and cannot be worked around
- Option 1 platforms also fail to produce a working build

**If none of those conditions are true, do not delay.** A rough launch beats a delayed launch every time for momentum.

### Decision deadline

**March 21, 9am PT.** After this point, momentum and pre-scheduled content are already in motion. Reversing creates more damage than launching imperfect.

### How to communicate a delay (if required)

**To subscribers** (email, subject: "Launch is moving to March 30 — here's why"):

> We were 9 days from launch when we hit a deployment blocker. We could have shipped something broken. Instead we're taking one more week to make sure what you get is worth your time.
>
> Founders pricing ($67) is still locked in for you. Nothing changes except the date.
>
> We'll be back in your inbox on March 28 with a pre-launch preview.

**On Twitter:**

> Quick update: we're moving the launch to March 30. Hit a deployment issue we're not willing to paper over. In the meantime, here's what we're building → [link]. Founders pricing still applies to everyone already on the list.

**Tone**: Matter-of-fact, not apologetic. Show the problem, show the fix. This actually builds credibility.

### What to do with the momentum built

- Do NOT go quiet. Post a "behind the scenes: what broke and how we're fixing it" thread on Twitter — this often outperforms normal launch content
- Submit to HN as "Ask HN" rather than saving the "Show HN" — a "what broke in my AI agent deployment" thread can generate genuine discussion
- Send the re-engagement/nurture emails on the original schedule — do not lose warm leads
- Use the week to fix the deployment issue AND ship at least one additional feature (Module 2, premium tier page, or referral system)

### Revised timeline (if delayed)

| Date | Action |
|---|---|
| March 21 | Make delay decision. Email subscribers. Post Twitter update. |
| March 22–27 | Fix deployment. Ship polished version. Continue subscriber growth. |
| March 28 | Send "pre-launch preview" email to list. Build anticipation. |
| March 29 | Final infrastructure check. All systems green. |
| March 30, 9am PT | Launch. Same plan as original (see LAUNCH_CHECKLIST.md). |

---

## Recommendation

### Primary: Attempt alternate platform deploy on March 21

**Do this before declaring a delay.** The cost of trying Netlify is 1–2 hours. The cost of delaying is 7 days of lost momentum. The math is obvious.

**Recommended sequence on March 21 if Vercel is still broken:**

1. Run `npm run build` locally. Does it pass? If yes, proceed.
2. Deploy to Netlify (Option 1A). 30–60 minutes.
3. Verify: homepage, email signup, /course/module-1, Stripe checkout.
4. If all pass: update DNS, update webhook URLs, launch March 23 as planned.
5. If Netlify build also fails: the problem is in the app, not the platform.
   - Triage: what does the build error say?
   - If fixable in < 4 hours: fix it, re-deploy.
   - If not fixable: move to Option 2 (minimal viable) or Option 3 (delay).

### Secondary: Option 2 (minimal viable) over Option 3 (delay)

If the platform is working but some features are broken, launch anyway. Use the workarounds in Option 2. Every day of delay costs subscriber momentum, and the "building in public" brand makes a rough launch more acceptable than it would be for most products.

### Only delay if

- Email signup is broken (cannot collect subscribers)
- Course Module 1 is broken (cannot deliver the core promise)
- Both Vercel AND Netlify builds fail with the same error

---

## Preparation Checklist (Before March 21)

- [ ] Confirm `npm run build` passes in local development
- [ ] Document all environment variables required (with descriptions, not values) — needed to re-configure on new platform
- [ ] Create a Netlify account now (free, 5 minutes) so it's ready if needed
- [ ] Draft the "delay" subscriber email (see template above) — have it ready but unsent
- [ ] Draft the "we're live on a new platform" note for social media
- [ ] Verify DNS control panel access (Cloudflare/Namecheap/etc.) — you'll need to update A/CNAME records quickly
- [ ] Export list of all Stripe webhook endpoints to update if domain/URL changes
- [ ] Confirm Resend is configured for the domain — if switching to a subdomain, re-verify

---

## Contact Points if Things Break Fast

| System | Where to check | What to do if broken |
|---|---|---|
| Vercel deployment | vercel.com/dashboard → Deployments | Check build logs, redeploy, try Netlify |
| Stripe | dashboard.stripe.com | Update webhook URL if platform changes |
| Resend | resend.com/domains | Re-verify domain if DNS changes |
| DNS | Your registrar | Update A/CNAME records to new platform |
| Database | Check env var `DATABASE_URL` | Ensure it points to production DB, not local |

---

*Decision deadline: March 21, 2026 at 9am PT. If Vercel deployment is not fixed and Netlify fallback is not confirmed working by this time, execute Option 3 (delay to March 30). Do not attempt a broken launch of the core signup and course flows.*
