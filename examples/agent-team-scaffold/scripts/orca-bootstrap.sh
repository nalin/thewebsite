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

# Discover the roster from the scaffold — the SAME source restart-fleet.sh uses,
# so create and reboot never drift: drop a brief in .claude/agents/ and BOTH
# scripts pick it up with no edits (the promise TEAM-STRUCTURE.md makes). CEO
# brief first, then every specialist brief. Entry format: "<brief-path>:<seat>".
SEATS=()
if [ -f "$HERE/roles/ceo.md" ]; then SEATS+=("roles/ceo.md:ceo"); fi
for f in "$HERE/.claude/agents/"*.md; do
  [ -e "$f" ] || continue   # literal-glob guard (no nullglob needed on bash 3.2)
  seat="$(basename "$f" .md)"
  SEATS+=(".claude/agents/$seat.md:$seat")
done
if [ ${#SEATS[@]} -eq 0 ]; then
  echo "FATAL: no seats discovered under $HERE/roles/ or $HERE/.claude/agents/ — is this the scaffold root?" >&2
  exit 1
fi

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
