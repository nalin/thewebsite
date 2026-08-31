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
#           Then wait NUDGE_SETTLE_S before sampling: the TUI spends ~1s of
#           CPU just processing the keypress, and on 08-28 (run 474, #205)
#           that second was read as "alive" on a pid that was in fact hung.
#        b. WATCH — sample each old pid's CPU time twice, CPU_SAMPLE_S apart.
#           A revived or genuinely working run accrues CPU during the window;
#           the #194 hung runs had burned ~27s of CPU across HOURS (≈2ms/s),
#           so a delta below CPU_DELTA_FLOOR_S over the window separates a
#           working process from an idle one cleanly (idle because it hung
#           or idle because it finished — see the classification note below). The window is measured on the wall clock as well:
#           if it took more than CPU_SAMPLE_S + SAMPLE_SLACK_S the host slept
#           inside it (a suspended process accrues no CPU whether hung or
#           not), so the sample is invalid and is retaken ONCE; a second
#           invalid window is a logged FAIL-OPEN (exit 0) — see below.
#        c. CONFIRM — a pid whose first window showed CPU gets a SECOND
#           window before it is called alive. The settle alone was not
#           enough: run 478 (08-28 17:13Z, #205) read +1s over 20s on an
#           awake, mains-powered host 5s after the nudge and lost the slot;
#           the same pid read +0s two hours later and was reaped. Raising
#           CPU_DELTA_FLOOR_S is NOT the fix: a run that is genuinely
#           working but waiting on a tool or the API burns only ~1.3–1.8s
#           per 20s (measured 08-28), indistinguishable from the keypress
#           by size. It is distinguishable by persistence — real work keeps
#           accruing, the keypress is a one-off — so growth in BOTH windows
#           is alive and growth that vanishes in the second is hung.
#        d. VERDICT — alive: leave it and SKIP the cycle. Not alive: kill it
#           (TERM, then KILL after 10s) and log the pid + session forensics
#           line. Never resume a killed run — a resumed predecessor is a
#           second live coordinator in the shared worktree, the exact
#           #136/#194 hazard.
#
#   The CPU protocol decides WHETHER to reap. It cannot say WHY, and for
#   three weeks it claimed to: every reap logged "hung". On 08-31 all three
#   reaped pids (19873, 72968, 40412 — runs 503/504/505) had finished their
#   run cleanly and idled ~1h50m at the prompt; a finished CLI and a mid-turn
#   hang both burn ~0s of CPU and are indistinguishable by the sample (#209).
#   The label mattered because it is the evidence stream for #194, whose open
#   question is whether coordinator runs are still stalling — it was reporting
#   an unbroken run of stalls that never happened.
#
#   So each old pid is CLASSIFIED from its session transcript before the
#   nudge, and the verdict rides along into the reap line:
#     ~/.claude/projects/<slugged cwd>/<session>.jsonl records
#     {"type":"system","subtype":"turn_duration"} when a turn ends.
#       last turn_duration >= last user/assistant message  -> FINISHED-IDLE
#       a message after it, or no turn_duration at all     -> MID-TURN (#194)
#   The pid maps to one file by birth time (the automation sets
#   reuseSession:false, so a run owns exactly one session) within
#   SESSION_MATCH_SLACK_S. Anything ambiguous — no directory, no match, two
#   matches, a file written within the last sample window — is UNKNOWN and
#   logs as it always did.
#
#   THIS IS LOG-ONLY BY DESIGN. Classification never changes what gets
#   killed: the kill is correct for a finished run and for a hung one alike,
#   and it is the highest-risk line in the ops loop. A FINISHED-IDLE pid
#   could skip the nudge and both windows (~45s of the 120s budget) — that
#   is a separate, separately-reviewed change, not this one.
#   3. Seat empty (initially, or after reaping every hung pid): exit 0.
#
# FAIL-OPEN ON INFRASTRUCTURE ERRORS. If a dependency is missing or `ps`
# misbehaves, this script logs loudly and exits 0 rather than 1. Failing
# closed would convert a broken precheck into a permanently dark ops loop
# (no run ever launches again); failing open merely restores the pre-#194
# status quo for one cycle, and the launched run's own fleet-liveness
# preflight hard-fails on STACKED, so the stack is still caught and handled
# by a CEO that can actually reason about it. A host that sleeps through
# the sample window twice is treated the same way (#205): the verdict is
# unknowable, and skipping would lose the slot for nothing.
#
# KNOWN LIMIT: Orca's --precheck-timeout counts WALL-CLOCK time and skips
# the run when it fires. If the host sleeps for longer than the timeout
# while this script is mid-window, the slot is lost before this script can
# say anything (runs 473 and 475 on 08-28, #205) — nothing here can fix
# that; keeping the window short only narrows the exposure.
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
#     NUDGE_SETTLE_S     (default 5)   seconds after the nudge before sampling
#     CPU_SAMPLE_S       (default 20)  seconds between the two CPU samples
#     SAMPLE_SLACK_S     (default 10)  wall-clock overrun that marks a window
#                                      as slept-through (invalid sample)
#     CPU_DELTA_FLOOR_S  (default 1)   CPU growth below this = not working
#     SESSION_MATCH_SLACK_S (default 180) pid-start vs session-birth window
#     SESSION_DIR_BASE   (default ~/.claude/projects) transcript root
#     WATCHDOG_LOG       (default ~/.thewebsite-coordinator-watchdog.log)
#
# Attach with a precheck timeout above the awake-host worst case,
#   NUDGE_SETTLE_S + 2*CPU_SAMPLE_S + ~11s per pid killed, plus classification
# (measured <1s per pid against a 303-file transcript dir whose largest file
# is 2.5MB — it is two jq passes and one stat sweep, not a factor in the budget)
# (45s + 11s/pid at defaults: 56s for one, 89s for the historical worst of
# four stacked; 120s holds up to six). Each slept-through retake adds
# NUDGE_SETTLE_S or CPU_SAMPLE_S plus SAMPLE_SLACK_S, but a retake only
# happens after the host has already slept — and Orca's wall-clock timeout
# is then the binding limit regardless (KNOWN LIMIT above). A breach costs
# one skipped slot, the pre-#194 status quo.
#   orca automations edit <automation-id> \
#     --precheck "bash <repo>/scripts/coordinator-watchdog.sh" \
#     --precheck-timeout 120
#
# Internal coordinator tooling only — not part of the app build. bash 3.2.
set -uo pipefail

WORKSPACE_ROOT="${WORKSPACE_ROOT:-$HOME/orca/workspaces/thewebsite}"
MAX_AGE_MIN="${MAX_AGE_MIN:-90}"
NUDGE_SETTLE_S="${NUDGE_SETTLE_S:-5}"
CPU_SAMPLE_S="${CPU_SAMPLE_S:-20}"
SAMPLE_SLACK_S="${SAMPLE_SLACK_S:-10}"
CPU_DELTA_FLOOR_S="${CPU_DELTA_FLOOR_S:-1}"
SESSION_MATCH_SLACK_S="${SESSION_MATCH_SLACK_S:-180}"
SESSION_DIR_BASE="${SESSION_DIR_BASE:-$HOME/.claude/projects}"
WATCHDOG_LOG="${WATCHDOG_LOG:-$HOME/.thewebsite-coordinator-watchdog.log}"
DRY_RUN=0

COORD_WT="$WORKSPACE_ROOT/coordinator"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  # Print the whole header comment, bounded by the first non-comment line
  # rather than a line number, so a header that grows cannot truncate --help
  # again (#207).
  sed -n '2,/^set -uo pipefail/p' "${BASH_SOURCE[0]}" | sed '$d' | sed 's/^# \{0,1\}//' >&2
  exit 0
}

# Every line goes to stdout (captured in the automation's run record) AND the
# persistent log, so kills stay auditable across cycles even if run records
# rotate away. Defined before arg parsing: the fail-open paths there log too.
log() {
  local line
  line="watchdog $(date -u '+%Y-%m-%dT%H:%M:%SZ') $*"
  echo "$line"
  echo "$line" >>"$WATCHDOG_LOG" 2>/dev/null || true
}

while [ $# -gt 0 ]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --help|-h) usage ;;
    *)
      # Unknown args take the LOGGED fail-open path, not usage: as a precheck,
      # a typo'd flag must neither dark-loop the automation (exit 1 forever)
      # nor silently unguard it — it launches unguarded but says so, every
      # cycle, in both the run record and the persistent log.
      echo "unknown argument: $1" >&2
      log "FAIL-OPEN: unknown argument '$1' — launching unguarded"
      exit 0
      ;;
  esac
done

# Tunables are validated up front, on the same doctrine: an invalid override
# must not fail closed (a permanent skip nobody notices) and must not skew the
# measurement (CPU_SAMPLE_S=abc makes sleep fail instantly, turning the CPU
# verdict into an unconditional kill). Invalid -> logged fail-open, exit 0;
# the launched run's own #196 STACKED preflight is the second line of defense.
for tunable in MAX_AGE_MIN NUDGE_SETTLE_S CPU_SAMPLE_S SAMPLE_SLACK_S CPU_DELTA_FLOOR_S SESSION_MATCH_SLACK_S; do
  value="${!tunable}"
  if ! [[ "$value" =~ ^[0-9]+$ ]] || [ "$value" -lt 1 ]; then
    log "FAIL-OPEN: $tunable must be an integer >= 1 (got '$value') — launching unguarded"
    exit 0
  fi
done

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

# --- session classification (log-only) ----------------------------------------
# Why a pid stopped burning CPU, read from its own transcript. See the header:
# this NEVER decides whether to kill, only what the kill line says (#209).

# The transcript directory Claude Code derives from a cwd: every non-alphanumeric
# character becomes a dash, leading slash included.
session_dir_for_cwd() {
  printf '%s/%s\n' "$SESSION_DIR_BASE" "$(printf '%s' "$1" | sed 's/[^A-Za-z0-9]/-/g')"
}

# Epoch second a pid started, derived from its own elapsed time so no
# platform-specific lstart parsing is needed. Empty if ps could not answer.
pid_start_epoch() {
  local age
  age="$(ps_time_to_s "$(ps -o etime= -p "$1" 2>/dev/null | tr -d ' ')")"
  [ -n "$age" ] || { echo ""; return; }
  echo $(( $(date +%s) - age ))
}

# The one session file belonging to pid $1: the automation runs with
# reuseSession:false, so a run owns exactly one transcript whose birth time
# lands within SESSION_MATCH_SLACK_S of the process start. Two matches is as
# unusable as none — both echo "" and the caller reports UNKNOWN.
session_file_for_pid() {
  local dir start birth diff f match="" count=0
  dir="$(session_dir_for_cwd "$COORD_WT")"
  [ -d "$dir" ] || { echo ""; return; }
  start="$(pid_start_epoch "$1")"
  [ -n "$start" ] || { echo ""; return; }
  for f in "$dir"/*.jsonl; do
    [ -f "$f" ] || continue
    birth="$(stat -f %B "$f" 2>/dev/null)"
    case "${birth:-x}" in *[!0-9]*) continue ;; esac
    diff=$(( birth - start ))
    [ "$diff" -lt 0 ] && diff=$(( -diff ))
    if [ "$diff" -le "$SESSION_MATCH_SLACK_S" ]; then
      match="$f"
      count=$(( count + 1 ))
    fi
  done
  [ "$count" = "1" ] && echo "$match" || echo ""
}

# "FINISHED-IDLE <ts>" | "MID-TURN <ts>" | "UNKNOWN (<why>)" for pid $1.
# `fromjson?` drops any partially-written trailing line rather than failing the
# whole read — a live process may be mid-append.
classify_pid() {
  local f last_msg last_turn mtime now idle
  f="$(session_file_for_pid "$1")"
  [ -n "$f" ] || { echo "UNKNOWN (no single session file matched)"; return; }
  mtime="$(stat -f %m "$f" 2>/dev/null)"
  now="$(date +%s)"
  case "${mtime:-x}" in
    *[!0-9]*) ;;
    *) idle=$(( now - mtime ))
       # A transcript still being appended to cannot be judged: the run may be
       # between a tool call and its result. Never call such a pid finished.
       # A future mtime (clock step, NTP correction) is unjudgeable for the
       # same reason and must not read as "very fresh" by accident.
       if [ "$idle" -lt 0 ]; then
         echo "UNKNOWN (session mtime is $(( -idle ))s in the future — clock skew)"
         return
       elif [ "$idle" -lt $(( CPU_SAMPLE_S + NUDGE_SETTLE_S )) ]; then
         echo "UNKNOWN (session written ${idle}s ago — too fresh to judge)"
         return
       fi ;;
  esac
  last_msg="$(jq -rR 'fromjson? | select(.timestamp and (.type == "user" or .type == "assistant")) | .timestamp' "$f" 2>/dev/null | tail -1)"
  last_turn="$(jq -rR 'fromjson? | select(.timestamp and .type == "system" and .subtype == "turn_duration") | .timestamp' "$f" 2>/dev/null | tail -1)"
  if [ -z "$last_turn" ]; then
    echo "MID-TURN (no turn ever completed; last write ${last_msg:-none})"
  elif [ -z "$last_msg" ] || ! [ "$last_msg" \> "$last_turn" ]; then
    # Timestamps are fixed-width UTC ISO-8601, so a string compare is a time
    # compare. Turn ended at or after the last message -> the run was done.
    echo "FINISHED-IDLE (turn ended $last_turn)"
  else
    echo "MID-TURN (message at $last_msg after the last turn end $last_turn)"
  fi
}

# pid=verdict pairs, one per line, snapshotted before the nudge.
VERDICTS=""
verdict_for() {
  local v
  v="$(printf '%s\n' "$VERDICTS" | sed -n "s/^$1=//p" | head -1)"
  echo "${v:-UNKNOWN (not classified)}"
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

# Classify before the nudge, so the verdict describes the state the watchdog
# found rather than the state it just poked. Log-only (#209) — no pid's fate
# changes here.
for pid in $OLD; do
  verdict="$(classify_pid "$pid")"
  VERDICTS="$VERDICTS
$pid=$verdict"
  log "pid $pid: session says $verdict"
done

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
# Let the nudge settle first: the keypress alone costs the TUI ~1s of CPU
# (run 474, #205), which should not land inside the measured window. The
# settle is wall-clock-guarded like the windows (#207): if the host slept
# inside it the keypress may still be pending on wake, so settle once more.
settle_after_nudge() {
  local t0 t1
  t0="$(date +%s)"
  sleep "$NUDGE_SETTLE_S"
  t1="$(date +%s)"
  [ $(( t1 - t0 )) -le $(( NUDGE_SETTLE_S + SAMPLE_SLACK_S )) ]
}
if ! settle_after_nudge; then
  log "settle window slept through — settling once more before sampling"
  settle_after_nudge || true
fi

# One sample window over the pids in $1: record CPU per pid, sleep
# CPU_SAMPLE_S, then check the wall clock actually advanced by about that
# much. A larger jump means the host slept mid-window — a suspended process
# accrues no CPU whether it is hung or working — so the window proves
# nothing. Returns 0 for a valid window, 1 for a slept-through one;
# CPU_BEFORE is set either way.
take_sample_window() {
  local pid cpu t0 t1 elapsed
  CPU_BEFORE=""
  for pid in $1; do
    cpu="$(ps_time_to_s "$(ps -o cputime= -p "$pid" 2>/dev/null | tr -d ' ')")"
    CPU_BEFORE="$CPU_BEFORE $pid:${cpu:-gone}"
  done
  t0="$(date +%s)"
  sleep "$CPU_SAMPLE_S"
  t1="$(date +%s)"
  elapsed=$(( t1 - t0 ))
  if [ "$elapsed" -gt $(( CPU_SAMPLE_S + SAMPLE_SLACK_S )) ]; then
    log "sample window slept through: ${elapsed}s elapsed for a ${CPU_SAMPLE_S}s sample — CPU verdict invalid"
    return 1
  fi
  return 0
}

# A valid window over the pids in $1, retaking once; a second slept-through
# window is the logged FAIL-OPEN (exit 0) described in the header.
sample_or_fail_open() {
  if ! take_sample_window "$1"; then
    log "retaking the sample window once"
    if ! take_sample_window "$1"; then
      log "FAIL-OPEN: host slept through both sample windows — no CPU verdict possible; launching unguarded (the launched run's STACKED preflight handles:$1)"
      exit 0
    fi
  fi
}

# CPU growth of pid $1 since CPU_BEFORE, in whole seconds; empty when either
# sample was unreadable.
cpu_delta() {
  local pid="$1" before after
  before="$(echo "$CPU_BEFORE" | tr ' ' '\n' | sed -n "s/^$pid://p")"
  after="$(ps_time_to_s "$(ps -o cputime= -p "$pid" 2>/dev/null | tr -d ' ')")"
  if [ -z "$before" ] || [ "$before" = "gone" ] || [ -z "$after" ]; then
    echo ""
  else
    echo $(( after - before ))
  fi
}

# --- 2c/2d. confirm + verdict ---------------------------------------------------
ALIVE=""
KILLED=""
CANDIDATE=""   # pids whose first window showed CPU — decided by the confirm window

# A missing sample can be a transient ps failure, not an exit. Re-probe pid
# $1: a pid that is actually still alive must hold the seat, not fall through
# both the ALIVE and KILLED buckets and let this script exit 0 under it.
hold_if_alive() {
  if kill -0 "$1" 2>/dev/null; then
    log "pid $1: CPU sample unreadable but process is alive — treating seat as held"
    ALIVE="$ALIVE $1"
  else
    log "pid $1: exited on its own during the sample window"
  fi
}

# Kill pid $1 (TERM, then KILL after 10s); $2 is the evidence for the log.
reap_pid() {
  local pid="$1" comm_now cwd_now waited
  # Re-verify identity at kill time, not just scan time: ~30-60s have passed
  # since the lsof cwd scan, and the TERM must be provably scoped to a
  # coordinator claude at the moment it is sent.
  comm_now="$(ps -o comm= -p "$pid" 2>/dev/null | tr -d ' ')"
  cwd_now="$(lsof -a -d cwd -p "$pid" -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)"
  if [ "$(basename "${comm_now:-/none}")" != "claude" ] || [ "$cwd_now" != "$COORD_WT" ]; then
    log "pid $pid: no longer a coordinator claude at kill time (comm='$comm_now' cwd='$cwd_now') — not killing"
    return
  fi
  log "pid $pid: $2; $(verdict_for "$pid") — killing (TERM, KILL after 10s)"
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
}

# First window over every old pid: flat = hung, kill now; growth = candidate
# for the confirm window (the nudge's own keypress reads the same size).
sample_or_fail_open "$OLD"
for pid in $OLD; do
  delta="$(cpu_delta "$pid")"
  if [ -z "$delta" ]; then
    hold_if_alive "$pid"
  elif [ "$delta" -ge "$CPU_DELTA_FLOOR_S" ]; then
    log "pid $pid: CPU +${delta}s over ${CPU_SAMPLE_S}s — confirming with a second window (a nudge keypress transient reads the same, run 478/#205)"
    CANDIDATE="$CANDIDATE $pid"
  else
    reap_pid "$pid" "CPU +${delta}s over ${CPU_SAMPLE_S}s"
  fi
done

# Confirm window over the candidates only: sustained growth = alive; growth
# that vanished = the keypress transient = hung.
if [ -n "$CANDIDATE" ]; then
  sample_or_fail_open "$CANDIDATE"
  for pid in $CANDIDATE; do
    delta="$(cpu_delta "$pid")"
    if [ -z "$delta" ]; then
      hold_if_alive "$pid"
    elif [ "$delta" -ge "$CPU_DELTA_FLOOR_S" ]; then
      log "pid $pid: CPU +${delta}s over the ${CPU_SAMPLE_S}s confirm window too — alive (possibly nudge-revived); leaving it"
      ALIVE="$ALIVE $pid"
    else
      reap_pid "$pid" "CPU +${delta}s over the ${CPU_SAMPLE_S}s confirm window (the first window's growth was the nudge's keypress transient, run 478/#205)"
    fi
  done
fi

if [ -n "$ALIVE" ] || [ -n "$YOUNG" ]; then
  log "SKIP cycle: seat still held (young:${YOUNG:- none}; alive:${ALIVE:- none}; killed:${KILLED:- none})"
  exit 1
fi

log "seat clear after reaping pid(s):${KILLED:- none} — launch"
exit 0
