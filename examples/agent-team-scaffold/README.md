# Agent Team Scaffold

Run your repo like an AI-run company: a coordinator (CEO) that scopes and
dispatches work to specialist agents, an independent review gate on everything,
and a definition of "done" that means *verified*, not *asserted*. This is the
same operating model a real AI-run product uses, packaged so you can adopt it in
minutes and scale it when you're ready.

> **Phase-1 prototype.** This is the evidence-behind-the-deliverable build: the
> genericized role briefs, the operating docs, a setup script, an optional
> parallel-fleet bootstrap, and a runnable sample task. Not yet the polished,
> licensed pack.

## Two runtimes, one team (the hybrid design)

- **Native Claude Code (default, zero extra deps):** the six specialists are
  `.claude/agents/*.md` subagents; your root `claude` session is the CEO. Works
  with plain Claude Code + an API key. **~5 minutes to your first reviewed
  task.**
- **Orca parallel fleet (opt-in, at scale):** the *same* briefs spin up as
  persistent Claude Code workers in isolated git worktrees via
  [Orca](https://www.onorca.dev), so specialists run **in parallel** on separate
  branches — the configuration a high-throughput team actually uses.

You start native and graduate to the fleet **without rewriting the team** — see
[`docs/SCALING.md`](./docs/SCALING.md).

## Quickstart (native, ~5 min)

```bash
# 1. Install Claude Code and authenticate (API key or subscription login)
npm install -g @anthropic-ai/claude-code

# 2. Install the scaffold into your repo
scripts/setup.sh /path/to/your/repo

# 3. Try the full loop with zero setup first:
cd sample-task && npm test        # fails on purpose
claude                            # then: "use the engineer subagent to make npm test pass",
                                  #       then: "use the code-reviewer subagent to review it"
```

Then edit `CLAUDE.md`'s PROJECT section and fill in `FACTS.md` for your repo.

## What's in the bundle

| Path | What it is |
|---|---|
| `.claude/agents/*.md` | the six specialist subagents (engineer, content-writer, product-manager, growth, code-reviewer, content-reviewer) |
| `roles/ceo.md` | the CEO/coordinator brief (root session natively; a seat in Orca) |
| `CLAUDE.md` | project-instructions template + the operating model |
| `OPERATIONS.md` | the operating manual (principles, team, work flow, review lanes, done) |
| `FACTS.md` | single-source-of-truth template |
| `docs/GITHUB_INTERACTION_MODEL.md` | issue → scope → dispatch → PR → review → merge → verify → close |
| `docs/SCALING.md` | Level 0→3 progressive adoption |
| `scripts/setup.sh` | install the scaffold into your repo |
| `scripts/dispatch.sh` | the native + Orca dispatch patterns, documented |
| `scripts/orca-bootstrap.sh` | recreate the 7-seat parallel fleet in Orca |
| `sample-task/` | runnable first task: engineer fixes a failing test, reviewer approves |

## The discipline you're adopting
- **Escalate human-only work** (credentials, keys, payments) — never fake it.
- **Verify, don't assume** — done means a live probe proved it.
- **Single source of truth** — every public claim traces to `FACTS.md`.
- **Independent review gates** — no one reviews their own work.
- **Small, reviewed, reversible** — one change, one branch, one PR.

These guardrails, not any specific stack, are the product.
