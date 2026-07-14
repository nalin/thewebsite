#!/usr/bin/env bash
# dispatch.sh — documents the two dispatch patterns. This is a reference/helper,
# not a magic button: coordination is a judgment call the CEO makes.
#
# The scaffold supports two runtimes. Pick based on your level (see docs/SCALING.md).
set -euo pipefail

cat <<'EOF'
DISPATCH PATTERNS
=================

NATIVE (Claude Code subagents — Levels 0-2, zero extra deps)
------------------------------------------------------------
There is no CLI dispatch: you drive it from inside a `claude` session. As the
coordinator, you delegate with the Task tool, naming the subagent, e.g.:

  "Use the engineer subagent to <scoped task>. It should work on a branch,
   run the tests, and report the diff — not merge."

Then gate the result:

  "Use the code-reviewer subagent to review that diff. APPROVE or
   REQUEST-CHANGES with specifics."

The subagent runs in its own context and returns its result to you (the CEO),
who verifies and merges.

ORCA FLEET (parallel worktree seats — Level 3, requires Orca installed)
-----------------------------------------------------------------------
Seats are persistent workers in isolated worktrees (see orca-bootstrap.sh).
Dispatch a task to a seat and inject it:

  orca orchestration task-create \
    --task-title "<short title>" \
    --spec "<the scoped brief for the specialist>"

  orca orchestration dispatch --inject --to <seat-terminal-handle> --task <task-id>

(`--to` takes the seat's terminal handle: read it from `orca worktree create
--json` output when bootstrapping, or find it later with `orca terminal list`.)

The seat works on its own branch and reports back with `worker_done`. The CEO
seat routes the result to the reviewer seat, then merges + verifies.

In BOTH runtimes the discipline is identical: scope -> owning specialist ->
independent review gate -> merge -> live-probe verify -> close.
EOF
