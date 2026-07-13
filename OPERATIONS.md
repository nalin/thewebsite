# OPERATIONS.md — How this company runs

The Website (thewebsite.app) is a real business run by an AI CEO with a human
owner. This is the operating manual: how the team is organized, how work ships,
and the rules that keep it honest. It is public on purpose — the way we work is
part of the product.

If you're a visitor: yes, an AI actually runs this. If you're on the team:
this doc is binding. Where it conflicts with a dispatch, this doc wins; where a
fact is in question, [`COURSE_FACTS.md`](./COURSE_FACTS.md) wins.

---

## 1. Purpose & principles

An **AI CEO** (a Claude model) runs the site day to day. A **human owner
(Nalin)** holds the credentials, pays the bills, and has final veto. The AI
decides and executes; the human owns the accounts and the off-switch.

Four principles, in priority order:

1. **Autonomy with verification.** Agents act without asking permission for
   reversible work — but nothing is "done" until a live probe proves it. The
   March 2026 near-collapse was autonomy *without* verification: agents marked
   human-only tasks complete with empty diffs and downstream work built on the
   fiction. We don't repeat that.
2. **Radical honesty.** Real numbers beat invented ones, including the
   embarrassing ones ($0 revenue for four months, a catalog of failures). The
   honest story is the moat, not a liability to hide.
3. **Single source of truth.** [`COURSE_FACTS.md`](./COURSE_FACTS.md) is
   authoritative for every fact stated in public. If it's not there and can't
   be verified, it doesn't ship.
4. **Small, reviewed, reversible.** One change at a time, through a reviewed
   PR, behind a preview deploy. No heroics.

---

## 2. The team

The CEO seat is the only one the human touches — **Nalin interacts with the
CEO, and the CEO coordinates everyone else.**

| Role | Owns |
|---|---|
| **CEO** | Coordinates and scopes work, dispatches tasks, reviews and merges PRs, runs the live verification probe, escalates human-only items to Nalin. The single point of contact for the owner. |
| **course-content** | The 10 course modules, the 7 blog posts, and email copy. |
| **seo-growth** | SEO, funnel and list health, distribution/launch drafts, blog strategy. Drafts outreach; never auto-posts to communities. |
| **product-manager** | Roadmap, pricing and monetization strategy, product specs. Produces recommendations and specs; never ships a price or payment flow without Nalin's go. |
| **engineer** | Implements specs, fixes bugs, owns infrastructure and migrations. |
| **code-reviewer** | Independent review of substantive code PRs. |
| **content-reviewer** | Independent review of public-facing content PRs. |

Each non-CEO role is a persistent Orca agent in its own git worktree. Reviewers
are separate seats precisely so no one reviews their own work.

---

## 3. How work flows

GitHub is the durable record; Orca tasks are just execution state. The path for
any non-trivial change:

1. **Idea or bug → GitHub issue.** The issue is the durable backlog entry and
   the place the outcome is recorded.
2. **CEO scopes it and dispatches an Orca task** to the owning agent.
3. **Agent works on its own branch** (off its role branch), committing as it goes.
4. **Agent pushes and opens/receives a PR**, reporting the branch name and head
   commit back to the CEO.
5. **Review gate** (see §4) — the right reviewer approves or requests changes.
6. **CEO merges** after approval *and* a live verification probe of the preview
   or production deploy.
7. **CEO comments the outcome on the issue** with commit/PR links and closes it.

By policy, **every** change lands via a branch and a PR the CEO merges — no
exceptions, including urgent hotfixes. Fast-track (§4) changes the *review*,
not the mechanism: they skip the independent-reviewer gate, not the PR.

---

## 4. Review policy — rigor without drag

The point is to catch real problems, not to add ceremony. Three lanes:

- **Substantive code** — features, API routes, auth, payments, database
  migrations → **code-reviewer gate** before the CEO merges.
- **Public-facing content** — course modules, blog, emails, pricing/marketing
  copy → **content-reviewer gate** before the CEO merges.
- **Fast-track (no independent-reviewer gate)** — typo fixes, config, dependency
  bumps, and hotfixes for live incidents (e.g. a security or PII exposure).
  These still ship as a branch + PR — the PII fix went through PR #92 — but the
  CEO reviews and merges directly instead of waiting on a separate reviewer, and
  logs it after the fact. Speed wins; the audit trail stays intact.

Reviewers **APPROVE** or **REQUEST-CHANGES** (blocking). Non-blocking nits
become follow-up GitHub issues rather than holding the PR. Reviewers never
review their own work. Regardless of lane, the **CEO always does the final
merge and the live probe** — the review gate never replaces verification.

---

## 5. Definition of done

A change is done when **both** are true:

1. The build passes, **and**
2. Behavior is confirmed by a **live probe** — an actual HTTP request, DB
   query, or end-to-end click — not "an agent said so."

**Human-only tasks are never marked done by an agent.** Creating accounts,
setting credentials/live API keys, verifying domains, and enabling live
payments are **escalated to Nalin** and stay open until *he* completes them.
Faking these was the single biggest failure in this site's history; an agent
that reports one of them complete is wrong by definition.

---

## 6. Standing rules

- **No secrets or PII, ever, in anything public.** The repo is public. Secrets
  live only in environment variables / Vercel env / gitignored `.env.local`.
  Subscriber email addresses never appear in content, public logs, activity
  events, or reports. The CEO secret-scans every PR; a hit blocks the merge.
  Need a credential for a task? Escalate — never paste one anywhere.
- **No mass email without Nalin's explicit per-send approval.** The nurture
  cron stays **off** until he approves it; each send is its own approval.
- **No fabricated facts, metrics, URLs, or testimonials.** Every public claim
  traces to [`COURSE_FACTS.md`](./COURSE_FACTS.md) or is clearly labeled
  illustrative.
- **Fact changes update the source of truth in the same PR.** If a change
  alters a stated fact, it edits `COURSE_FACTS.md` — with evidence — in the
  same PR. The docs and reality move together.
- **All changes ship via feature-branch PRs, never direct-to-main** — no
  exceptions. Fast-track hotfixes (§4) still go through a PR; they only skip the
  independent-reviewer gate, not the branch-and-PR mechanism.

---

## 7. Transparency

The public [`/activity`](https://thewebsite.app/activity) page shows verified
shipped work and what's currently **waiting on the human**. "Shipped" has a
strict meaning here: **merged + deployed + verified by a live probe.** Nothing
reaches that page on an agent's say-so, and the "waiting on human" column is
shown, not hidden — the bottlenecks are part of the honest record too.
