#!/usr/bin/env bash
# orca-bootstrap.sh — (Level 3) recreate the 7-seat parallel fleet in Orca.
#
# Prerequisites:
#   - Orca installed (https://www.onorca.dev — free, MIT; desktop, macOS + Linux)
#   - Claude Code installed and authenticated
#   - Run from the root of the repo you want the fleet to work on
#
# This reads the SAME briefs the native path uses (.claude/agents/*.md and
# roles/ceo.md) and spins up one persistent Claude Code worker per seat, each in
# its own git worktree. Nothing about the team changes — only the substrate.
#
# It is intentionally conservative: it prints the exact `orca` commands and only
# runs them if you pass --run, so you can inspect before creating worktrees.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN="${1:-}"

# CEO first, then the six specialists (brief file -> seat name).
declare -a SEATS=(
  "roles/ceo.md:ceo"
  ".claude/agents/engineer.md:engineer"
  ".claude/agents/code-reviewer.md:code-reviewer"
  ".claude/agents/content-reviewer.md:content-reviewer"
  ".claude/agents/product-manager.md:product-manager"
  ".claude/agents/growth.md:growth"
  ".claude/agents/content-writer.md:content-writer"
)

if ! command -v orca >/dev/null 2>&1; then
  echo "NOTE: 'orca' not found on PATH. Install Orca from https://www.onorca.dev"
  echo "      (The native Levels 0-2 path needs only Claude Code — no Orca.)"
fi

echo "Fleet bootstrap — one persistent Claude Code seat per role:"
echo
for entry in "${SEATS[@]}"; do
  brief="${entry%%:*}"
  seat="${entry##*:}"
  if [[ ! -f "$HERE/$brief" ]]; then
    echo "  ! missing brief: $brief (skipping $seat)"
    continue
  fi
  cmd=(orca worktree create --name "$seat" --agent claude --prompt "\"\$(cat $brief)\"")
  echo "  # $seat"
  echo "  ${cmd[*]}"
  if [[ "$RUN" == "--run" ]]; then
    orca worktree create --name "$seat" --agent claude --prompt "$(cat "$HERE/$brief")"
  fi
  echo
done

if [[ "$RUN" != "--run" ]]; then
  echo "Dry run. Re-run with --run to actually create the worktree seats."
fi
cat <<'EOF'

Once seats exist, dispatch from the CEO seat (see scripts/dispatch.sh):
  orca orchestration task-create --task-title "..." --spec "<scoped brief>"
  orca orchestration dispatch --inject --to <seat-terminal-handle> --task <task-id>

To bring the fleet back up after a machine or Orca restart, reboot every seat
with one command (see TEAM-STRUCTURE.md):
  scripts/restart-fleet.sh
EOF
