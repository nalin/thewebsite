#!/usr/bin/env bash
# setup.sh — install the agent-team scaffold into your repo.
#
# Usage:
#   scripts/setup.sh /path/to/your/repo [--force]
#
# Copies the team definition (.claude/agents, roles/) and the operating docs
# (CLAUDE.md, OPERATIONS.md, FACTS.md, docs/) into your repo so a plain
# `claude` session becomes a coordinated team. Idempotent; won't clobber any
# existing file (including briefs you've customized) unless you pass --force.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${1:-}"
FORCE="${2:-}"

if [[ -z "$DEST" ]]; then
  echo "usage: scripts/setup.sh /path/to/your/repo [--force]" >&2
  exit 2
fi
if [[ ! -d "$DEST" ]]; then
  echo "error: destination '$DEST' is not a directory" >&2
  exit 2
fi

echo "Installing agent-team scaffold into: $DEST"

# Don't clobber existing files (e.g. briefs the buyer customized) without --force.
COLLISIONS=0
install_file() {
  local src="$1" rel="$2"
  if [[ -d "$DEST/$rel" ]]; then
    echo "  ! $rel exists as a DIRECTORY in the destination — skipped." >&2
    echo "    Move it aside and re-run to install this file." >&2
    COLLISIONS=$((COLLISIONS + 1))
  elif [[ -e "$DEST/$rel" && "$FORCE" != "--force" ]]; then
    echo "  • $rel already exists — skipped (pass --force to overwrite)"
  else
    cp "$src" "$DEST/$rel"
    echo "  ✓ $rel"
  fi
}

# Install every .md file under one source dir; say so if there are none
# (nullglob makes an empty dir skip the loop instead of passing a literal
# glob to cp — restored right after the loops).
install_dir() {
  local rel="$1" f found=0
  for f in "$HERE/$rel"/*.md; do
    found=1
    install_file "$f" "$rel/$(basename "$f")"
  done
  if [[ "$found" == 0 ]]; then
    echo "  (source $rel/ contains no .md files — nothing to install from it)"
  fi
}

# 1) Team definition — 6 specialist subagents, CEO brief, docs.
mkdir -p "$DEST/.claude/agents" "$DEST/roles" "$DEST/docs"
shopt -s nullglob
install_dir .claude/agents
install_dir roles
install_dir docs
shopt -u nullglob

# 2) Operating docs — same rule.
install_file "$HERE/OPERATIONS.md"     OPERATIONS.md
install_file "$HERE/TEAM-STRUCTURE.md" TEAM-STRUCTURE.md
install_file "$HERE/FACTS.md"          FACTS.md
install_file "$HERE/CLAUDE.md"         CLAUDE.md

# 3) Prerequisite check + first-run instructions.
echo
if command -v claude >/dev/null 2>&1; then
  echo "Claude Code detected: $(command -v claude)"
else
  echo "NOTE: Claude Code not found on PATH."
  echo "      Install it:  npm install -g @anthropic-ai/claude-code"
  echo "      Then authenticate (Anthropic API key or Claude subscription login)."
fi

cat <<'EOF'

Done. Next:
  1. cd into your repo and edit CLAUDE.md's PROJECT section + fill in FACTS.md.
  2. Run:  claude
  3. As the coordinator, delegate a real task to the `engineer` subagent, then
     gate its diff with `code-reviewer`. (Reviewers never review their own work.)

To try the full loop with zero setup, run the bundled sample first:
  cd sample-task && cat README.md
EOF

if [[ "$COLLISIONS" -gt 0 ]]; then
  echo "WARNING: $COLLISIONS file(s) NOT installed — a directory sits where each should go (see '!' lines above). Move them aside and re-run." >&2
  exit 1
fi
