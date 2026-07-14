# SCAFFOLD_DESIGN.md — Exportable Agent-Team Scaffold (Phase 1: design + research)

**Status:** internal design doc. Not the full pack build — this resolves the
five core design questions and ships a working prototype under
[`examples/agent-team-scaffold/`](./examples/agent-team-scaffold/) so we can see
it work before we promote it.

**Product goal (Nalin's words):** buyers of the $99 Agent Operations Pack should
be able to "mimic what we do as closely as possible" with "minimal time to get
started in a way that lets them scale." The specific ask: research exporting our
Orca agent team as the scaffold.

---

## 0. What we actually run (the thing being packaged)

- A **7-seat team** created in Orca: one CEO seat + six specialists
  (`course-content`, `seo-growth`, `product-manager`, `engineer`,
  `code-reviewer`, `content-reviewer`). Each specialist is a persistent Claude
  Code worker in its **own git worktree**, created with
  `orca worktree create --name <seat> --agent claude --prompt "<role brief>"`.
- Work is **dispatched** by the CEO via `orca orchestration task-create` +
  `orca orchestration dispatch --inject`, and reported back with `worker_done`.
- The **operating layer already exists as real docs**:
  [`OPERATIONS.md`](./OPERATIONS.md) (principles, team, work flow, review lanes,
  definition-of-done, standing rules), the GitHub interaction model
  (issue → CEO scopes → dispatch → branch → PR → independent review gate →
  merge → live-probe verify → close), and the
  [`COURSE_FACTS.md`](./COURSE_FACTS.md) single-source-of-truth pattern.

The **IP is the operating discipline**, not our specific stack: escalate
human-only tasks, verify-don't-assume, one source of truth, independent review
gates, small reviewed reversible changes. That discipline is what we package.

## 0.1 Research finding: "export" has no native button

Confirmed against the Orca CLI surface: Orca has `worktree create/rm`,
`orchestration run/task-create/dispatch`, and `automations` — **no
export/import or team-template command.** So "export our team" cannot be a
one-liner dump. **Export = package the artifacts that define the team:** the
seven role briefs + the operating docs + a bootstrap script that recreates the
seats. Those artifacts are portable; the runtime is swappable.

Second finding: **Claude Code has a native, Orca-free way to run a role team** —
`.claude/agents/*.md` subagent files (name / description / tools / system
prompt), invoked through the Task tool. This is the zero-dependency path and
becomes the default entry point of the scaffold.

---

## 1. Portability fork — RECOMMENDATION: (c) Hybrid

Ship **`.claude/agents/*` for a zero-dependency start, plus an optional Orca
bootstrap for the full parallel fleet.** Default the buyer into the native
Claude Code path; document Orca as the scale-up.

### Evaluation

| Criterion | (a) Orca-native bootstrap | (b) Claude Code subagents | (c) Hybrid |
|---|---|---|---|
| **Time to first working dispatch** | 20–40 min (install Orca desktop app, learn CLI, create 7 worktrees) | **~5 min** (copy `.claude/`, run `claude`, invoke a subagent) | **~5 min** to first dispatch, Orca available when wanted |
| **Scalability** | Excellent — true parallel worktree fleet, persistent seats | Good — many subagents, parallel Task fan-out, but one repo checkout / one session | Excellent — start native, graduate to the real fleet |
| **Dependency burden** | High — Orca **and** Claude Code (Orca is a desktop app, currently macOS) | **Minimal** — just Claude Code + an API key | Low at entry, opt-in at scale |
| **Fidelity to what we run** | Highest — literally recreates our seats | Medium — captures roles, review gates, discipline; not worktree isolation | High — same briefs power both runtimes |

### Reasoning

- **(a) alone** maximizes fidelity but fails the "minimal time to get started"
  requirement: it front-loads a desktop-app install and a new CLI before the
  buyer sees any value, and it hard-couples the product to a macOS dependency.
- **(b) alone** nails time-to-value and dependency burden and is genuinely
  useful, but it under-delivers on "lets them scale": subagents share one
  session and one checkout, so it's not the parallel, isolated, persistent fleet
  we actually run.
- **(c) hybrid** is the only option that satisfies *both* halves of the ask.
  The **same seven role briefs** are the source of truth; they render as
  `.claude/agents/*.md` for the native path and are fed to
  `orca worktree create --prompt` by the bootstrap for the fleet path. Nothing
  is rewritten to scale up — you change the runtime, not the team.

**Decision:** Hybrid, with the native subagent path as the out-of-the-box
default and Orca as the documented Level-3 upgrade (see §3).

---

## 2. Time-to-start — target: minutes

**Shortest path from "download bundle" to "a specialist completes a real task,
reviewed by a gate":**

1. **Prerequisites** (stated up front in the README): Claude Code installed
   (`npm install -g @anthropic-ai/claude-code`) and authenticated (an Anthropic
   API key **or** a Claude subscription login). Git. That's it for the native
   path. (Orca only if/when you take the Level-3 scale-up.)
2. **Run `scripts/setup.sh /path/to/your/repo`** — copies `.claude/agents/*`,
   `CLAUDE.md`, `OPERATIONS.md`, `FACTS.md`, and `docs/` into the target repo,
   then prints the exact first-run command. Idempotent; never overwrites an
   existing `CLAUDE.md` without `--force`.
3. **`cd` into your repo, run `claude`, and dispatch the first task** — as the
   coordinator (root session, guided by `CLAUDE.md`) you hand a real task to the
   `engineer` subagent via the Task tool, then hand its diff to the
   `code-reviewer` subagent. Review gate → you apply/verify.

The bundled **`sample-task/`** is a self-contained first run that needs no
buyer repo: a tiny project with a deliberately failing test and a one-line task
("make the test pass"). The buyer watches `engineer` fix it and `code-reviewer`
approve it — the full loop in one command, in a couple of minutes.

**Why this is minutes, not hours:** no infrastructure, no accounts to create, no
Orca install on the critical path. The only hard prerequisite (Claude Code + a
key) is something an Agent-Ops-Pack buyer almost certainly already has.

---

## 3. Scale path — progressive adoption (Level 0 → 3)

The buyer is never asked to adopt the whole system at once. Four levels, each
independently useful, documented in [`docs/SCALING.md`](./examples/agent-team-scaffold/docs/SCALING.md):

- **Level 0 — One specialist + one reviewer (minutes).** Root Claude session =
  CEO. Delegate a task to `engineer`; gate it with `code-reviewer`. This alone
  is a real quality upgrade over ad-hoc prompting: the reviewer is a *separate*
  context that didn't write the code.
- **Level 1 — The full role set, still one session.** Drop in the other
  specialists (`content-writer`, `product-manager`, `growth`,
  `content-reviewer`). The CEO routes each task to the seat whose `description`
  matches. Two maker seats, two reviewer seats, PM and growth.
- **Level 2 — Adopt the operating discipline.** Turn on the OPERATIONS.md
  workflow: GitHub issue → scope → branch → PR → the *right* review lane →
  merge → **live-probe verify** → close; a single `FACTS.md` source of truth;
  the standing rules (no secrets/PII, escalate human-only work, no fabrication).
  This is where a team of subagents becomes a *company*.
- **Level 3 — The real parallel fleet (Orca).** Install Orca and run
  `scripts/orca-bootstrap.sh`. It recreates the seven seats as persistent Claude
  Code workers in isolated worktrees from the **same briefs**, so the CEO can
  dispatch many specialists working **in parallel** on separate branches — the
  configuration we actually run. Nothing about the briefs or the workflow
  changes; only the execution substrate does.

The through-line: **the briefs and the operating docs are constant across all
four levels.** You climb the ladder by changing how many seats run and how
isolated they are — never by rewriting the team.

---

## 4. What's in the bundle — file tree

Genericized (no thewebsite specifics, no secrets/PII), shipped in the pack.
Prototyped now under `examples/agent-team-scaffold/`:

```
agent-team-scaffold/
  README.md                      # what it is, the fork, the 5-minute quickstart
  CLAUDE.md                      # project-instructions template + CEO/coordinator operating brief
  OPERATIONS.md                  # the operating manual, genericized
  FACTS.md                       # single-source-of-truth template
  docs/
    GITHUB_INTERACTION_MODEL.md  # issue → scope → dispatch → PR → review → merge → verify → close
    SCALING.md                   # Level 0→3 progressive adoption
  .claude/
    agents/                      # native Claude Code subagents (zero-dep path)
      engineer.md
      code-reviewer.md
      content-reviewer.md
      product-manager.md
      growth.md
      content-writer.md
  roles/
    ceo.md                       # CEO/coordinator brief (Orca seat + reference; native = root session)
  scripts/
    setup.sh                     # copy .claude/ + docs into your repo; prints first-run command
    dispatch.sh                  # helper documenting the dispatch pattern (native + Orca forms)
    orca-bootstrap.sh            # optional: recreate the 7-seat parallel fleet in Orca
  sample-task/                   # a runnable first task (failing test → engineer fixes → reviewer approves)
    README.md
    package.json
    sum.js
    sum.test.js
```

**Role briefs (the IP), genericized.** Our six seats map to six specialist
briefs + the CEO. Names kept recognizable but content stripped of stack- and
site-specifics; the *discipline* is preserved (escalate human-only tasks,
verify-don't-assume, single source of truth, independent review, small reviewed
changes):

| Our seat | Bundled brief | Genericization |
|---|---|---|
| CEO | `roles/ceo.md` | coordinator/dispatcher/verifier; stack-agnostic |
| engineer | `.claude/agents/engineer.md` | "implements changes on any codebase"; placeholders for build/test commands |
| code-reviewer | `.claude/agents/code-reviewer.md` | read-only reviewer; APPROVE / REQUEST-CHANGES |
| content-reviewer | `.claude/agents/content-reviewer.md` | reviews public-facing copy vs the source of truth |
| product-manager | `.claude/agents/product-manager.md` | specs & recommendations; never ships pricing/payments without human go |
| seo-growth | `.claude/agents/growth.md` | growth/distribution drafts; never auto-posts |
| course-content | `.claude/agents/content-writer.md` | writes content/docs from the source of truth |

**Why the CEO is a brief, not a native subagent:** in plain Claude Code,
subagents can't spawn subagents, so the *root* session is the coordinator (CEO),
guided by `CLAUDE.md` + `roles/ceo.md`. In Orca, the CEO is its own seat. Same
brief, two homes — which is exactly the hybrid thesis.

---

## 5. Prototype (built now)

The recommended hybrid is prototyped under
[`examples/agent-team-scaffold/`](./examples/agent-team-scaffold/): the six
genericized subagent files, the CEO brief, a genericized `CLAUDE.md` /
`OPERATIONS.md` / `FACTS.md`, the GitHub-interaction and scaling docs, a
`setup.sh` that installs the scaffold into any repo, an `orca-bootstrap.sh` for
the Level-3 fleet, and a `sample-task/` that runs the full
engineer → code-reviewer loop on a failing test.

It is **not wired into the Next.js site** — it lives in `examples/` and is
excluded from the app build. Code-reviewer reviews the prototype next; the full
pack build (polish, packaging, buyer-facing README, licensing) is a later phase.

### Open questions for a later phase (not blocking Phase 1)
- **Licensing/attribution** of the shipped briefs and docs (the pack is paid;
  Orca itself is MIT — our briefs are our IP).
- **Windows/Linux Orca availability** for the Level-3 path (native path is
  cross-platform already).
- Whether to ship a **hosted "try it" sandbox** vs. local-only.
- How opinionated the `dispatch.sh` helper should be vs. leaving orchestration
  to the human coordinator.
