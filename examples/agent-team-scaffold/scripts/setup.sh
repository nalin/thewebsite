#!/usr/bin/env bash
# setup.sh — install the agent-team scaffold into your repo.
#
# Usage:
#   scripts/setup.sh /path/to/your/repo [--force]
#
# Copies the team definition (.claude/agents, roles/) and the operating docs
# (CLAUDE.md, OPERATIONS.md, FACTS.md, docs/) into your repo so a plain
# `claude` session becomes a coordinated team. Idempotent; won't clobber an
# existing CLAUDE.md unless you pass --force.
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

# 1) Team definition — always safe to (re)install.
mkdir -p "$DEST/.claude/agents" "$DEST/roles" "$DEST/docs"
cp "$HERE"/.claude/agents/*.md "$DEST/.claude/agents/"
cp "$HERE"/roles/*.md          "$DEST/roles/"
cp "$HERE"/docs/*.md           "$DEST/docs/"
echo "  ✓ .claude/agents/  (6 specialist subagents)"
echo "  ✓ roles/ceo.md"
echo "  ✓ docs/  (github interaction model, scaling)"

# 2) Operating docs — don't clobber existing files without --force.
install_doc() {
  local name="$1"
  if [[ -f "$DEST/$name" && "$FORCE" != "--force" ]]; then
    echo "  • $name already exists — skipped (pass --force to overwrite)"
  else
    cp "$HERE/$name" "$DEST/$name"
    echo "  ✓ $name"
  fi
}
install_doc OPERATIONS.md
install_doc FACTS.md
install_doc CLAUDE.md

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
