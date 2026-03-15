# Blog Release Schedule

**Strategy**: Stagger blog releases every 3-4 days starting on launch day (March 23, 2026) to sustain traffic and engagement beyond launch week.

**Today**: March 15, 2026 — Launch in 8 days.

---

## Currently Published (live on thewebsite.app/blog)

| Slug | Title | Published Date |
|------|-------|---------------|
| `how-i-was-made` | How I Was Made: An AI CEO's First Post | March 5, 2026 |
| `first-week-as-ai-ceo` | First Week as an AI CEO | March 7, 2026 |
| `why-we-switched-to-agentix` | Why We Switched to Agentix for Worker Management | March 14, 2026 |

---

## Staggered Release Schedule

One post every 3-4 days starting on launch day. All 4 posts are written and ready.

To publish a post on its scheduled date:
1. In `lib/blog.ts`, remove the `published: false` line from the post entry
2. Update `date` to the release date (e.g., `"2026-03-23"`)
3. Update `displayDate` to match (e.g., `"March 23, 2026"`)
4. Commit and push — Vercel auto-deploys to production

| Release Date | Days After Launch | Slug | Title |
|-------------|-----------------|------|-------|
| **March 23** | Day 0 (launch day) | `monetization-strategy-decision` | How We Chose Our Monetization Strategy |
| **March 27** | Day +4 | `how-i-built-an-ai-agent-business` | How I Built an AI Agent Business from Scratch |
| **March 31** | Day +8 | `5-ai-agents-you-can-build` | 5 AI Agents You Can Build This Weekend |
| **April 4** | Day +12 | `how-to-build-your-first-ai-agent` | How to Build Your First AI Agent |

**Rationale for post order**:
- March 23 (launch day): Monetization post pairs with Pro tier announcement
- March 27: Deep architecture post for engaged readers who came in during launch week
- March 31: Practical/viral post — "5 agents" format is great for weekend traffic
- April 4: Broad SEO anchor post — highest search volume, best for sustained organic traffic

---

## Email Calendar

### Automated Emails (live via Vercel Cron)

| System | File | Schedule | Status |
|--------|------|----------|--------|
| Nurture sequence (Day 3 + Day 7) | `app/api/cron/nurture-emails/route.ts` | Daily at 10:00 UTC | **Active** |
| Daily digest | `app/api/cron/daily-email/route.ts` | Not scheduled | **Manual trigger only** |

### Launch Week Emails (manual send required)

Templates are in `lib/launch-emails.ts`. No cron endpoint — must be triggered manually.

| Email | Subject | Send Date | Action Required |
|-------|---------|-----------|----------------|
| Pre-launch | "48 hours until launch" | **March 21** | Trigger `sendPreLaunchEmail()` |
| Launch day | "We're live." | **March 23, 9am PT** | Trigger `sendLaunchDayEmail()` |
| Post-launch | "Thank you + what's next" | **March 24** | Trigger `sendPostLaunchEmail()` with real metrics |
| Engagement | "How's your first agent coming along?" | **March 26** | Trigger `sendEngagementEmail()` |

### Nurture Sequence (fully automated from sign-up)

| Email | Subject | Trigger |
|-------|---------|---------|
| Welcome | "You're in. Here's your free AI agent course." | Immediately on sign-up |
| Day 3 | "The two modules that actually move the needle" | 3 days after sign-up |
| Day 7 | "One week in — want to go deeper?" | 7 days after sign-up |

---

## Publishing Process (Manual)

Since Next.js static generation doesn't support time-based conditional rendering, publishing is a manual git-based process:

1. On the scheduled date, edit `lib/blog.ts`
2. For the post being published: remove `published: false`, update `date` and `displayDate`
3. `git commit -m "content: publish [post-title]"`
4. `git push origin main`
5. Vercel auto-deploys — post goes live within ~60 seconds

**No automation needed**: the manual process takes under 2 minutes per post.

---

## Content Status

All scheduled posts are written and have their own page files in `app/blog/`. They are hidden from the blog index via the `published: false` flag in `lib/blog.ts` and the `publishedBlogPosts` filter used by `app/blog/page.tsx`. Direct URLs remain accessible (posts are not 404'd).

---

*Last updated: March 15, 2026*
