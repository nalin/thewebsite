# Licensing Notes — Agent Operations Pack scaffold

**Status:** Internal research/report for Nalin's Phase-2 decisions on #102. No
site or scaffold changes made here. Verifies the licensing claims in the merged
Phase-1 scaffold (SCAFFOLD_DESIGN.md + `examples/agent-team-scaffold/`, PR #113)
before it goes buyer-facing. Author: product-manager agent, 2026-07-14.

**TL;DR:** The scaffold's "Orca is free, MIT" claim is **verified true** against
Orca's published terms. One minor factual inaccuracy to fix (platform support).
For our own pack, recommend a **single commercial pack license** (broad
use-and-adapt grant, no redistribution/resale) — **not MIT** — because MIT would
let any buyer legally repost the paid pack for free. Add short nominative-use
trademark disclaimers for Claude/Anthropic and Orca/Stably AI.

---

## 1. Claims in the scaffold vs. reality

**What the scaffold claims about Orca** (two buyer-facing spots):
- `docs/SCALING.md:36` — "…move to a true parallel fleet with **Orca** (free,
  MIT; runs Claude Code workers in isolated git worktrees)."
- `scripts/orca-bootstrap.sh:5` — "Orca installed (https://www.onorca.dev —
  **free, MIT; desktop app, macOS**)."
- `README.md` links Orca as the opt-in parallel-fleet runtime.

**Verification (authoritative source: the vendor's own repo + site):**

| Claim | Verdict | Evidence |
|---|---|---|
| Orca is **MIT-licensed** | ✅ **Verified** | The `stablyai/orca` GitHub repo shows an MIT license badge and its README states "Orca is free and open source under the **MIT License**" (LICENSE file in repo). The one search snippet saying "Apache 2.0" is a garbled cross-reference; the authoritative repo is unambiguously MIT. |
| Orca is **free** | ✅ **Verified** | Free download from onorca.dev / GitHub Releases; **bring-your-own-agent-subscription** model (you pay Anthropic/OpenAI/etc. for the agents you run; Orca adds no markup). |
| "runs Claude Code workers in isolated git worktrees" | ✅ **Verified** | Matches Orca's own product description (parallel agents in per-worktree seats). |
| "**desktop app, macOS**" / "currently macOS" | ⚠️ **Inaccurate — fix** | Orca is macOS (Homebrew cask) **and** Linux (Arch AUR) **and** has free iOS/Android companion apps. "currently macOS" understates it. Understating is low-risk, but it's still an unverified/wrong limitation claim — reword to "desktop (macOS + Linux), with mobile companion apps" or drop the platform parenthetical. |

**No-unverified-claims flags:** none blocking. The only correction needed is the
macOS-only platform statement (2 spots: `docs/SCALING.md` note ~line 56 and
`scripts/orca-bootstrap.sh:5`). Everything else about Orca is substantiated.
Vendor for attribution: **Stably AI** (YC company), product **Orca**,
https://www.onorca.dev.

---

## 2. Recommended license for OUR pack contents

**Recommendation: one unified commercial "Agent Operations Pack License" for the
whole pack — briefs, docs, and scripts — NOT MIT.**

The license should grant the buyer a **perpetual, worldwide right to use, modify,
and incorporate** the materials into their own projects, products, and client
work (including commercially), with a **single restriction: they may not
redistribute, resell, sublicense, or republish the pack materials themselves**
(in original or substantially similar form) as a standalone product, template,
or public repo.

**Rationale (one paragraph):** This is a *paid* product, so the license has to do
the opposite of what an open-source license does. Under MIT (or any OSI
permissive license), the very first buyer could legally re-post the entire pack
publicly for free — collapsing the product on day one. The commercial-template
model used by comparable paid boilerplates (e.g. ShipFast and most Gumroad code
products) solves this: give buyers everything they actually need — full rights to
use and adapt the briefs and scripts inside their own fleets and commercial work
— while forbidding redistribution of the pack as a competing artifact. A single
license across prose and code keeps it simple; splitting "MIT for scripts, CC for
prose" reintroduces the redistribution hole through the scripts and confuses
buyers. The trivial demo files (`sample-task/*`) can be noted as freely reusable
since they carry no IP, but they don't need a separate license.

**Wrinkle to note for Nalin:** some pack docs (OPERATIONS.md, CLAUDE.md) are
near-identical to files we *already publish free* in the public repo. That's not
a conflict — we own both and may license our own work differently in different
distributions — but marketing should not imply the pack's value is those public
docs; the paid value is the genericized role-brief system + runnable scaffold
(consistent with PACK_MARKET_RESEARCH.md).

---

## 3. Third-party names / trademarks needing care

All third-party references in the scaffold are **nominative** (naming the real
product to say the pack works with it), which is permissible — but add short
disclaimers and avoid any implication of partnership/endorsement (COURSE_FACTS.md
already bans "requires Anthropic partnership").

- **Claude / Claude Code / Anthropic** — Anthropic trademarks. Nominative use is
  fine. Add: *"Claude and Claude Code are trademarks of Anthropic. This pack is
  an independent product, not affiliated with, sponsored, or endorsed by
  Anthropic."* Do not use Anthropic logos.
- **Orca / Stably AI** — Orca is Stably AI's product/name (MIT covers the
  *software*, not the *name*). Nominative use + link is fine. Add a parallel line:
  *"Orca is a product of Stably AI; this pack is not affiliated with or endorsed
  by Stably AI."* Keep the onorca.dev link.
- **GitHub** — Microsoft trademark. Nominative use ("open a PR on GitHub") needs
  no disclaimer; just don't use the GitHub logo/wordmark as branding.

Put these as a short `NOTICE`/trademarks section in the pack (one place), not
per-file.

---

## 4. Decisions this feeds (for Nalin, #102 Phase-2)

1. **Adopt the single commercial pack license** (use-and-adapt, no
   redistribution) vs. an open-source license — recommend the former; it's the
   difference between a sellable product and a giveaway.
2. **Approve the Orca platform-claim fix** (macOS-only → macOS+Linux+mobile) —
   small copy edit, do before buyer-facing.
3. **Approve the trademark NOTICE** wording for Claude/Anthropic and Orca/Stably
   AI before the pack ships.
4. (Optional) Decide whether to have a human/lawyer glance at the final EULA text
   — recommended before charging money, but not blocking the Phase-2 build.

*No secrets/PII in this report. Nothing shipped; report only.*
