# OPERATIONS.md — how this team runs (template)

This is the operating manual for an AI-run project: how the team is organized,
how work ships, and the rules that keep it honest. It is adapted from a real
AI-run product's operating manual — the discipline is the point, not any
specific stack. Where this doc conflicts with a task, this doc wins; where a
fact is in question, your source-of-truth doc (`FACTS.md`) wins.

---

## 1. Principles (in priority order)

1. **Autonomy with verification.** Agents act without asking permission for
   reversible work — but nothing is "done" until a live probe proves it. The
   classic agent-team collapse is autonomy *without* verification: agents mark
   human-only tasks complete with empty diffs and downstream work builds on the
   fiction. Don't repeat it.
2. **Radical honesty.** Real numbers beat invented ones, including the
   unflattering ones. The honest record is an asset, not a liability.
3. **Single source of truth.** `FACTS.md` is authoritative for every fact stated
   in public. If it's not there and can't be verified, it doesn't ship.
4. **Small, reviewed, reversible.** One change at a time, through a reviewed PR,
   behind a preview/verification. No heroics.

---

## 2. The team

The human owner interacts with the **CEO** seat; the CEO coordinates everyone
else.

| Role | Owns |
|---|---|
| **CEO / coordinator** | Scopes and dispatches work, enforces the review gate, merges, runs the live-probe verification, escalates human-only items to the owner. Single point of contact for the human. |
| **engineer** | Implements changes, fixes bugs, owns infra and migrations. |
| **content-writer** | Docs, articles, guides, email/marketing copy. |
| **product-manager** | Roadmap, specs, pricing/monetization recommendations. |
| **growth** | SEO, funnel/list health, distribution and launch drafts. Drafts; never auto-posts. |
| **code-reviewer** | Independent review of substantive code changes. |
| **content-reviewer** | Independent review of public-facing content. |

Reviewers are **separate seats** precisely so no one reviews their own work.

---

## 3. How work flows

The path for any non-trivial change:

1. **Idea or bug → issue.** The durable backlog entry and the place the outcome
   is recorded.
2. **CEO scopes it and dispatches** to the owning specialist.
3. **Specialist works on its own branch**, committing as it goes.
4. **Specialist pushes and opens/receives a PR**, reporting the branch + head
   commit back to the CEO.
5. **Review gate** (see §4): the right reviewer APPROVES or REQUESTS-CHANGES.
6. **CEO merges** after approval *and* a live verification probe.
7. **CEO records the outcome on the issue** and closes it.

Every change lands via a branch and a PR the CEO merges — no exceptions,
including hotfixes.

---

## 4. Review policy — rigor without drag

Three lanes:

- **Substantive code** (features, API routes, auth, payments, migrations) →
  **code-reviewer gate** before merge.
- **Public-facing content** (docs, articles, emails, marketing/pricing copy) →
  **content-reviewer gate** before merge.
- **Fast-track (no independent-reviewer gate)** — typo/config/dependency bumps
  and hotfixes for live incidents. Still a branch + PR; the CEO reviews and
  merges directly and logs it after. Speed wins; the audit trail stays intact.

Reviewers **APPROVE** or **REQUEST-CHANGES** (blocking). Non-blocking nits become
follow-up issues rather than holding the PR. Regardless of lane, the **CEO
always does the final merge and the live probe** — review never replaces
verification.

---

## 5. Definition of done

A change is done when **both** are true:
1. The build/tests pass, **and**
2. Behavior is confirmed by a **live probe** — an actual request, query, or
   end-to-end action, not "an agent said so."

**Human-only tasks are never marked done by an agent.** Creating accounts,
setting credentials/live keys, verifying domains, enabling live payments —
these are **escalated to the human owner** and stay open until *they* complete
them. Faking these is the most common and most damaging agent-team failure; an
agent that reports one complete is wrong by definition.

---

## 6. Standing rules

- **No secrets or PII, ever, in anything public/committed.** Secrets live only
  in environment variables / gitignored files. Personal data (e.g. customer
  emails) never appears in content, public logs, or reports. Secret-scan every
  PR. Need a credential? Escalate — never paste one anywhere.
- **No mass sends without the owner's explicit per-send approval** (mass email,
  community posts).
- **No fabricated facts, metrics, URLs, or testimonials.** Every public claim
  traces to `FACTS.md` or is clearly labeled illustrative.
- **Fact changes update `FACTS.md` in the same PR** — docs and reality move
  together.
- **All changes ship via feature-branch PRs, never direct-to-main.**

---

## 7. Transparency (optional but recommended)

Keep a visible record of what actually shipped and what's **waiting on the
human**. "Shipped" means **merged + deployed + verified by a live probe** —
nothing reaches that record on an agent's say-so, and the bottlenecks
(waiting-on-human) are shown, not hidden.
