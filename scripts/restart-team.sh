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
# HEALTHY SEATS ARE SKIPPED (#179). Before touching a seat, this script runs
# the same read-only probe fleet-liveness.sh uses (lib/seat-probe.sh) and
# leaves any seat that already has BOTH a live agent pane and a live `claude`
# process alone. That matters most for `coordinator`: it is normally the one
# seat that IS alive when a restart is needed, because a scheduled coordinator
# run is what discovers the outage — so restarting it unconditionally spawned a
# second session on a live seat, and both answered dispatches. Skip-if-healthy
# is a backstop against that, not permission to automate recovery: an automated
# run must still never call this script.
#
# Usage: scripts/restart-team.sh [--only ROLE[,ROLE...]] [--force] [--dry-run]
#                                [CEO_TERMINAL_HANDLE]
#   --only     restart only these roles (comma- or space-separated). A
#              single-seat recovery is the common case — during the #174 outage
#              the whole unblock was `--only code-reviewer`.
#   --force    restart seats even when the probe reports them healthy. This
#              re-arms the duplicate-session hazard; only use it when you have
#              confirmed the "healthy" seat is a husk the probe misread.
#   --dry-run  print the plan (per-seat verdict and the action that would be
#              taken) and exit without creating, launching or sending anything.
#   With a CEO handle, each agent is asked to confirm via an orchestration
#   status message to that handle. Without one, agents are just re-oriented.
#
# Exits nonzero if any role failed to restart. After running, the CEO must
# still (see TEAM.md): re-arm the session crons and check
# `orca orchestration task-list` for tasks orphaned mid-dispatch.
set -uo pipefail

ROLES=(coordinator course-content seo-growth product-manager engineer code-reviewer content-reviewer)
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# Shared per-seat probe — one definition of "healthy", so recovery and the
# read-only preflight cannot drift. Sourcing it is inert.
# shellcheck source=scripts/lib/seat-probe.sh
. "$REPO_ROOT/scripts/lib/seat-probe.sh"

CEO_HANDLE=""
ONLY=""
FORCE=0
DRY_RUN=0

usage() {
  sed -n '2,36p' "$0" | sed 's/^# \{0,1\}//' >&2
  exit 2
}

while [ $# -gt 0 ]; do
  case "$1" in
    --only) ONLY="${2:-}"; [ -n "$ONLY" ] || { echo "error: --only needs a role list" >&2; exit 2; }; shift 2 ;;
    --force) FORCE=1; shift ;;
    --dry-run) DRY_RUN=1; shift ;;
    --help|-h) usage ;;
    -*) echo "unknown argument: $1" >&2; usage ;;
    *)
      [ -z "$CEO_HANDLE" ] || { echo "error: unexpected extra argument: $1" >&2; usage; }
      CEO_HANDLE="$1"; shift ;;
  esac
done

# --only filters the roster; an unknown role is a typo, and silently restarting
# nothing (or everything) is the wrong answer to a typo during an outage.
if [ -n "$ONLY" ]; then
  if [ -z "$(echo "$ONLY" | tr ',' ' ' | tr -d '[:space:]')" ]; then
    echo "error: --only role list is empty — known roles: ${ROLES[*]}" >&2
    exit 2
  fi
  # shellcheck disable=SC2206  # deliberate word-splitting on the requested list
  REQUESTED=($(echo "$ONLY" | tr ',' ' '))
  SELECTED=()
  for want in ${REQUESTED[@]+"${REQUESTED[@]}"}; do
    found=""
    for role in "${ROLES[@]}"; do
      [ "$role" = "$want" ] && found="$role" && break
    done
    if [ -z "$found" ]; then
      echo "error: unknown role '$want' — known roles: ${ROLES[*]}" >&2
      exit 2
    fi
    # A repeat is the same class of typo as an unknown role, but worse: the pid
    # map is snapshotted once, so the second pass still reads a down seat as
    # down and launches it again — two live sessions on one seat, the exact
    # hazard this script exists to prevent.
    for already in ${SELECTED[@]+"${SELECTED[@]}"}; do
      if [ "$already" = "$found" ]; then
        echo "error: role '$found' repeated in --only — restarting one seat twice would leave two live sessions on it" >&2
        exit 2
      fi
    done
    SELECTED+=("$found")
  done
  ROLES=(${SELECTED[@]+"${SELECTED[@]}"})
fi

# Base ref for freshly created role worktrees. TEAM.md documents them as
# "based on origin/main", so assert that rather than inheriting Orca's implicit
# default. Note the default is NOT a stored repo setting: `orca repo show --repo
# name:thewebsite --json` exposes no base-branch field (verified 2026-07-17);
# Orca infers it from git's origin/HEAD, which resolves to refs/remotes/origin/main
# here but is ambient state nothing pins. Passing it makes the claim enforced.
BASE_BRANCH="${BASE_BRANCH:-origin/main}"

command -v orca >/dev/null || { echo "FATAL: orca CLI not on PATH"; exit 1; }
command -v node >/dev/null || { echo "FATAL: node not on PATH"; exit 1; }
# jq/lsof/ps back the seat probe. Missing them is fatal rather than
# skip-the-check: a restart that cannot tell a live seat from a dead one is the
# duplicate-session hazard with the safety removed.
for dep in jq lsof ps; do
  command -v "$dep" >/dev/null || { echo "FATAL: $dep not on PATH (required by the seat probe)"; exit 1; }
done

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
      console.log(w.displayName+'\t'+w.id+'\t'+(w.path||''));
  }
}catch(e){console.log('PARSE_FAIL')}});")
if [ -z "$WT_MAP" ] || echo "$WT_MAP" | grep -q '^PARSE_FAIL$'; then
  echo "FATAL: could not parse 'orca worktree list' output (empty, error-shaped, or zero worktrees while runtime reports ready). Refusing to create anything — inspect manually with: orca worktree list"
  exit 1
fi

STARTED=()
FAILED=()
SKIPPED=()

# Build the pid->cwd map once, before the loop, so every seat is judged against
# the same snapshot.
seat_probe_scan_processes

for role in "${ROLES[@]}"; do
  WT_ID=$(echo "$WT_MAP" | awk -F'\t' -v r="$role" '$1==r{print $2; exit}')
  WT_PATH=$(echo "$WT_MAP" | awk -F'\t' -v r="$role" '$1==r{print $3; exit}')

  # Skip-if-healthy (#179). The path comes from the worktree listing, never
  # guessed from a naming convention: probing the wrong path would report a
  # live seat as MISSING and relaunch on top of it, which is the failure this
  # check exists to prevent. No path in the listing means no probe, so the seat
  # is treated as unhealthy and handled below. Clear the verdict first: the
  # SEAT_* globals persist across loop iterations, so an unprobed seat would
  # otherwise be reported with the PREVIOUS seat's status.
  SEAT_STATUS=""
  if [ -n "$WT_PATH" ]; then
    seat_probe_classify "$WT_PATH"
    if [ "$SEAT_STATUS" = "OK" ]; then
      if [ "$FORCE" = "1" ]; then
        echo "[$role] already up (claude pid(s) $SEAT_PIDS, pane $SEAT_HANDLE) — restarting anyway (--force)"
      else
        echo "[$role] already up (claude pid(s) $SEAT_PIDS, pane $SEAT_HANDLE) — skipping"
        SKIPPED+=("$role")
        continue
      fi
    elif [ "$SEAT_STATUS" = "DETACHED" ]; then
      # The process survived, its terminal did not. Relaunching gives the seat a
      # reachable pane; the orphaned pid stays running and is a separate,
      # deliberate reaping decision (#155) — not something a restart should do
      # silently.
      echo "[$role] detached (claude pid(s) $SEAT_PIDS alive, no pane) — relaunching; old pid(s) left for manual reaping"
    fi
  fi

  if [ "$DRY_RUN" = "1" ]; then
    if [ -z "$WT_ID" ]; then
      echo "[$role] DRY RUN — would create a fresh worktree (base: $BASE_BRANCH) and launch claude"
    else
      echo "[$role] DRY RUN — would resume ${SEAT_STATUS:-UNPROBED} seat with claude --continue"
    fi
    continue
  fi

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
    KIND="fresh"
    # #137: the fresh agent must ALSO run with --dangerously-skip-permissions or
    # it re-arms the silent #136 stall on its first novel command. `orca worktree
    # create --agent claude` launches claude WITHOUT the bypass and offers no way
    # to forward the flag, so create the checkout without an agent and start
    # claude ourselves race-free via `orca terminal create --command` (the same
    # mechanism the resume path below uses — --command runs on terminal startup,
    # so there is no shell-not-ready race a `terminal send` would risk). Fresh
    # role context is seeded by the fresh-agent branch of the re-orientation send
    # below, which directs the agent to read team/roles/$role.md first.
    #
    # Parse the create response to EITHER the new worktree id or a FAIL: reason.
    # Fail closed: a false/missing ok, a missing id, or unparseable output ALL
    # yield FAIL — a parse failure must never read as "assume it worked" (the
    # inverse of the #132 parse-mistaken-for-a-state bug).
    CREATE_RES=$(orca worktree create --repo "path:$REPO_ROOT" --name "$role" --no-parent --base-branch "$BASE_BRANCH" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
try{
  const j=JSON.parse(d);
  if(j.ok!==true){console.log('FAIL:'+(j.error?.message||'create returned ok!=true'));return;}
  const id=j.result?.worktree?.id;
  console.log(id?('ID:'+id):'NO_ID');
}catch(e){console.log('FAIL:unparseable-output')}});")
    if [ "${CREATE_RES#FAIL:}" != "$CREATE_RES" ]; then
      echo "[$role] ERROR: worktree create failed — ${CREATE_RES#FAIL:} (inspect: orca worktree list)"
      FAILED+=("$role")
      continue
    fi
    # Resolve the new worktree's id. Prefer the create response's id; if the
    # runtime didn't return one, re-resolve via the SAME projectId-filtered list
    # query used for WT_MAP. Never a bare `name:` selector — orca resolves
    # display names GLOBALLY (no repo scoping on `terminal create`), so a
    # same-named worktree in another project could match and we would launch a
    # permission-bypassed claude in the wrong repo.
    WT_NEW="${CREATE_RES#ID:}"
    if [ "$WT_NEW" = "NO_ID" ]; then
      WT_NEW=$(orca worktree list --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{
try{
  const ws=JSON.parse(d).result?.worktrees;
  if(!Array.isArray(ws)){console.log('');return;}
  for(const w of ws){
    if(!w.isArchived&&(w.projectId||'').includes('thewebsite')&&w.displayName===process.argv[1]){console.log(w.id);break;}
  }
}catch(e){console.log('')}});" "$role")
    fi
    if [ -z "$WT_NEW" ]; then
      echo "[$role] ERROR: created worktree but could not determine its id — inspect: orca worktree list"
      FAILED+=("$role")
      continue
    fi
    HANDLE=$(orca terminal create --worktree "id:$WT_NEW" --title "$role-agent" --command "claude --dangerously-skip-permissions" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.result?.terminal?.handle||j.result?.handle||'')}catch(e){console.log('')}})")
  else
    KIND="resume"
    echo "[$role] worktree exists — resuming session with claude --dangerously-skip-permissions --continue"
    HANDLE=$(orca terminal create --worktree "id:$WT_ID" --title "$role-agent" --command "claude --dangerously-skip-permissions --continue" --json | node -e "
let d='';process.stdin.on('data',c=>d+=c).on('end',()=>{try{const j=JSON.parse(d);console.log(j.result?.terminal?.handle||j.result?.handle||'')}catch(e){console.log('')}})")
  fi

  if [ -z "$HANDLE" ]; then
    echo "[$role] ERROR: no terminal handle — inspect manually with: orca terminal list"
    FAILED+=("$role")
    continue
  fi
  STARTED+=("$role:$HANDLE:$KIND")
  echo "[$role] terminal: $HANDLE"
done

if [ ${#STARTED[@]} -gt 0 ]; then
  echo "Waiting for TUIs, then sending re-orientation..."
  for entry in ${STARTED[@]+"${STARTED[@]}"}; do
    role="${entry%%:*}"; kind="${entry##*:}"; rest="${entry#*:}"; handle="${rest%:*}"
    orca terminal wait --terminal "$handle" --for tui-idle --timeout-ms 90000 --json >/dev/null
    # A fresh agent has no prior session and no prior tasks. Resume-wording
    # ("your session was resumed", "no worker_done for old task IDs", "report
    # interrupted work") would prime a zero-context agent to confabulate status
    # — this team's #1 documented failure — so fresh agents get a NEW-agent brief
    # that tells them to read their role files first and states they have no work.
    if [ "$kind" = "fresh" ]; then
      MSG="You are a NEW $role agent in a fresh worktree. FIRST read team/roles/$role.md, CLAUDE.md, COURSE_FACTS.md, TEAM.md, then confirm and idle. You have no prior tasks."
      if [ -n "$CEO_HANDLE" ]; then
        CONFIRM=" Confirm by running exactly: orca orchestration send --to $CEO_HANDLE --type status --subject '$role online (fresh)' --body '<one line: role, fresh worktree, no prior work>' --json — then idle."
      else
        CONFIRM=" Then idle and await dispatch."
      fi
    else
      MSG="CEO: system restarted; your session was resumed. Terminal handles changed — any pre-restart dispatch preamble is STALE; do NOT send worker_done for old task IDs. You are the $role agent; if context feels thin, re-read team/roles/$role.md, CLAUDE.md, COURSE_FACTS.md, TEAM.md."
      if [ -n "$CEO_HANDLE" ]; then
        CONFIRM=" Confirm by running exactly: orca orchestration send --to $CEO_HANDLE --type status --subject '$role back online' --body '<one line: role + any interrupted work>' --json — then idle."
      else
        CONFIRM=" Then idle and await dispatch."
      fi
    fi
    orca terminal send --terminal "$handle" --text "$MSG$CONFIRM" --enter --json >/dev/null
  done

  # Text sent during TUI startup can sit unsubmitted in the input box; nudge.
  sleep 20
  for entry in ${STARTED[@]+"${STARTED[@]}"}; do
    rest="${entry#*:}"; handle="${rest%:*}"
    orca terminal send --terminal "$handle" --text "" --enter --json >/dev/null
  done
fi

echo
if [ "$DRY_RUN" = "1" ]; then
  echo "DRY RUN — nothing was created, launched or sent. ${#ROLES[@]} role(s) considered, ${#SKIPPED[@]} already healthy."
  exit 0
fi
echo "Done. ${#STARTED[@]}/${#ROLES[@]} agents restarted, ${#SKIPPED[@]} already up (skipped)."
if [ ${#STARTED[@]} -gt 0 ]; then printf '  %s\n' ${STARTED[@]+"${STARTED[@]}"}; fi
if [ ${#SKIPPED[@]} -gt 0 ]; then
  echo "Skipped (already healthy):"; printf '  %s\n' ${SKIPPED[@]+"${SKIPPED[@]}"}
fi
if [ ${#FAILED[@]} -gt 0 ]; then
  echo "FAILED roles:"; printf '  %s\n' ${FAILED[@]+"${FAILED[@]}"}
fi
echo "Reminders (TEAM.md): re-arm CEO session crons from team/roles/ceo.md (verbatim prompts + schedules); check 'orca orchestration task-list' for orphaned dispatches."
[ ${#FAILED[@]} -eq 0 ] || exit 1
