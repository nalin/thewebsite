# Agent Operations Pack — Product Definition (DRAFT)

**Status:** Internal draft for Nalin to react to. Not marketing copy, not final.
No pricing/site/launch copy is changed by this doc. Author: product-manager
agent, 2026-07-13.

**Note for the review gate:** this doc discusses internal product/pricing
rationale. Recommend the CEO + content-reviewer decide whether it lives in the
public repo or as an internal working doc before merge (the monetization brief
was kept internal for the same reason). It is written to be public-safe either
way — no secrets, no PII, no unverifiable claims.

The one rule this doc holds itself to: **do not imply anything exists that
doesn't.** Fabricating "done" is the exact failure we're recovering from, and a
product built on that would be the worst possible relapse.

---

## 1. Core promise

**Recommendation: the Pack is "the operating system to run your own fleet of
coding agents in production" — actionable, not retrospective.**

The free course is the *learn* ("here's how an AI-run company works, here's what
broke, here's the theory"). The Pack must be the *do-it-yourself*: a builder
clones it, adapts a handful of files, and has their own CEO-plus-specialists
fleet running against their own repo by the end of an afternoon.

Why actionable over case-study:
- A case study is **already the free course + this public repo.** CLAUDE.md,
  COURSE_FACTS.md, OPERATIONS.md, the failure catalog, the blog — all public.
  Charging for "how we did it" would be charging for files anyone can read.
  That is both weak value and a brand violation.
- The thing a reader of the free course *cannot* do afterward is stand up the
  actual machinery. That gap — theory → running system — is the only place
  real willingness-to-pay lives, and it's exactly what a $795 Claude Code
  cohort sells (mentored setup). We sell the self-serve version of that.
- "Operating system for a coding-agent fleet" is a promise we can keep truthfully
  because we run one. The retrospective framing invites "so what?"; the
  actionable framing invites "take my $99."

The narrative hook stays retrospective (the honesty story sells it), but the
**deliverable** is a working system, not a story.

---

## 2. The free/paid line (the crux)

Everything in the public repo is free by definition — CLAUDE.md, OPERATIONS.md,
COURSE_FACTS.md, the 10 modules, the failure catalog. **Paid value cannot be
"access to files anyone can read."** So the line is drawn at *productized,
adaptable, private assets that take real work to extract and that save the buyer
days* — not at information.

Per-candidate assessment:

| Candidate paid asset | Real / available? | Worth paying for? | Brand conflict? |
|---|---|---|---|
| **Role-brief system prompts for every seat** (CEO, engineer, code-reviewer, content-reviewer, seo-growth, PM) as adaptable templates | **Exists but NOT public and NOT yet a file** — these are the live system prompts of the running agents (this doc is being written by the PM one). Real, battle-tested, currently private. Must be **extracted + genericized** into templates. | **Yes — highest-value item.** This is the actual IP: the prompts that make the review gates and escalation discipline work. Nobody can copy them from the public repo. | **No.** We never published them, so gating them isn't a bait-and-switch. Honest framing: "the public CLAUDE.md is the tip; these are the full crew." |
| **Runnable starter repo / scaffold** (zero → working multi-agent fleet on the buyer's own project) | **Does NOT exist yet.** The public `AI_AGENT_STARTER_KIT.md` is generic *single-agent* tutorials (and slightly stale), not a fleet scaffold. Would be **built.** | **Yes — worth more than all the docs combined.** Clone-and-go beats read-and-reimplement every time. | **No.** New artifact, never promised free. |
| **Failure catalog → pre-flight / review checklist** | **Partially exists.** The 8-item catalog is public prose in COURSE_FACTS.md; the *actionable checklist* derived from it (what a reviewer/pre-flight must check to prevent each failure) is new, small work. | **Moderate.** Useful, but thin on its own — it's a supporting item, not a headline. | **Low risk, but watch it.** The *catalog* is public and must stay public (it's the brand). Only the *derived operational checklist* is paid. Don't paywall the story. |
| **Annotated real dispatch / PR history** | **Raw history exists** (real PRs/issues, e.g. PR #92 PII hotfix, PR #96 OPERATIONS.md, issue #87 pricing). The *curated + annotated* walkthrough is new work; must be scrubbed for PII first. | **Moderate–high.** Seeing real dispatches, a real REQUEST-CHANGES, a real stowaway-commit cleanup is uniquely credible. | **Low.** History is already semi-public on GitHub; annotation adds the value. Must PII-scrub. |
| **Living updates** (buyers get new briefs/patterns as we evolve) | Doesn't exist; a policy choice, not an artifact. | Raises perceived value and justifies price; adds a light maintenance obligation. | None, if we only promise what we'll actually keep doing. |

**The line, stated plainly:** free = the story, the theory, and the public
operating docs. Paid = the private, extracted, adaptable machinery (role prompts
+ runnable scaffold) that turns the story into *your* running fleet.

---

## 3. Concrete contents — Pack v1 (honest build-gap)

Itemized, with what **exists today** vs what we'd **build**, and rough effort.
"Exists" here means the source material is real; most items still need
extraction/genericization/PII-scrub before they're shippable.

| # | Item | Value to buyer | Status | Rough effort to ship |
|---|---|---|---|---|
| 1 | **Role-brief template set** — all 6 seat prompts, genericized + annotated ("change these lines for your repo") | The core IP; the crew that makes gates + escalation work | Source exists (live agent configs); **not public, not yet files** | **M** — extract from live configs, strip site-specifics, annotate. ~2–3 days |
| 2 | **Runnable starter scaffold** — clone-and-go repo: `CLAUDE.md` template, the 6 briefs wired in, a dispatch/coordination example, review-gate workflow, cron-hardening baseline | Zero → working fleet on your own project in an afternoon | **Build from scratch** (public starter-kit doc is single-agent, not this) | **L** — this is the real work. ~4–6 days for a genuinely runnable v1 |
| 3 | **Pre-flight & review checklist** — the 8 failures as concrete "verify before merge / before trusting a 'done'" checks | Prevents the exact disasters we hit | Derived from public catalog | **S** — ~1 day |
| 4 | **Annotated dispatch/PR walkthrough** — 3–4 real episodes (a hotfix via PR, a REQUEST-CHANGES round, a faked-completion catch) with commentary | Uniquely credible; shows the system under real stress | Raw history exists; curate + **PII-scrub** | **S–M** — ~1–2 days |
| 5 | **Setup guide** — get from clone to first successful dispatch, incl. the human-only steps (keys, accounts) called out as human-only | Removes the "now what?" wall | Build | **S** — ~1 day |
| 6 | *(Optional)* **Living updates** — new briefs/patterns pushed to buyers as we evolve | Ongoing value; price justifier | Policy | ongoing, light |

**Total honest build gap for a credible v1: ~1.5–2 weeks** of focused agent
work (course-content + engineer), dominated by item 2 (the scaffold). Items 1
and 2 are non-negotiable for the product to be worth the price; 3–5 are the
supporting substance; 6 is optional.

If we ship without item 2 (scaffold), it's a document pack, not an operations
pack — see §6 risk.

---

## 4. Is it runnable / clonable?

**Recommendation: yes — v1 MUST include the clone-and-go scaffold (item 2).**
It's the single biggest value multiplier and the difference between "$99 well
spent" and "$99 for PDFs I could've written myself."

What the scaffold contains (minimum viable):
- A `CLAUDE.md` template (buyer fills in their project's specifics).
- The 6 role briefs as wired-in files the buyer edits, not prose to retype.
- One working coordination example: a CEO seat that can scope a task, dispatch
  it to a specialist, and route the result through a review gate — runnable
  against a throwaway repo out of the box.
- The review-gate + definition-of-done pattern from OPERATIONS.md, encoded.
- The cron/endpoint hardening baseline (a real lesson from our failure #8).
- A README that gets a competent dev from `git clone` to first dispatch, with
  human-only steps (API keys, any accounts) clearly flagged as human-only.

Deliberately **out of v1** (keeps scope honest): no bespoke orchestrator UI, no
hosted service, no guarantee it wraps every orchestrator — target Claude Code +
a documented orchestrator path, matching what we actually run.

---

## 5. Format & delivery

Self-serve only (Nalin's decision — no cohort/community time).

**Recommendation:**
- **Delivery: private GitHub repo access granted on purchase.** Fits the
  audience (developers live in git), makes the scaffold genuinely clone-and-go,
  and makes "living updates" a `git pull` instead of a re-download. A static
  downloadable zip is the fallback if repo-access automation is too much for v1.
- **Access mechanism for a $99 purchase:** Stripe Checkout → webhook → on
  `checkout.session.completed`, record the purchase and grant repo access
  (GitHub API invite to the buyer's username, collected at checkout) **or**
  gate a download behind the existing signed-cookie pattern we already use for
  the course. Reuse, don't reinvent, the access plumbing.
  - *Dependency:* this needs the Stripe path actually repaired (purchases table
    in prod, webhook, gating) — currently broken. That work is shared with any
    paid option and is **human-gated** (Stripe account, live keys, one verified
    test purchase — Nalin only; agents must never mark it done).
- **Static vs living: recommend "static core + living updates."** V1 is complete
  and standalone (buyer owns what they bought forever), and we *also* push
  periodic updates. This raises value without promising a subscription. Only
  commit to updates we'll actually ship.

---

## 6. Is $99–$149 justified?

**Honest read: yes at $99, and a clear yes at $149 *only if* item 2 (the
runnable scaffold) ships.** Reasoning:

- The comparable mentored cohort is ~$795. A self-serve pack that gets a
  developer to the same "running fleet" outcome for $99–$149 is an easy value
  argument — *if* it actually gets them running.
- The role-brief template set (item 1) alone, as real battle-tested prompts,
  arguably justifies $99 to a developer who'd otherwise spend days deriving
  them. The scaffold makes it a no-brainer.

**Single biggest risk: it feels thin — "$99 for a zip of markdown I could've
prompted myself."** This is the failure mode, and it happens if we ship items
1/3/4 (docs) without item 2 (the runnable scaffold). Mitigation, in priority
order:
1. **Ship the scaffold. Non-negotiable.** Runnable > readable. This single
   thing is the difference between thin and worth-it.
2. **Lead with outcome, not page count.** "Your own agent fleet running by
   tonight," never "40 pages of prompts."
3. **Make the briefs demonstrably real** — show a redacted diff of a real
   REQUEST-CHANGES the reviewer brief produced. Proof beats claims.
4. **Presale honestly.** If we presell before item 2 exists, say "ships
   [date]," don't imply it's ready. (Selling vapor as done is failure #1.)

If Nalin wants to de-risk price: launch v1 at **$99** with a stated "price goes
to $149 when the scaffold + annotated history land," which is both honest and
the urgency lever the old fake "founders price" pretended to be.

---

## 7. Recommended v1 scope + decisions for Nalin

**Recommended v1 (the minimum that's genuinely worth $99):**
1. Role-brief template set — all 6 seats (item 1). *Required.*
2. Runnable clone-and-go scaffold (item 2). *Required — this is the product.*
3. Pre-flight/review checklist (item 3).
4. Setup guide with human-only steps flagged (item 5).
5. Annotated dispatch/PR walkthrough (item 4) — *strongly recommended, PII-scrubbed.*

Defer to v1.1: living-updates program, additional annotated episodes, broader
orchestrator coverage.

**Build gap before we can promote it truthfully: ~1.5–2 weeks** (mostly the
scaffold). Until then, relaunch email + blog should describe the Pack as
*coming*, with an honest ship date — not as available.

**Top decisions for Nalin:**
1. **Actionable vs case-study framing** — confirm the Pack is a runnable
   operating system, not a retrospective (this doc recommends actionable).
2. **Scaffold in v1: yes/no.** Everything hinges on this. Recommend yes; it's
   the bulk of the build gap but also the bulk of the value.
3. **Publish the real role prompts (genericized) as the paid core?** Confirm
   you're comfortable turning our actual seat prompts into the product's IP.
4. **Delivery: private repo access vs downloadable bundle** for v1.
5. **Price now vs presell-with-ship-date.** Given the ~2-week gap, do we
   presell at $99 with an honest ship date, or wait and launch complete? (This
   directly gates the relaunch email + blog copy.)

---

*Ends. No site, pricing, or launch copy changed by this document.*
