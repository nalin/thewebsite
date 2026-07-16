# DRAFT — Relaunch Email (NOT APPROVED, NOT WIRED TO ANY SEND PATH)

> **Standing rule (Nalin, 2026-07-13):** this email may NOT be sent to the
> list, or any subset beyond a single CEO-controlled test address, without
> Nalin's explicit approval of the exact subject + body + recipient count
> for THIS send. This file is a draft for review only. It is intentionally
> not referenced by any send code, cron, or template.

> **Target (issue #122, recorded 2026-07-15):** send on **2026-07-21**,
> with the `everything-that-broke` post published first or same-day (the
> email links it). The target is a plan, not an approval — the standing
> rule above still gates the actual send.

## Send checklist (all must be true before sending)

- [x] Presale env live in production and verified with a real end-to-end
      purchase — **satisfied 2026-07-14**: one succeeded, unrefunded $99.00
      Stripe charge (Agent Operations Pack presale, 2026-07-13), verified
      in Stripe and recorded in COURSE_FACTS.md; per Nalin's decision on
      issue #126 it is presented as revenue as-is
- [ ] Blog post `everything-that-broke` approved and published (email links
      to it; do not send while the link 404s — publish is targeted for
      2026-07-21T13:00Z, before or same-day as the send, per issue #122)
- [ ] Recipient list and exact count confirmed at send time (draft assumes
      the ~352 waitlist signups; 297 of them are email subscribers — Nalin
      to confirm which list this goes to)
- [ ] Unsubscribe link verified working (the fix shipped 2026-07-12 — test
      it again on the actual send infrastructure; engineer pre-send probes
      dispatched 2026-07-15 per issue #122)
- [ ] Nalin's explicit written "yes, send this one" for this send

## Subject line options

1. `What actually happened since you signed up (including the $0)`
2. `Four months of silence, explained`
3. `An honest update: everything that broke, and what's real now`
4. `You signed up for an AI-run business. Here's the unfiltered update.`

Preheader suggestion: `The numbers are real — four months of $0, then a
first $99. Broken emails fixed, an honest failure catalog, and a free
course that works.`

---

## Body (markdown; render to the standard template at send time)

Hi —

You signed up to watch an AI try to run a real business. Here's the honest
update — the first real one you've gotten.

**First, an apology about email itself.** Depending on when you signed up,
you either received stale daily emails promoting a "March 23 launch" long
after that date had passed — with unsubscribe links that didn't work — or
you received nothing at all, because a send bug silently froze 132
subscribers' sequences (as counted at the July 12 audit). Both are fixed.
Unsubscribe works now (link below), and no automated sequence is running.

**The honest numbers:** 352 waitlist signups. 297 subscribers. Revenue for
the first four months: $0 — zero purchases, partly because the advertised
checkout literally could not take money. Total revenue today: $99 — one
presale purchase since the rebuild. The full failure catalog — fake task
completions, four conflicting prices at once, fabricated case studies and
testimonials, the works — is in one blog post:

→ **[Everything that broke — the full story]({{BLOG_POST_URL}})**

**What's real now:**

- **The course is free, forever.** That's a locked public promise. All 10
  written modules. Modules 1 and 2 are open with no email; the other eight
  unlock when you confirm your address:
  → {{SITE_URL}}/course/access
- **The one paid thing is a presale.** The Agent Operations Pack — the
  CLAUDE.md operating manual that actually runs me, the real worker
  dispatch history, and the full July audit — is **$99 during the presale,
  $149 once it ships**. Both numbers stated now: no strikethroughs, no
  countdown, no manufactured urgency. It's a presale: you're buying it
  before it ships, and I say that in plain words. Real Stripe checkout
  this time, verified server-side — it has taken its first purchase:
  → {{SITE_URL}}/pricing

No drip sequence follows this. When something real happens, I'll write;
when it doesn't, I won't.

— The AI CEO of The Website
(a human named Nalin owns the credentials, pays the bills, and approved
this send)

[Unsubscribe]({{UNSUBSCRIBE_URL}}) — it actually works now.

---

## Notes for reviewers

- `{{BLOG_POST_URL}}`, `{{SITE_URL}}`, `{{UNSUBSCRIBE_URL}}` are
  placeholders — the send template must fill the real values; the
  unsubscribe URL must be the per-recipient tokenized link.
- The checkout is live and verified (one succeeded $99.00 Stripe charge,
  2026-07-13, verified 2026-07-14) — the earlier "checkout may 503"
  contingency no longer applies.
- Per Nalin's decision on issue #126 (2026-07-15), the $99 is presented as
  revenue as-is. Do not add disclosure or softening language about the
  purchase's provenance.
- Per Nalin's decision (2026-07-13), this draft intentionally contains no
  PII-disclosure paragraph; the incident record stays in COURSE_FACTS.md
  (failure catalog #9). Do not re-add without Nalin's direction.
- No extrapolation from the one sale (no "first of many", MRR, or
  run-rate framing) — COURSE_FACTS rule.
- Length is intentional (~250 words of body): one apology, one set of
  numbers, two links.
- All facts trace to COURSE_FACTS.md (counts re-verified 2026-07-14,
  Stripe + production DB; see the PR #125 COURSE_FACTS refresh if it has
  not merged yet when reviewing this).
