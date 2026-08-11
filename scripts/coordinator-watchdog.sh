#!/usr/bin/env bash
# coordinator-watchdog.sh — precheck for the `ceo-coordinator` automation
# (second half of #194).
#
# On 08-08 three consecutive scheduled coordinator runs hung mid-turn and the
# `13 */2 * * *` automation, having no completion check, stacked a new run on
# top of each of them — three hung coordinators deep in the shared worktree by
# 07:23, with the ops loop dark the whole time. fleet-liveness.sh now reports
# that state as STACKED (a failure, PR #196), but detection happens INSIDE a
# run — by then the stack already exists. This script is the other half: it
# runs BEFORE each scheduled run launches (via `orca automations edit
# --precheck`), so a hung predecessor is dealt with and a healthy one is
# never stacked on.
#
# Exit code contract (the automation skips the run on ANY non-zero exit):
#     0  seat is clear — launch the scheduled run
#     1  seat is HELD by a live predecessor — skip this cycle, log why
#
# DECISION LADDER (per live `claude` pid whose cwd is the coordinator
# worktree; the precheck itself is not a claude process, so every pid found
# is a predecessor):
#
#   1. Any pid younger than MAX_AGE_MIN (default 90) — the seat is presumed
#      legitimately busy; SKIP the cycle. Real runs have legitimately exceeded
#      an hour while implementing issues (#194's 08-10 instance was mid
#      `pnpm build`), so youth alone is never grounds for a kill.
#   2. Every pid at/over MAX_AGE_MIN gets the stall protocol, in the order
#      the interactive playbook prescribes:
#        a. NUDGE — one empty Enter to the seat's live pane (the documented
#           first move for a mid-response cutoff; it revived the 08-10 stall).
#        b. WATCH — sample each old pid's CPU time twice, CPU_SAMPLE_S apart.
#           A revived or genuinely working run accrues CPU during the window;
#           the #194 hung runs had burned ~27s of CPU across HOURS (≈2ms/s),
#           so a delta below CPU_DELTA_FLOOR_S over the window separates the
#           two cleanly.
#        c. VERDICT — CPU moved: the run is alive; leave it and SKIP the
#           cycle. CPU flat: hung; kill it (TERM, then KILL after 10s) and
#           log the pid + session forensics line. Never resume a killed run —
#           a resumed predecessor is a second live coordinator in the shared
#           worktree, the exact #136/#194 hazard.
#   3. Seat empty (initially, or after reaping every hung pid): exit 0.
#
# FAIL-OPEN ON INFRASTRUCTURE ERRORS. If a dependency is missing or `ps`
# misbehaves, this script logs loudly and exits 0 rather than 1. Failing
# closed would convert a broken precheck into a permanently dark ops loop
# (no run ever launches again); failing open merely restores the pre-#194
# status quo for one cycle, and the launched run's own fleet-liveness
# preflight hard-fails on STACKED, so the stack is still caught and handled
# by a CEO that can actually reason about it.
#
# WHAT THIS SCRIPT WILL NEVER DO: touch any pid whose cwd is not exactly the
# coordinator worktree, restart seats, or resume anything. Worker-seat
# recovery remains a deliberate CEO action (see fleet-liveness.sh).
#
# Usage:
#   scripts/coordinator-watchdog.sh [--dry-run] [--help]
#
#   --dry-run  report the full decision ladder but send no nudge and kill
#              nothing; always exits as if the seat were held (1) when any
#              pid exists, so a dry run can never green-light a launch.
#
#   Env-overridable tunables:
#     WORKSPACE_ROOT     (default ~/orca/workspaces/thewebsite)
#     MAX_AGE_MIN        (default 90)  pids younger than this are never touched
#     CPU_SAMPLE_S       (default 20)  seconds between the two CPU samples
#     CPU_DELTA_FLOOR_S  (default 1)   CPU growth below this = hung
#     WATCHDOG_LOG       (default ~/.thewebsite-coordinator-watchdog.log)
#
# Attach with (precheck timeout must exceed CPU_SAMPLE_S + kill wait):
#   orca automations edit <automation-id> \
#     --precheck "bash <repo>/scripts/coordinator-watchdog.sh" \
#     --precheck-timeout 120
#
# Internal coordinator tooling only — not part of the app build. bash 3.2.
set -uo pipefail

WORKSPACE_ROOT="${WORKSPACE_ROOT:-$HOME/orca/workspaces/thewebsite}"
MAX_AGE_MIN="${MAX_AGE_MIN:-90}"
CPU_SAMPLE_S="${CPU_SAMPLE_S:-20}"
CPU_DELTA_FLOOR_S="${CPU_DELTA_FLOOR_S:-1}"
WATCHDOG_LOG="${WATCHDOG_LOG:-$HOME/.thewebsite-coordinator-watchdog.log}"
DRY_RUN=0

COORD_WT="$WORKSPACE_ROOT/coordinator"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  sed -n '2,80p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
  exit 0
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --help|-h) usage ;;
    *) echo "unknown argument: $1" >&2; usage ;;
  esac
done

# Every line goes to stdout (captured in the automation's run record) AND the
# persistent log, so kills stay auditable across cycles even if run records
# rotate away.
log() {
  local line
  line="watchdog $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"
  echo "$line"
  echo "$line" >>"$WATCHDOG_LOG" 2>/dev/null || true
}

# --- fail-open dependency gate ----------------------------------------------
for dep in ps lsof jq; do
  command -v "$dep" >/dev/null 2>&1 || {
    log "FAIL-OPEN: required command missing: $dep — launching unguarded"
    exit 0
  }
done
if [ ! -d "$COORD_WT" ]; then
  log "FAIL-OPEN: coordinator worktree missing at $COORD_WT — launching unguarded"
  exit 0
fi

# Pid discovery reuses the shared seat probe so this script and
# fleet-liveness.sh cannot drift on what "a coordinator claude pid" means.
# shellcheck source=scripts/lib/seat-probe.sh
if ! . "$REPO_ROOT/scripts/lib/seat-probe.sh" 2>/dev/null; then
  log "FAIL-OPEN: cannot source scripts/lib/seat-probe.sh — launching unguarded"
  exit 0
fi

# Parse `ps` [[dd-]hh:]mm:ss[.frac] into whole seconds. Empty/garbage -> "".
ps_time_to_s() {
  local t="${1%%.*}" days=0 h=0 m=0 s=0
  [ -n "$t" ] || { echo ""; return; }
  case "$t" in
    *-*) days="${t%%-*}"; t="${t#*-}" ;;
  esac
  case "$t" in
    *:*:*) h="${t%%:*}"; t="${t#*:}"; m="${t%%:*}"; s="${t#*:}" ;;
    *:*)   m="${t%%:*}"; s="${t#*:}" ;;
    *)     s="$t" ;;
  esac
  case "$days$h$m$s" in
    *[!0-9]*) echo ""; return ;;
  esac
  echo $(( (10#$days * 86400) + (10#$h * 3600) + (10#$m * 60) + 10#$s ))
}

# --- discover predecessors ----------------------------------------------------
seat_probe_scan_processes
PIDS="$(seat_probe_pids_for_path "$COORD_WT")"

if [ -z "$PIDS" ]; then
  log "seat clear: no coordinator claude pids — launch"
  exit 0
fi

YOUNG=""   # pids under MAX_AGE_MIN — hands off, seat is busy
OLD=""     # pids at/over MAX_AGE_MIN — stall protocol
for pid in $PIDS; do
  age_s="$(ps_time_to_s "$(ps -o etime= -p "$pid" 2>/dev/null | tr -d ' ')")"
  if [ -z "$age_s" ]; then
    # pid vanished between scan and here, or ps failed; treat as young —
    # wrongly killing is worse than wrongly waiting one cycle.
    log "pid $pid: age unreadable — treating as busy"
    YOUNG="$YOUNG $pid"
  elif [ "$age_s" -lt $(( MAX_AGE_MIN * 60 )) ]; then
    log "pid $pid: ${age_s}s old (< ${MAX_AGE_MIN}m) — seat legitimately busy"
    YOUNG="$YOUNG $pid"
  else
    log "pid $pid: ${age_s}s old (>= ${MAX_AGE_MIN}m) — stall protocol"
    OLD="$OLD $pid"
  fi
done

if [ -z "$OLD" ]; then
  log "SKIP cycle: live run(s) under ${MAX_AGE_MIN}m hold the seat ($YOUNG )"
  exit 1
fi

if [ "$DRY_RUN" = "1" ]; then
  log "DRY-RUN: would nudge + CPU-sample old pid(s):$OLD — exiting 1 without acting"
  exit 1
fi

# --- 2a. nudge -----------------------------------------------------------------
# One empty Enter to the seat's live pane. Harmless to a healthy run (an empty
# submit is a no-op) and the documented first move for a mid-response cutoff.
# If the pane is a husk or the runtime is down there is simply nothing to
# nudge; the CPU sample below still decides.
seat_probe_classify "$COORD_WT"
if [ -n "$SEAT_HANDLE" ]; then
  if orca terminal send --terminal "$SEAT_HANDLE" --enter >/dev/null 2>&1; then
    log "nudged pane $SEAT_HANDLE with empty Enter"
  else
    log "nudge failed for pane $SEAT_HANDLE — continuing to CPU sample"
  fi
else
  log "no live pane to nudge (husks: $SEAT_HUSKS) — continuing to CPU sample"
fi

# --- 2b. watch -----------------------------------------------------------------
CPU_BEFORE=""
for pid in $OLD; do
  cpu="$(ps_time_to_s "$(ps -o cputime= -p "$pid" 2>/dev/null | tr -d ' ')")"
  CPU_BEFORE="$CPU_BEFORE $pid:${cpu:-gone}"
done
sleep "$CPU_SAMPLE_S"

# --- 2c. verdict ----------------------------------------------------------------
ALIVE=""
KILLED=""
for pid in $OLD; do
  before="$(echo "$CPU_BEFORE" | tr ' ' '\n' | sed -n "s/^$pid://p")"
  after="$(ps_time_to_s "$(ps -o cputime= -p "$pid" 2>/dev/null | tr -d ' ')")"
  if [ "$before" = "gone" ] || [ -z "$after" ]; then
    log "pid $pid: exited on its own during the sample window"
    continue
  fi
  delta=$(( after - before ))
  if [ "$delta" -ge "$CPU_DELTA_FLOOR_S" ]; then
    log "pid $pid: CPU +${delta}s over ${CPU_SAMPLE_S}s — alive (possibly nudge-revived); leaving it"
    ALIVE="$ALIVE $pid"
  else
    log "pid $pid: CPU +${delta}s over ${CPU_SAMPLE_S}s — hung; killing (TERM, KILL after 10s)"
    kill "$pid" 2>/dev/null || true
    waited=0
    while [ "$waited" -lt 10 ] && kill -0 "$pid" 2>/dev/null; do
      sleep 1
      waited=$(( waited + 1 ))
    done
    if kill -0 "$pid" 2>/dev/null; then
      kill -9 "$pid" 2>/dev/null || true
      sleep 1
    fi
    if kill -0 "$pid" 2>/dev/null; then
      log "pid $pid: SURVIVED kill — treating seat as held"
      ALIVE="$ALIVE $pid"
    else
      log "pid $pid: reaped (never resume it — duplicate-coordinator hazard, #136/#194)"
      KILLED="$KILLED $pid"
    fi
  fi
done

if [ -n "$ALIVE" ] || [ -n "$YOUNG" ]; then
  log "SKIP cycle: seat still held (young:${YOUNG:- none}; alive:${ALIVE:- none}; killed:${KILLED:- none})"
  exit 1
fi

log "seat clear after reaping hung pid(s):${KILLED:- none} — launch"
exit 0
