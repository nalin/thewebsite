#!/usr/bin/env bash
# restart-team.sh — reboot The Website's standing agent team after a machine
# or Orca restart. Idempotent: creates missing worktrees (seeded from
# team/roles/<role>.md), resumes existing ones with `claude --continue`.
#
# Usage: scripts/restart-team.sh [CEO_TERMINAL_HANDLE]
#   With a CEO handle, each agent is asked to confirm via an orchestration
#   status message to that handle. Without one, agents are just re-oriented.
#
# Exits nonzero if any role failed to restart. After running, the CEO must
# still (see TEAM.md): re-arm the session crons and check
# `orca orchestration task-list` for tasks orphaned mid-dispatch.
set -uo pipefail

ROLES=(coordinator course-content seo-growth product-manager engineer code-reviewer content-reviewer)
CEO_HANDLE="${1:-}"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

command -v orca >/dev/null || { echo "FATAL: orca CLI not on PATH"; exit 1; }
command -v node >/dev/null || { echo "FATAL: node not on PATH"; exit 1; }

STATE=$(orca status --json 2>/dev/null | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).result.runtime.state)}catch(e){console.log('down')}})")
[ "$STATE" = "ready" ] || { echo "FATAL: Orca runtime not ready (state: $STATE). Start the Orca app first."; exit 1; }

# Parse the worktree list ONCE, up front, and hard-fail on anything
# unexpected. A silent parse failure here must never be mistaken for
# "worktree missing" — that branch mass-creates duplicate seeded agents,
# the exact duplicate-session hazard TEAM.md documents.
WT_MAP=$(orca worktree list --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
try{
  const ws=JSON.parse(d).result?.worktrees;
  if(!Array.isArray(ws)||ws.length===0){console.log('PARSE_FAIL');return;}
  for(const w of ws){
    if(!w.isArchived&&(w.projectId||'').includes('thewebsite'))
      console.log(w.displayName+'\t'+w.id);
  }
}catch(e){console.log('PARSE_FAIL')}});")
if [ -z "$WT_MAP" ] || echo "$WT_MAP" | grep -q '^PARSE_FAIL$'; then
  echo "FATAL: could not parse 'orca worktree list' output (empty, error-shaped, or zero worktrees while runtime reports ready). Refusing to create anything — inspect manually with: orca worktree list"
  exit 1
fi

STARTED=()
FAILED=()

for role in "${ROLES[@]}"; do
  WT_ID=$(echo "$WT_MAP" | awk -F'\t' -v r="$role" '$1==r{print $2; exit}')

  if [ -z "$WT_ID" ]; then
    echo "[$role] worktree missing — creating fresh agent seeded from team/roles/$role.md"
    BRIEF=$(cat "$REPO_ROOT/team/roles/$role.md")
    HANDLE=$(orca worktree create --repo "path:$REPO_ROOT" --name "$role" --no-parent --agent claude --prompt "$BRIEF" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.result?.startupTerminal?.handle||'')}catch(e){console.log('')}})")
  else
    echo "[$role] worktree exists — resuming session with claude --continue"
    HANDLE=$(orca terminal create --worktree "id:$WT_ID" --title "$role-agent" --command "claude --continue" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.result?.terminal?.handle||j.result?.handle||'')}catch(e){console.log('')}})")
  fi

  if [ -z "$HANDLE" ]; then
    echo "[$role] ERROR: no terminal handle — inspect manually with: orca terminal list"
    FAILED+=("$role")
    continue
  fi
  STARTED+=("$role:$HANDLE")
  echo "[$role] terminal: $HANDLE"
done

if [ ${#STARTED[@]} -gt 0 ]; then
  echo "Waiting for TUIs, then sending re-orientation..."
  for entry in ${STARTED[@]+"${STARTED[@]}"}; do
    role="${entry%%:*}"; handle="${entry##*:}"
    orca terminal wait --terminal "$handle" --for tui-idle --timeout-ms 90000 --json >/dev/null
    if [ -n "$CEO_HANDLE" ]; then
      CONFIRM=" Confirm by running exactly: orca orchestration send --to $CEO_HANDLE --type status --subject '$role back online' --body '<one line: role + any interrupted work>' --json — then idle."
    else
      CONFIRM=" Then idle and await dispatch."
    fi
    orca terminal send --terminal "$handle" --text "CEO: system restarted; your session was resumed. Terminal handles changed — any pre-restart dispatch preamble is STALE; do NOT send worker_done for old task IDs. You are the $role agent; if context feels thin, re-read team/roles/$role.md, CLAUDE.md, COURSE_FACTS.md, TEAM.md.$CONFIRM" --enter --json >/dev/null
  done

  # Text sent during TUI startup can sit unsubmitted in the input box; nudge.
  sleep 20
  for entry in ${STARTED[@]+"${STARTED[@]}"}; do
    handle="${entry##*:}"
    orca terminal send --terminal "$handle" --text "" --enter --json >/dev/null
  done
fi

echo
echo "Done. ${#STARTED[@]}/${#ROLES[@]} agents restarted."
if [ ${#STARTED[@]} -gt 0 ]; then printf '  %s\n' ${STARTED[@]+"${STARTED[@]}"}; fi
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "FAILED roles:"; printf '  %s\n' ${FAILED[@]+"${FAILED[@]}"}
fi
echo "Reminders (TEAM.md): re-arm CEO session crons; check 'orca orchestration task-list' for orphaned dispatches."
[ ${#FAILED[@]} -eq 0 ] || exit 1
