#!/usr/bin/env bash
# restart-fleet.sh — (Level 3) reboot the whole Orca fleet after a machine or
# Orca restart. The reboot counterpart to orca-bootstrap.sh: bootstrap CREATES
# the seats the first time; this brings an EXISTING fleet back up idempotently —
# creating any missing seat's worktree, resuming the rest with their prior
# session intact.
#
# Seats are DISCOVERED from the scaffold, never hardcoded: the CEO brief
# roles/ceo.md plus every specialist in .claude/agents/*.md — the same seat set
# orca-bootstrap.sh spins up. Add a specialist brief and it joins the reboot;
# there is nothing here to edit.
#
# Every worker is (re)launched with `claude --dangerously-skip-permissions`.
# That bypass is REQUIRED, not optional: a freshly created worktree carries no
# .claude permission allowlist, so a plain `claude` blocks on an invisible
# permission prompt at its first tool call and stalls silently mid-turn — the
# pane looks alive but never acts. Resume adds --continue to reattach the seat's
# previous conversation.
#
# Usage:
#   scripts/restart-fleet.sh [--repo <path>] [--project <match>] \
#                            [--ceo-handle <terminal-handle>]
#
#   --repo        repo root that fresh seat worktrees are created from
#                 (default: the git top-level of the current directory).
#   --project     substring that identifies THIS fleet's worktrees in
#                 `orca worktree list`, matched against each worktree's
#                 projectId and path (default: the basename of --repo). This is
#                 the guard that stops the script from touching — or worse,
#                 launching a permission-bypassed claude into — a same-named
#                 seat that belongs to a different project.
#   --ceo-handle  CEO/coordinator terminal handle; when given, each specialist
#                 is asked to confirm it is back online to that handle.
#
#   env BASE_BRANCH  base ref for fresh seat worktrees (default: origin/main).
#
# Exits nonzero if any seat failed to restart. This is process tooling — it
# contains no secrets and never should.
set -uo pipefail

usage() { sed -n '2,38p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT=""
PROJECT_MATCH=""
CEO_HANDLE=""
BASE_BRANCH="${BASE_BRANCH:-origin/main}"

while [ $# -gt 0 ]; do
  case "$1" in
    --repo)       REPO_ROOT="${2:?--repo needs a value}";       shift 2 ;;
    --project)    PROJECT_MATCH="${2:?--project needs a value}"; shift 2 ;;
    --ceo-handle) CEO_HANDLE="${2:?--ceo-handle needs a value}"; shift 2 ;;
    -h|--help)    usage; exit 0 ;;
    *) echo "error: unknown argument '$1'" >&2; usage >&2; exit 2 ;;
  esac
done

command -v orca >/dev/null || { echo "FATAL: orca CLI not on PATH (install: https://www.onorca.dev)"; exit 1; }
command -v node >/dev/null || { echo "FATAL: node not on PATH"; exit 1; }
command -v git  >/dev/null || { echo "FATAL: git not on PATH"; exit 1; }

# Default the repo root to the current git checkout; require it explicitly
# otherwise (never guess).
if [ -z "$REPO_ROOT" ]; then
  REPO_ROOT="$(git -C "$PWD" rev-parse --show-toplevel 2>/dev/null || true)"
fi
if [ -z "$REPO_ROOT" ]; then
  echo "FATAL: --repo not given and the current directory is not inside a git repo. Pass --repo <path>."
  exit 1
fi
REPO_ROOT="$(cd "$REPO_ROOT" && pwd)"
[ -n "$PROJECT_MATCH" ] || PROJECT_MATCH="$(basename "$REPO_ROOT")"

# Discover the seats from the scaffold: CEO brief + every specialist brief.
# Parallel arrays keep each seat paired with the brief a fresh agent must read.
SEAT_NAMES=()
SEAT_BRIEFS=()
add_seat() { SEAT_NAMES+=("$1"); SEAT_BRIEFS+=("$2"); }
[ -f "$HERE/roles/ceo.md" ] && add_seat "ceo" "roles/ceo.md"
for f in "$HERE/.claude/agents/"*.md; do
  [ -e "$f" ] || continue   # nullglob-free guard: skip the literal glob if empty
  add_seat "$(basename "$f" .md)" ".claude/agents/$(basename "$f")"
done
if [ ${#SEAT_NAMES[@]} -eq 0 ]; then
  echo "FATAL: no seats discovered under $HERE/roles/ or $HERE/.claude/agents/ — is this the scaffold root?"
  exit 1
fi

STATE=$(orca status --json 2>/dev/null | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{console.log(JSON.parse(d).result.runtime.state)}catch(e){console.log('down')}})")
[ "$STATE" = "ready" ] || { echo "FATAL: Orca runtime not ready (state: $STATE). Start the Orca app first."; exit 1; }

# Parse the worktree list ONCE, up front, and hard-fail on anything malformed.
# A parse failure that reads as "no worktree for this seat" would send the
# create branch on a rampage, mass-creating duplicate seats — the exact
# duplicate-session hazard TEAM-STRUCTURE.md documents. So:
#   - error-shaped / non-array output      -> PARSE_FAIL (fatal below)
#   - a well-formed list (even empty)       -> emit the matching seats (0+)
# A genuinely empty match set is NOT fatal here (unlike a fixed known fleet):
# a first reboot legitimately finds no seats yet and should create them all.
# Only unparseable output is treated as dangerous.
WT_MAP=$(orca worktree list --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
try{
  const m=process.argv[1];
  const ws=JSON.parse(d).result?.worktrees;
  if(!Array.isArray(ws)){console.log('PARSE_FAIL');return;}
  for(const w of ws){
    if(w.isArchived) continue;
    const pid=w.projectId||'', p=w.path||'';
    if(pid.includes(m)||p.includes(m)) console.log(w.displayName+'\t'+w.id);
  }
}catch(e){console.log('PARSE_FAIL')}});" "$PROJECT_MATCH")
if echo "$WT_MAP" | grep -q '^PARSE_FAIL$'; then
  echo "FATAL: could not parse 'orca worktree list' output (error-shaped or non-array). Refusing to create anything — inspect manually with: orca worktree list"
  exit 1
fi

STARTED=()
FAILED=()

i=0
while [ "$i" -lt "${#SEAT_NAMES[@]}" ]; do
  seat="${SEAT_NAMES[$i]}"
  brief="${SEAT_BRIEFS[$i]}"
  i=$((i + 1))

  WT_ID=$(echo "$WT_MAP" | awk -F'\t' -v r="$seat" '$1==r{print $2; exit}')

  if [ -z "$WT_ID" ]; then
    echo "[$seat] worktree missing — creating fresh (base: $BASE_BRANCH), launching claude with permission bypass"
    # Fail closed on a base ref that doesn't resolve: creating seats from the
    # wrong (or a silently-defaulted) base is a real bug this guards against.
    # Checked lazily so a resume-only reboot is never blocked by it.
    if ! git -C "$REPO_ROOT" rev-parse --verify --quiet "$BASE_BRANCH" >/dev/null; then
      echo "[$seat] ERROR: base ref '$BASE_BRANCH' does not resolve in $REPO_ROOT — run 'git -C $REPO_ROOT fetch origin' (or set BASE_BRANCH) and retry."
      FAILED+=("$seat")
      continue
    fi
    KIND="fresh"
    # The fresh agent must ALSO run with --dangerously-skip-permissions or it
    # re-arms the silent permission-prompt stall on its first tool call.
    # `orca worktree create --agent claude` launches claude WITHOUT the bypass
    # and offers no way to forward the flag, so create the checkout with no
    # agent and start claude ourselves via `orca terminal create --command`
    # (which runs on terminal startup — no shell-not-ready race).
    #
    # Parse the create response to EITHER the new worktree id or a FAIL: reason.
    # Fail closed: a false/missing ok, a missing id, or unparseable output ALL
    # yield FAIL — a parse failure must never read as "assume it worked".
    CREATE_RES=$(orca worktree create --repo "path:$REPO_ROOT" --name "$seat" --no-parent --base-branch "$BASE_BRANCH" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
try{
  const j=JSON.parse(d);
  if(j.ok!==true){console.log('FAIL:'+(j.error?.message||'create returned ok!=true'));return;}
  const id=j.result?.worktree?.id;
  console.log(id?('ID:'+id):'NO_ID');
}catch(e){console.log('FAIL:unparseable-output')}});")
    if [ "${CREATE_RES#FAIL:}" != "$CREATE_RES" ]; then
      echo "[$seat] ERROR: worktree create failed — ${CREATE_RES#FAIL:} (inspect: orca worktree list)"
      FAILED+=("$seat")
      continue
    fi
    # Resolve the new worktree's id. Prefer the create response's id; if the
    # runtime didn't return one, re-resolve via the SAME project-scoped list
    # query used for WT_MAP. Never a bare `name:` selector — orca resolves
    # display names GLOBALLY, so a same-named seat in another project could
    # match and we would launch a permission-bypassed claude in the wrong repo.
    WT_NEW="${CREATE_RES#ID:}"
    if [ "$WT_NEW" = "NO_ID" ]; then
      WT_NEW=$(orca worktree list --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
try{
  const m=process.argv[1], name=process.argv[2];
  const ws=JSON.parse(d).result?.worktrees;
  if(!Array.isArray(ws)){console.log('');return;}
  for(const w of ws){
    const pid=w.projectId||'', p=w.path||'';
    if(!w.isArchived&&(pid.includes(m)||p.includes(m))&&w.displayName===name){console.log(w.id);break;}
  }
}catch(e){console.log('')}});" "$PROJECT_MATCH" "$seat")
    fi
    if [ -z "$WT_NEW" ]; then
      echo "[$seat] ERROR: created worktree but could not determine its id — inspect: orca worktree list"
      FAILED+=("$seat")
      continue
    fi
    HANDLE=$(orca terminal create --worktree "id:$WT_NEW" --title "$seat-agent" --command "claude --dangerously-skip-permissions" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.result?.terminal?.handle||j.result?.handle||'')}catch(e){console.log('')}})")
  else
    KIND="resume"
    echo "[$seat] worktree exists — resuming session with claude --dangerously-skip-permissions --continue"
    HANDLE=$(orca terminal create --worktree "id:$WT_ID" --title "$seat-agent" --command "claude --dangerously-skip-permissions --continue" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.result?.terminal?.handle||j.result?.handle||'')}catch(e){console.log('')}})")
  fi

  if [ -z "$HANDLE" ]; then
    echo "[$seat] ERROR: no terminal handle — inspect manually with: orca terminal list"
    FAILED+=("$seat")
    continue
  fi
  STARTED+=("$seat:$HANDLE:$KIND")
  echo "[$seat] terminal: $HANDLE"
done

if [ ${#STARTED[@]} -gt 0 ]; then
  echo "Waiting for TUIs, then sending re-orientation..."
  for entry in ${STARTED[@]+"${STARTED[@]}"}; do
    seat="${entry%%:*}"; kind="${entry##*:}"; rest="${entry#*:}"; handle="${rest%:*}"
    brief="?"
    j=0
    while [ "$j" -lt "${#SEAT_NAMES[@]}" ]; do
      [ "${SEAT_NAMES[$j]}" = "$seat" ] && { brief="${SEAT_BRIEFS[$j]}"; break; }
      j=$((j + 1))
    done
    orca terminal wait --terminal "$handle" --for tui-idle --timeout-ms 90000 --json >/dev/null

    # A fresh agent has no prior session and no prior tasks. Resume-wording
    # ("your session was resumed", "no completion for old task IDs", "report
    # interrupted work") would prime a zero-context agent to confabulate status
    # — a classic agent-team failure — so fresh agents get a NEW-agent brief
    # that tells them to read their role files first and states they have none.
    if [ "$kind" = "fresh" ]; then
      MSG="You are a NEW $seat seat in a fresh worktree. FIRST read its brief ($brief), then CLAUDE.md, FACTS.md, OPERATIONS.md, and TEAM-STRUCTURE.md, then confirm and idle. You have no prior tasks."
    else
      MSG="System restarted; your session was resumed. Terminal handles changed — any pre-restart dispatch preamble is STALE; do NOT report completion for old task IDs. You are the $seat seat; if context feels thin, re-read its brief ($brief), CLAUDE.md, FACTS.md, OPERATIONS.md, TEAM-STRUCTURE.md."
    fi

    if [ "$seat" = "ceo" ]; then
      CONFIRM=" Then resume coordinating and await the owner."
    elif [ -n "$CEO_HANDLE" ]; then
      CONFIRM=" Confirm by running exactly: orca orchestration send --to $CEO_HANDLE --type status --subject '$seat online' --body '<one line: seat + any interrupted work>' --json — then idle."
    else
      CONFIRM=" Then idle and await dispatch."
    fi
    orca terminal send --terminal "$handle" --text "$MSG$CONFIRM" --enter --json >/dev/null
  done

  # Text sent during TUI startup can sit unsubmitted in the input box; nudge
  # each pane with a bare Enter to submit whatever landed there.
  sleep 20
  for entry in ${STARTED[@]+"${STARTED[@]}"}; do
    rest="${entry#*:}"; handle="${rest%:*}"
    orca terminal send --terminal "$handle" --text "" --enter --json >/dev/null
  done
fi

echo
echo "Done. ${#STARTED[@]}/${#SEAT_NAMES[@]} seats restarted."
if [ ${#STARTED[@]} -gt 0 ]; then printf '  %s\n' ${STARTED[@]+"${STARTED[@]}"}; fi
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "FAILED seats:"; printf '  %s\n' ${FAILED[@]+"${FAILED[@]}"}
fi
echo "Next (see TEAM-STRUCTURE.md): re-arm any CEO session crons; check 'orca orchestration task-list' for dispatches orphaned mid-restart; collect each seat's 'back online' status. If a seat stays silent, inspect its terminal directly — do NOT re-dispatch (that risks a duplicate session)."
[ ${#FAILED[@]} -eq 0 ] || exit 1
