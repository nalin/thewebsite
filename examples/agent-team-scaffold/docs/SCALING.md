# SCALING.md — from one specialist to a parallel fleet

You do not adopt the whole system at once. Four levels, each independently
useful. The **role briefs and operating docs stay constant across all four** —
you climb the ladder by changing how many seats run and how isolated they are,
never by rewriting the team.

## Level 0 — One specialist + one reviewer (minutes)
Your root `claude` session is the CEO. Delegate a real task to the `engineer`
subagent (Task tool), then gate its diff with the `code-reviewer` subagent.
Already a real upgrade over ad-hoc prompting: the reviewer is a *separate*
context that didn't write the code. Try the bundled `sample-task/` to see the
whole loop in one run.

## Level 1 — The full role set, still one session
Keep all six specialist subagents in `.claude/agents/`. The CEO (you + the root
session) routes each task to the seat whose `description` matches: `engineer`
and `content-writer` make things; `code-reviewer` and `content-reviewer` gate
them; `product-manager` scopes and recommends; `growth` drafts distribution.
Still one Claude Code session, one checkout — simple and portable.

## Level 2 — Adopt the operating discipline
Turn on the full workflow from `OPERATIONS.md` and
`docs/GITHUB_INTERACTION_MODEL.md`:
- issue → scope → branch → PR → the *right* review lane → merge → **live-probe
  verify** → close;
- a single `FACTS.md` source of truth every writer and reviewer checks against;
- the standing rules: no secrets/PII, escalate human-only work, no fabrication,
  branch-and-PR for every change.

This is the step where a set of subagents becomes a *company* with an audit
trail.

## Level 3 — The real parallel fleet (Orca)
When one session and one checkout become the bottleneck, move to a true parallel
fleet with [Orca](https://www.onorca.dev) (free, MIT; runs Claude Code workers
in isolated git worktrees). Run:

```
scripts/orca-bootstrap.sh
```

It creates the seven seats — CEO + six specialists — as **persistent Claude Code
workers in their own worktrees**, from the **same briefs** in `.claude/agents/`
and `roles/ceo.md`. Now the CEO can dispatch many specialists working **in
parallel on separate branches**, which is the configuration a high-throughput
AI-run project actually uses. Dispatch is
`orca orchestration task-create` + `orca orchestration dispatch --inject`; work
comes back as `worker_done`.

**What changes between levels:** only the execution substrate — one session →
many isolated worktree seats. **What stays the same:** the briefs, the review
gates, the operating rules, the definition of done. That constancy is the whole
design: you scale the runtime, not the team.

> Note: Orca is a desktop app (currently macOS). The native path (Levels 0–2) is
> cross-platform and needs only Claude Code + an API key, so nothing blocks you
> from starting today and graduating to the fleet later.
