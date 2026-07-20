#!/usr/bin/env bash
# fleet-liveness.sh — coordinator-side fleet preflight (#155).
#
# Twice in three days the fleet went down silently: a machine restart (07-18)
# and an Orca runtime restart (07-20, triggered by the disk hitting 0 bytes,
# #129). Both times nothing detected it. The 07-20 outage was only noticed when
# a dispatch failed mid-run with "no recognized agent detected" — by then the
# coordinator had already been working against a fleet that wasn't there.
#
# The failure has a specific shape worth naming: the worker `claude` processes
# SURVIVE a runtime restart (they are login-shell children, not runtime
# children), but their terminals detach — the panes become husks with a null
# title and no lastOutputAt, and dispatches land nowhere. So "the process is
# running" is NOT evidence the seat is reachable, and neither signal alone is
# enough. This script checks both, separately, and says which one broke.
#
# Run it FIRST in a coordinator run, before touching the backlog:
#
#   scripts/fleet-liveness.sh || echo "fleet degraded — see diagnostic above"
#
# WHAT IT CHECKS (all read-only)
#   1. Orca runtime reachable      — `orca status`; if the runtime is down,
#                                    every other orchestration call is
#                                    meaningless, so this is checked first.
#   2. Disk headroom               — today's root cause. Two tiers: a warning
#                                    band (still runs) and a failure floor.
#   3. Each role seat              — a live agent pane AND a live `claude`
#                                    process whose cwd is that role's worktree.
#
# WHAT IT DELIBERATELY DOES NOT DO
#   It never restarts, relaunches, kills or repairs anything. Recovery stays a
#   deliberate CEO action via `scripts/restart-team.sh`, because an automated
#   restart racing a coordinator run is exactly how you get two live sessions
#   per seat — the duplicate-session hazard the "never relaunch terminals" rule
#   exists to prevent. This script only tells you what is broken, in a form you
#   can paste into an issue.
#
# Usage:
#   scripts/fleet-liveness.sh [--roles "a b c"] [--quiet] [--help]
#
#   --roles   space-separated roster override (default: derived from
#             team/roles/*.md, minus ceo — the interactive CEO runs in the main
#             checkout, not an Orca worktree, so it has no seat to check)
#   --quiet   suppress the per-role OK lines; print only problems and the
#             summary (for a coordinator run that logs every invocation)
#
#   Env-overridable tunables:
#     MIN_FREE_GB     (default 2)   below this, disk is a FAILURE
#     WARN_FREE_GB    (default 10)  below this, disk is a WARNING
#     WORKSPACE_ROOT  (default ~/orca/workspaces/thewebsite)
#     ROLES           same as --roles
#
# Exit codes (the first failing check in this order wins; every check still
# runs and reports, so one invocation shows you everything):
#     0  healthy — warnings may still be present
#     2  usage error / missing dependency
#     3  Orca runtime unreachable
#     4  disk below MIN_FREE_GB
#     5  one or more role seats not healthy
#
# Internal coordinator tooling only — not part of the app build.
set -euo pipefail

MIN_FREE_GB="${MIN_FREE_GB:-2}"
WARN_FREE_GB="${WARN_FREE_GB:-10}"
WORKSPACE_ROOT="${WORKSPACE_ROOT:-$HOME/orca/workspaces/thewebsite}"
ROLES="${ROLES:-}"
QUIET=0

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  sed -n '2,61p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
  exit 2
}

validate_int() {  # <label> <value> <min>
  if ! [[ "$2" =~ ^[0-9]+$ ]] || (( $2 < $3 )); then
    echo "error: $1 must be an integer >= $3 (got '$2')" >&2
    exit 2
  fi
}

while [ $# -gt 0 ]; do
  case "$1" in
    --roles) ROLES="${2:-}"; shift 2 ;;
    --quiet) QUIET=1; shift ;;
    --help|-h) usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
done

validate_int "MIN_FREE_GB" "$MIN_FREE_GB" 0
validate_int "WARN_FREE_GB" "$WARN_FREE_GB" 0

for dep in orca jq lsof ps df; do
  command -v "$dep" >/dev/null 2>&1 || {
    echo "error: required command not found: $dep" >&2
    exit 2
  }
done

# --- roster -----------------------------------------------------------------
#
# One source: the seed briefs in team/roles/. TEAM.md points at that directory
# for the roster, and restart-team.sh launches one seat per role — deriving it
# here means a new brief is picked up with no edit to this script. ceo.md is
# excluded: the interactive CEO works in the main checkout, not a worktree.
if [ -z "$ROLES" ]; then
  for brief in "$REPO_ROOT/team/roles/"*.md; do
    [ -e "$brief" ] || continue          # literal-glob guard (bash 3.2, no nullglob)
    role="$(basename "$brief" .md)"
    [ "$role" = "ceo" ] && continue
    ROLES="$ROLES $role"
  done
fi
# shellcheck disable=SC2206  # deliberate word-splitting: ROLES is a plain list
ROLE_LIST=($ROLES)
if [ ${#ROLE_LIST[@]} -eq 0 ]; then
  echo "error: no roles resolved (looked in $REPO_ROOT/team/roles/) — pass --roles" >&2
  exit 2
fi

# Roster drift guard: restart-team.sh still hardcodes its own list, so a brief
# added to team/roles/ would be checked here but never launched there. Cheap to
# notice, expensive to discover during an outage.
ROSTER_DRIFT=""
RESTART_SCRIPT="$REPO_ROOT/scripts/restart-team.sh"
if [ -f "$RESTART_SCRIPT" ]; then
  restart_roles="$(sed -n 's/^ROLES=(\(.*\))$/\1/p' "$RESTART_SCRIPT" | head -1)"
  if [ -n "$restart_roles" ]; then
    sorted_here="$(printf '%s\n' "${ROLE_LIST[@]}" | sort | tr '\n' ' ')"
    sorted_there="$(printf '%s\n' $restart_roles | sort | tr '\n' ' ')"
    [ "$sorted_here" = "$sorted_there" ] || ROSTER_DRIFT="restart-team.sh launches: $sorted_there"
  fi
fi

# --- output helpers ---------------------------------------------------------

WARNINGS=()
PROBLEMS=()

line() {  # <label> <status> <detail>
  [ "$QUIET" = "1" ] && [ "$2" = "OK" ] && return 0
  printf '  %-18s %-9s %s\n' "$1" "$2" "$3"
}

echo "fleet-liveness $(date -u '+%Y-%m-%dT%H:%M:%SZ')"

# --- 1. runtime -------------------------------------------------------------

RUNTIME_OK=0
status_json="$(orca status --json 2>/dev/null || true)"
runtime_reachable="$(jq -r '.result.runtime.reachable // false' <<<"$status_json" 2>/dev/null || echo false)"
runtime_state="$(jq -r '.result.runtime.state // "unknown"' <<<"$status_json" 2>/dev/null || echo unknown)"
runtime_id="$(jq -r '.result.runtime.runtimeId // "none"' <<<"$status_json" 2>/dev/null || echo none)"

if [ "$runtime_reachable" = "true" ]; then
  RUNTIME_OK=1
  line "runtime" "OK" "reachable, state=$runtime_state, runtimeId=$runtime_id"
else
  line "runtime" "FAIL" "NOT reachable (state=$runtime_state) — every orchestration call will fail"
  PROBLEMS+=("runtime unreachable (state=$runtime_state)")
fi

# --- 2. disk ----------------------------------------------------------------
#
# The volume that matters is the one the worktrees live on. Reported in whole
# GiB — this is a headroom check, not accounting.
DISK_FAIL=0
disk_line="$(df -k "$WORKSPACE_ROOT" 2>/dev/null | tail -1 || true)"
if [ -z "$disk_line" ]; then
  disk_line="$(df -k "$HOME" 2>/dev/null | tail -1 || true)"
fi
if [ -n "$disk_line" ]; then
  free_kb="$(awk '{print $4}' <<<"$disk_line")"
  mount="$(awk '{print $NF}' <<<"$disk_line")"
  free_gb=$(( free_kb / 1024 / 1024 ))
  if [ "$free_gb" -lt "$MIN_FREE_GB" ]; then
    DISK_FAIL=1
    line "disk" "FAIL" "${free_gb}Gi free on $mount (floor ${MIN_FREE_GB}Gi) — ENOSPC will take the fleet down (#129)"
    PROBLEMS+=("disk ${free_gb}Gi free on $mount, below the ${MIN_FREE_GB}Gi floor")
  elif [ "$free_gb" -lt "$WARN_FREE_GB" ]; then
    line "disk" "WARN" "${free_gb}Gi free on $mount (warn <${WARN_FREE_GB}Gi, floor ${MIN_FREE_GB}Gi)"
    WARNINGS+=("disk ${free_gb}Gi free on $mount — below the ${WARN_FREE_GB}Gi comfort line (#129)")
  else
    line "disk" "OK" "${free_gb}Gi free on $mount"
  fi
else
  line "disk" "WARN" "could not read df for $WORKSPACE_ROOT"
  WARNINGS+=("disk headroom unknown — df failed for $WORKSPACE_ROOT")
fi

# --- claude process map -----------------------------------------------------
#
# Built once: pid -> cwd for every live `claude` process. Independent of the
# Orca runtime — that separation is the whole point, since a runtime restart
# leaves these processes running while their terminals detach.
#
# Enumerated with `ps -A`, NOT `pgrep`. Verified 2026-07-20: pgrep (both -x and
# -f) does not report the `claude` process that is an ancestor of the calling
# shell, while `ps -A` lists it — so a seat running this check on itself was
# reported as NO-AGENT. A false "your live seat is down" is the most damaging
# output this script can produce: it invites a restart of a healthy fleet,
# which is the duplicate-session hazard. Match on the basename of comm, since
# ps reports some processes with a full path.
PROC_PIDS=()
PROC_CWDS=()
for pid in $(ps -Ao pid=,comm= 2>/dev/null | awk '{n=split($2,p,"/"); if (p[n]=="claude") print $1}'); do
  cwd="$(lsof -a -d cwd -p "$pid" -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)"
  [ -n "$cwd" ] || continue
  PROC_PIDS+=("$pid")
  PROC_CWDS+=("$cwd")
done

# Echo the pids whose cwd is exactly <path> (parallel arrays: bash 3.2 has no
# associative arrays and macOS ships 3.2).
pids_for_path() {
  local target="$1" i out=""
  i=0
  while [ "$i" -lt "${#PROC_PIDS[@]}" ]; do
    if [ "${PROC_CWDS[$i]}" = "$target" ]; then
      out="$out ${PROC_PIDS[$i]}"
    fi
    i=$(( i + 1 ))
  done
  echo "${out# }"
}

# --- 3. role seats ----------------------------------------------------------
#
# A seat is healthy when BOTH hold:
#   pane    — a connected, writable terminal with a non-null title and a
#             non-null lastOutputAt. Orca's agent status hooks title agent
#             panes; a husk left by a runtime restart has title null and no
#             lastOutputAt, which is exactly how the 07-20 outage looked.
#   process — a live `claude` whose cwd is that role's worktree.
#
# Worktrees are addressed by PATH, never by `name:`. Orca resolves display
# names globally, with no repo scoping (see the comment in restart-team.sh), so
# a same-named worktree in another project would otherwise report this fleet as
# healthy when it is not.
ROLE_FAIL=0

for role in "${ROLE_LIST[@]}"; do
  wtpath="$WORKSPACE_ROOT/$role"

  if [ "$RUNTIME_OK" != "1" ]; then
    line "$role" "UNKNOWN" "runtime unreachable — cannot enumerate terminals"
    continue
  fi

  if [ ! -d "$wtpath" ]; then
    line "$role" "MISSING" "no worktree at $wtpath — never created, or removed"
    PROBLEMS+=("$role: worktree missing at $wtpath")
    ROLE_FAIL=1
    continue
  fi

  terms="$(orca terminal list --worktree "path:$wtpath" --json 2>/dev/null || true)"

  # A live agent pane, and the husks left behind by a detach.
  handle="$(jq -r --arg p "$wtpath" '
    [ .result.terminals[]?
      | select(.worktreePath == $p and .connected and .writable
               and .title != null and .title != "" and .lastOutputAt != null and .lastOutputAt > 0) ]
    | sort_by(.lastOutputAt) | reverse | (first // {}) | .handle // empty' <<<"$terms" 2>/dev/null || true)"
  last_output="$(jq -r --arg p "$wtpath" '
    [ .result.terminals[]?
      | select(.worktreePath == $p and .connected and .writable
               and .title != null and .title != "" and .lastOutputAt != null and .lastOutputAt > 0) ]
    | sort_by(.lastOutputAt) | reverse | (first // {}) | .lastOutputAt // empty' <<<"$terms" 2>/dev/null || true)"
  husks="$(jq -r --arg p "$wtpath" '
    [ .result.terminals[]?
      | select(.worktreePath == $p and ((.title // "") == "" or (.lastOutputAt // 0) == 0)) ]
    | length' <<<"$terms" 2>/dev/null || echo 0)"

  pids="$(pids_for_path "$wtpath")"
  pid_count=0
  [ -n "$pids" ] && pid_count="$(wc -w <<<"$pids" | tr -d ' ')"

  age=""
  if [ -n "$last_output" ]; then
    now_ms=$(( $(date +%s) * 1000 ))
    age_s=$(( (now_ms - last_output) / 1000 ))
    [ "$age_s" -lt 0 ] && age_s=0
    age=", last output ${age_s}s ago"
  fi

  husk_note=""
  [ "$husks" -gt 0 ] && husk_note=", $husks husk pane(s)"

  if [ -n "$handle" ] && [ "$pid_count" -gt 0 ]; then
    line "$role" "OK" "$handle$age; claude pid(s) $pids$husk_note"
    if [ "$pid_count" -gt 1 ]; then
      WARNINGS+=("$role: $pid_count claude processes share this worktree (pids $pids) — likely a pre-restart generation left running; confirm by cwd+CPU before reaping (#155)")
    fi
  elif [ -z "$handle" ] && [ "$pid_count" -gt 0 ]; then
    line "$role" "DETACHED" "claude pid(s) $pids alive but NO live agent pane$husk_note — runtime-restart signature"
    PROBLEMS+=("$role: agent process alive (pids $pids) but its terminal detached — dispatches will land nowhere")
    ROLE_FAIL=1
  elif [ -n "$handle" ] && [ "$pid_count" -eq 0 ]; then
    line "$role" "NO-AGENT" "$handle is live but no claude process in $wtpath — bare shell, not a seat"
    PROBLEMS+=("$role: terminal exists but no agent process — the session exited")
    ROLE_FAIL=1
  else
    line "$role" "DOWN" "no live agent pane and no claude process$husk_note"
    PROBLEMS+=("$role: seat is down (no pane, no process)")
    ROLE_FAIL=1
  fi
done

# --- summary ----------------------------------------------------------------

if [ -n "$ROSTER_DRIFT" ]; then
  WARNINGS+=("roster drift: this check covers '$(printf '%s ' "${ROLE_LIST[@]}")'; $ROSTER_DRIFT")
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo
  echo "Warnings:"
  printf '  - %s\n' "${WARNINGS[@]}"
fi

if [ ${#PROBLEMS[@]} -eq 0 ]; then
  echo
  echo "Fleet healthy: ${#ROLE_LIST[@]} seat(s) up, runtime reachable."
  exit 0
fi

echo
echo "FLEET DEGRADED — ${#PROBLEMS[@]} problem(s):"
printf '  - %s\n' "${PROBLEMS[@]}"
cat >&2 <<'EOF'

Recovery is a DELIBERATE CEO action, not something this script does:
  scripts/restart-team.sh          # idempotent: resumes existing seats, creates missing ones
Never let an automated run restart the fleet on its own — a restart racing a
coordinator run leaves two live sessions on one seat, and both answer dispatches.
After a restart: re-arm the CEO crons (team/roles/ceo.md) and check
`orca orchestration task-list` for dispatches orphaned by the outage.
EOF

# First failing check in declared order wins, so the exit code names the most
# fundamental cause rather than the last one noticed.
if [ "$RUNTIME_OK" != "1" ]; then exit 3; fi
if [ "$DISK_FAIL" = "1" ]; then exit 4; fi
if [ "$ROLE_FAIL" = "1" ]; then exit 5; fi
exit 0
