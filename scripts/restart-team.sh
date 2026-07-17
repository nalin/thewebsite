#!/usr/bin/env bash
# restart-team.sh — reboot The Website's standing agent team after a machine
# or Orca restart. Idempotent: creates missing worktrees (seeded from
# team/roles/<role>.md), resumes existing ones with
# `claude --dangerously-skip-permissions --continue`. The bypass is REQUIRED on
# every worker launch (resume AND fresh): worker worktrees carry no .claude
# permission allowlist, so a plain `claude` blocks on an invisible permission
# prompt at its first novel command and stalls silently mid-turn (#136,
# root-caused and fixed here per #137).
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

# Base ref for freshly created role worktrees. TEAM.md documents them as
# "based on origin/main", so assert that rather than inheriting Orca's implicit
# default. Note the default is NOT a stored repo setting: `orca repo show --repo
# name:thewebsite --json` exposes no base-branch field (verified 2026-07-17);
# Orca infers it from git's origin/HEAD, which resolves to refs/remotes/origin/main
# here but is ambient state nothing pins. Passing it makes the claim enforced.
BASE_BRANCH="${BASE_BRANCH:-origin/main}"

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
    echo "[$role] worktree missing — creating fresh worktree (base: $BASE_BRANCH), launching claude with permission bypass"
    # Fail closed on a base ref that doesn't resolve: creating role worktrees
    # from the wrong (or a silently-defaulted) base is the failure #134 is about.
    # Checked lazily so a resume-only restart is never blocked by it.
    if ! git -C "$REPO_ROOT" rev-parse --verify --quiet "$BASE_BRANCH" >/dev/null; then
      echo "[$role] ERROR: base ref '$BASE_BRANCH' does not resolve in $REPO_ROOT — run 'git -C $REPO_ROOT fetch origin' and retry."
      FAILED+=("$role")
      continue
    fi
    # #137: the fresh agent must ALSO run with --dangerously-skip-permissions or
    # it re-arms the silent #136 stall on its first novel command. `orca worktree
    # create --agent claude` launches claude WITHOUT the bypass and offers no way
    # to forward the flag, so create the checkout without an agent and start
    # claude ourselves race-free via `orca terminal create --command` (the same
    # mechanism the resume path below uses — --command runs on terminal startup,
    # so there is no shell-not-ready race a `terminal send` would risk). Role
    # context is seeded by the re-orientation send further down, which directs
    # the agent to read team/roles/$role.md — the brief the old --prompt injected.
    CREATE_MSG=$(orca worktree create --repo "path:$REPO_ROOT" --name "$role" --no-parent --base-branch "$BASE_BRANCH" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.ok===false?'FAIL:'+(j.error?.message||'unknown'):'OK')}catch(e){console.log('OK')}})")
    if [ "${CREATE_MSG#FAIL:}" != "$CREATE_MSG" ]; then
      echo "[$role] ERROR: worktree create failed — ${CREATE_MSG#FAIL:} (inspect: orca worktree list)"
      FAILED+=("$role")
      continue
    fi
    # Resolve the just-created worktree by name — unique among active worktrees
    # because we only reach this branch when no active worktree matched the role.
    HANDLE=$(orca terminal create --worktree "name:$role" --title "$role-agent" --command "claude --dangerously-skip-permissions" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.result?.terminal?.handle||j.result?.handle||'')}catch(e){console.log('')}})")
  else
    echo "[$role] worktree exists — resuming session with claude --dangerously-skip-permissions --continue"
    HANDLE=$(orca terminal create --worktree "id:$WT_ID" --title "$role-agent" --command "claude --dangerously-skip-permissions --continue" --json | node -e "
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
