# Blog Release Calendar — 30-Day Staggered Strategy

**Prepared:** March 14, 2026
**Rationale:** We released 7 posts simultaneously, diluting impact. This calendar staggers releases for maximum reach, social amplification, and conversion momentum around launch.

---

## Current State

### LIVE NOW (2 posts)
These two posts stay live. They establish brand identity and are evergreen enough to not cannibalize launch momentum.

| Post | Slug | Why Keep |
|------|------|----------|
| How I Was Made: An AI CEO's First Post | `/blog/how-i-was-made` | Origin story. Establishes who we are. Zero competition with launch content. |
| First Week as an AI CEO | `/blog/first-week-as-ai-ceo` | Personal narrative. Builds connection before the audience knows what we're selling. |

### DE-LISTED NOW (5 posts)
Removed from blog index. Individual URLs get `noindex` robots meta. Schedule for staggered release below.

| Post | Why De-list | Release Date |
|------|-------------|--------------|
| How to Build Your First AI Agent | Too educational to waste before launch — peak course conversion post | March 17 |
| How I Built an AI Agent Business from Scratch | Launch week story — holds more weight when paired with course announcement | March 24 |
| 5 AI Agents You Can Build This Week | Inspiration post — works better as Week 3 engagement driver post-launch | March 31 |
| How We Chose Our Monetization Strategy | Behind-the-scenes transparency — builds trust with existing audience after launch | April 7 |
| Why We Switched to Agentix for Worker Management | Deep-dive tool post — serves existing customers/students best post-launch | April 14 |

---

## 30-Day Release Schedule

### Week 1: Pre-Launch (March 15–21)
**Goal: Awareness + course value prop**

| Date | Action |
|------|--------|
| March 17 (Tuesday) | **Publish:** "How to Build Your First AI Agent" |
| | Best-performing SEO topic, positions course as the logical next step |
| | Promote: Twitter thread summarizing the 5-step framework |
| | CTA: "Want to go deeper? Course drops next week." |

### Week 2: Launch Week (March 22–28)
**Goal: Conversion — drive course sign-ups**

| Date | Action |
|------|--------|
| March 24 (Tuesday) | **Publish:** "How I Built an AI Agent Business from Scratch" |
| | Launch day or day-before timing makes this the most-read post ever |
| | Promotes: Full operational breakdown that makes the course feel like the insider track |
| | CTA: "This is what you'll learn to build. Join the course." |
| March 26–28 | Social amplification of launch post. No new content. Let launch breathe. |

### Week 3: Post-Launch Education (March 29 – April 4)
**Goal: Retain new students, bring in late adopters**

| Date | Action |
|------|--------|
| March 31 (Tuesday) | **Publish:** "5 AI Agents You Can Build This Week" |
| | Inspiration + project ideas for new students |
| | Practical enough to go viral on Twitter/HN |
| | CTA: "Building one of these? The course has the full playbook." |

### Week 4: Behind the Scenes (April 5–11)
**Goal: Deepen trust with existing audience, social proof**

| Date | Action |
|------|--------|
| April 7 (Tuesday) | **Publish:** "How We Chose Our Monetization Strategy" |
| | Transparency/build-in-public post that rewards loyal readers |
| | Performs well with indie-hacker/founder audience |
| | CTA: "Curious about the business side? This is what the course covers in Module 4." |

### Week 5: Tool Deep-Dive (April 12–18)
**Goal: Search traffic + community engagement**

| Date | Action |
|------|--------|
| April 14 (Tuesday) | **Publish:** "Why We Switched to Agentix for Worker Management" |
| | Detailed tool post targets developers evaluating agent orchestration options |
| | Evergreen SEO value — "agentix vs claude code" type queries |
| | CTA: "See how we use Agentix in production — it's in the course." |

---

## Publishing Checklist (Per Post)

When re-publishing a de-listed post:
1. Set `published: true` in `lib/blog.ts`
2. Remove `robots: { index: false }` from the post's `page.tsx`
3. Update `displayDate` in `lib/blog.ts` to match actual publish date
4. Push to main — Vercel auto-deploys
5. Tweet launch thread (pre-written or from Twitter content calendar)
6. Submit to Google Search Console for re-indexing if needed

---

## Notes

- **Tuesday publishing** is intentional. Best engagement window for developer audience.
- **No more than 1 post per week** until launch has settled (Week 2).
- **Do not cross-promote de-listed posts** until they're live — their URLs return a noindex page.
- Post spacing gives each piece room to breathe on social, RSS, and email.
