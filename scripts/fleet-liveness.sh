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
#                                    For the coordinator seat, MORE than one
#                                    claude process is itself a failure: it
#                                    means scheduled runs have stacked on a
#                                    hung predecessor (#194), and every pid
#                                    beyond the live pane's needs a deliberate
#                                    kill (never a resume). A seat that is
#                                    green on both signals is additionally
#                                    asked whether it can finish a turn at
#                                    all — reported as MUTE when its last turn
#                                    was answered locally rather than by the
#                                    model (#212), and as STALLED when it holds
#                                    an unanswered DISPATCH — a prompt with no
#                                    reply of any kind after it, not merely a
#                                    tool call in flight — and is burning no
#                                    CPU (#217). Neither is a SEAT_STATUS value.
#   4. Each seat's RECENT SESSIONS  — the checks above all ask about the seat as
#                                    it stands now, and a loop can stop
#                                    producing work while every one of them
#                                    reads OK. Nine of eleven scheduled
#                                    coordinator runs died on arrival over 25
#                                    hours in #221 and this report said OK
#                                    throughout, correctly: by the time anything
#                                    probed the seat, the failing sessions had
#                                    exited. So the newest sessions in the
#                                    seat's transcript directory are counted,
#                                    and a seat whose recent sessions took a
#                                    prompt and never got a model answer is
#                                    reported — as a WARNING, not a problem,
#                                    because the seat is healthy and a restart
#                                    is the wrong repair. Not a SEAT_STATUS
#                                    value either.
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
#     SEAT_PROBE_CPU_SAMPLE_S (default 20, max 300) seconds per stall-check
#                     CPU window
#     SEAT_PROBE_CPU_FLOOR_CS (default 100) CPU growth in CENTISECONDS below
#                     which a process counts as not working. Capped at
#                     SEAT_PROBE_CPU_SAMPLE_S * 100 — the most one process can
#                     accrue on one core in a window — because a floor above
#                     that reports a working seat as STALLED (#222).
#                     Either knob outside its range warns on stderr and falls
#                     back to its default; it never skews a verdict.
#     SEAT_PROBE_DARK_WINDOW (default 10, max 50) how many recent sessions the
#                     dark-run check looks at. Capped because an over-large
#                     window both sweeps already-recovered outages back into the
#                     count and costs one jq pass per session (#221).
#     SEAT_PROBE_DARK_MIN (default 3) how many of those must have produced no
#                     work before the seat is reported. Uncapped: an over-large
#                     value only silences the check, which is the safe
#                     direction. 3 is where the transient class stops counting —
#                     measured, historical runs of consecutive dead sessions are
#                     1, 2, 2, 2, 2, 3, 4, 6, 25 and 41 long.
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

# The per-seat probe is shared with restart-team.sh (#179) so recovery and
# reporting cannot drift on what "healthy" means. Sourcing it is inert.
# shellcheck source=scripts/lib/seat-probe.sh
. "$REPO_ROOT/scripts/lib/seat-probe.sh"

usage() {
  sed -n '2,77p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
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
# leaves these processes running while their terminals detach. The probe itself
# lives in lib/seat-probe.sh so restart-team.sh applies the SAME definition of
# a healthy seat before it relaunches anything (#179).
seat_probe_scan_processes

# --- 3. role seats ----------------------------------------------------------
#
# A seat is healthy when BOTH hold:
#   pane    — a connected, writable terminal with a non-null title and a
#             non-null lastOutputAt. Orca's agent status hooks title agent
#             panes; a husk left by a runtime restart has title null and no
#             lastOutputAt, which is exactly how the 07-20 outage looked.
#   process — a live `claude` whose cwd is that role's worktree.
#
# Both signals, and the OK/DETACHED/NO-AGENT/DOWN classification below, come
# from seat_probe_classify (lib/seat-probe.sh). This script owns the wording;
# the probe owns the verdict.
#
# Both being green is necessary and NOT sufficient (#212). A seat pinned to an
# exhausted model consumed four consecutive dispatches in ~1s each, declining
# locally every time, while this check reported it OK (#211) — because the two
# things measured really were fine. So for an otherwise-OK seat we additionally
# ask its transcript whether the last turn came from the model at all, and
# report MUTE when it did not. MUTE is reported here only; it is deliberately
# not a SEAT_STATUS value, so restart-team.sh cannot start relaunching seats
# that still hold a live process.
ROLE_FAIL=0

for role in "${ROLE_LIST[@]}"; do
  wtpath="$WORKSPACE_ROOT/$role"

  if [ "$RUNTIME_OK" != "1" ]; then
    line "$role" "UNKNOWN" "runtime unreachable — cannot enumerate terminals"
    continue
  fi

  seat_probe_classify "$wtpath"

  if [ "$SEAT_STATUS" = "MISSING" ]; then
    line "$role" "MISSING" "no worktree at $wtpath — never created, or removed"
    PROBLEMS+=("$role: worktree missing at $wtpath")
    ROLE_FAIL=1
    continue
  fi

  age=""
  [ -n "$SEAT_AGE_S" ] && age=", last output ${SEAT_AGE_S}s ago"

  husk_note=""
  [ "$SEAT_HUSKS" -gt 0 ] && husk_note=", $SEAT_HUSKS husk pane(s)"

  case "$SEAT_STATUS" in
    OK)
      # Pane and process are both live — but neither signal proves this seat can
      # finish a turn (#212). Ask the transcript before calling it healthy.
      seat_probe_mute_check "$wtpath"
      mute_age=""
      [ -n "$SEAT_MUTE_AGE_S" ] && mute_age=" ${SEAT_MUTE_AGE_S}s ago"

      # Stacked coordinator runs are a PROBLEM, not a warning (#194): the
      # scheduled automation has no completion check, so a hung run holds its
      # process and the next cycle launches on top of it — three deep on 08-08.
      # Every coordinator pid beyond the live pane's is a hung predecessor.
      # Recovery per the #136/#194 precedent: kill the extras, never resume —
      # a resumed predecessor is a duplicate live coordinator in the shared
      # worktree. Worker seats keep the softer warning below: a second pid
      # there is usually a pre-restart generation needing deliberate triage.
      if [ "$role" = "coordinator" ] && [ "$SEAT_PID_COUNT" -gt 1 ]; then
        line "$role" "STACKED" "$SEAT_HANDLE$age; $SEAT_PID_COUNT claude pids ($SEAT_PIDS)$husk_note — stacked scheduled runs (#194)"
        PROBLEMS+=("coordinator: $SEAT_PID_COUNT claude processes share the shared worktree (pids $SEAT_PIDS) — stacked scheduled runs; kill every pid but the live pane's, never resume them (#194)")
        ROLE_FAIL=1
      elif [ "$SEAT_MUTE" = "YES" ]; then
        # Green by every signal this check used to have, and unable to answer.
        # Reported like a dead seat because operationally it is one: a dispatch
        # lands, is consumed, and produces nothing — with no error and no
        # worker_done to poll, so silence is the only symptom (#211, #212).
        line "$role" "MUTE" "$SEAT_HANDLE$age; claude pid(s) $SEAT_PIDS$husk_note — pane and process live, but its last turn was answered locally$mute_age: \"$SEAT_MUTE_REASON\""
        PROBLEMS+=("$role: seat is MUTE — it will consume a dispatch and produce nothing. Last turn came from the CLI, not the model$mute_age: \"$SEAT_MUTE_REASON\". Do NOT run restart-team.sh for this: the process is healthy and relaunching duplicates the session. Repair the live seat in place (a bad model pin clears with /model, sent into the existing pane), then re-run this check. (#212)")
        ROLE_FAIL=1
      elif { seat_probe_stall_check "$wtpath"; [ "$SEAT_STALL" = "YES" ]; }; then
        # Green by every signal above, holding a dispatch, and not working on
        # it. The other half of #212: the mute case answered locally, this one
        # produced NO reply of any kind — the turn never started. Reported like
        # a dead seat for the same reason MUTE is: a dispatch lands, is
        # consumed, and produces nothing.
        #
        # A permission prompt is NOT this. The library is explicit that a prompt
        # raised on a tool call leaves the transcript ending on the assistant's
        # tool_use record, which reads as answered — so this alarm can never
        # fire on one, and telling the operator to go look for one would send
        # them after the one cause that by construction is not there (#217).
        #
        # Reported here only, and deliberately NOT a SEAT_STATUS value, for the
        # reason stated at the top of this block: restart-team.sh relaunches on
        # any status other than OK, so a new one would stack a second session
        # onto a seat that still holds a live process (#212, #217).
        stall_age=""
        [ -n "$SEAT_STALL_AGE_S" ] && stall_age=" ${SEAT_STALL_AGE_S}s ago"
        line "$role" "STALLED" "$SEAT_HANDLE$age; claude pid(s) $SEAT_PIDS$husk_note — took a dispatch$stall_age, never began a turn, and burned no CPU across two confirmed windows [$SEAT_STALL_CPU]"
        PROBLEMS+=("$role: seat is STALLED — it received work$stall_age, never completed a turn, and is not working on it (CPU flat across two confirmed windows: $SEAT_STALL_CPU). It will consume the next dispatch and produce nothing. Do NOT run restart-team.sh for this: the process is alive and relaunching duplicates the session. Look at the live pane first: the seat took a dispatch and never began a turn, so expect a session that is up but idle — NOT a pending permission prompt, which this alarm cannot fire on (a prompt on a tool call leaves the transcript ending on an assistant record, which reads as answered). If it is genuinely wedged, close the seat before relaunching it. (#217)")
        ROLE_FAIL=1
      else
        # A broken mute check must not read as a clean one (#214). UNKNOWN is
        # the probe's "no verdict", and printing it as a bare OK was right for
        # the seat that simply has no transcript yet and wrong for a jq that has
        # started failing: that silently disables the mute check for this seat —
        # fleet-wide if it fails for all of them — while every line still says
        # OK. The same "green but useless" shape #212 exists to close, one level
        # up. So the cause decides. `unreadable` means the measurement itself
        # failed and is surfaced; the other causes mean it ran and there was
        # nothing to measure, which is the normal state of a fresh seat and
        # stays silent.
        #
        # It is a WARNING, never a problem, and the displayed status stays OK.
        # A check that cannot run is not evidence the seat is sick — treating it
        # as one would make the whole fleet fail closed the moment jq broke,
        # which is the false "your live seat is dead" this probe refuses to
        # produce. What it costs is knowledge, and the operator is told that.
        mute_note=""
        if [ "$SEAT_MUTE" = "UNKNOWN" ] && [ "$SEAT_MUTE_UNKNOWN" = "unreadable" ]; then
          mute_note=" — MUTE CHECK DID NOT RUN (transcript unreadable); liveness here is pane+process only"
          WARNINGS+=("$role: the mute check could not run (the transcript could not be read — an unreadable file or directory, jq missing, or a scan that aborted), so this OK covers pane and process only and a seat answering locally would still read OK. Check jq is on PATH and that this seat's transcript directory and its newest file are both readable (#214)")
        fi

        # The stall check gets the identical treatment, and for the identical
        # reason (#214): its two broken-measurement causes are surfaced and its
        # nothing-to-measure causes stay silent. Adding a check whose failure
        # read as a clean OK would re-open the exact class the mute check spent
        # three rounds closing. `unreadable` is the scan failing; `sample-invalid`
        # is the host having slept through all four CPU windows, which on this
        # machine (#194's 1-minute sleep setting) is a real and recurring
        # condition rather than a hypothetical one.
        # THE THIRD BLIND SPOT (#221), AND THE ONLY ONE THAT IS NOT ABOUT THE
        # SEAT AS IT STANDS RIGHT NOW.
        #
        # MUTE and STALLED both ask "can this seat finish the turn it is
        # holding". A seat can pass both — pane live, process live, last turn
        # answered by the model — and still belong to a loop that has stopped
        # producing work, because the failure is in the sessions that already
        # ENDED. Between 2026-09-01 19:19Z and 2026-09-02 13:28Z nine of eleven
        # scheduled coordinator runs took the CEO prompt, died on one network
        # error apiece, and left a transcript that looks fine in isolation. The
        # ops record went dark for 25 hours and every line of this report said
        # OK, correctly, the whole time.
        #
        # So this one is reported as a WARNING and NOT as a problem, which is a
        # deliberate difference from MUTE and STALLED and not an oversight:
        #
        #   * The seat is not sick. By the time this runs the failing sessions
        #     are gone and the process in front of us is healthy — which is
        #     exactly what fleet-liveness kept reporting throughout #221, and it
        #     was right. Raising ROLE_FAIL would print FLEET DEGRADED and point
        #     the reader at restart-team.sh, which is the WRONG repair for a
        #     seat whose process is alive: it stacks a second session on it.
        #   * The finding is retrospective, and a window-based count outlives
        #     the incident by design — the dark sessions age out only as new
        #     ones push them off the end. A retrospective finding that held the
        #     exit code non-zero for a day after recovery would train the loop
        #     to ignore exit 5, which currently means something sharp.
        #
        # What it must never be is SILENT, because silence is the entire defect
        # #221 describes. It gets a line on the seat and a warning that carries
        # the two numbers a reader needs: how many of the recent sessions
        # produced nothing, and when one last produced something — which is what
        # separates "the loop is dark right now" from "it was dark yesterday".
        dark_note=""
        seat_probe_dark_check "$wtpath"
        if [ "$SEAT_DARK" = "YES" ]; then
          if [ -n "$SEAT_DARK_LAST" ]; then
            dark_last="last produced work at $SEAT_DARK_LAST"
            [ -n "$SEAT_DARK_LAST_AGE_S" ] && \
              dark_last="$dark_last ($(( SEAT_DARK_LAST_AGE_S / 3600 ))h ago)"
          else
            dark_last="NO session in that window produced any work"
          fi
          dark_partial=""
          [ "$SEAT_DARK_UNREADABLE" -gt 0 ] && \
            dark_partial=" ($SEAT_DARK_UNREADABLE more could not be read, so the count is a floor)"
          dark_note=" — $SEAT_DARK_COUNT of the last $SEAT_DARK_TOTAL sessions produced no work"
          WARNINGS+=("$role: $SEAT_DARK_COUNT of the last $SEAT_DARK_TOTAL sessions on this seat produced NO work — they took a prompt and never got an answer from the model$dark_partial; $dark_last. The seat itself is healthy and this is NOT a restart: the failing sessions have already exited. For the coordinator seat this is the scheduled loop going dark (#221) — check ~/.thewebsite-coordinator-watchdog.log to confirm the slots fired, and expect a transport error (ENOTFOUND, an expired login, a timed-out request) as the single assistant record in each dead session.")
        elif [ "$SEAT_DARK" = "UNKNOWN" ] && [ "$SEAT_DARK_UNKNOWN" = "unreadable" ]; then
          # Same doctrine as the two notes below (#214): a check that could not
          # run must say so rather than read as a clean one.
          dark_note=" — DARK-RUN CHECK DID NOT RUN (transcripts unreadable)"
          WARNINGS+=("$role: the dark-run check could not run (the transcript directory could not be listed, or every session in the window failed to parse), so a seat whose recent scheduled runs all died on arrival would still read OK here. Check jq is on PATH and that this seat's transcript directory is readable (#221)")
        elif [ "$SEAT_DARK" = "NO" ] && [ "$SEAT_DARK_UNREADABLE" -gt 0 ]; then
          # A verdict was reached, but on fewer sessions than the window asked
          # for. Not an alarm — unreadable sessions are never counted as dark —
          # but the reader should know the window was measured incompletely.
          dark_note=" — dark-run window measured $SEAT_DARK_TOTAL of $(( SEAT_DARK_TOTAL + SEAT_DARK_UNREADABLE )) sessions"
          WARNINGS+=("$role: the dark-run check read only $SEAT_DARK_TOTAL of the $(( SEAT_DARK_TOTAL + SEAT_DARK_UNREADABLE )) sessions in its window ($SEAT_DARK_UNREADABLE could not be parsed). The verdict stands on the ones it could read and unreadable sessions are never counted as dark, so this understates rather than overstates (#221)")
        fi

        stall_note=""
        if [ "$SEAT_STALL" = "UNKNOWN" ] && [ "$SEAT_STALL_UNKNOWN" = "unreadable" ]; then
          stall_note=" — STALL CHECK DID NOT RUN (transcript unreadable)"
          WARNINGS+=("$role: the stall check could not run (the transcript could not be read — an unreadable file or directory, jq missing, or a scan that aborted), so a seat holding work it never answered would still read OK here. Check jq is on PATH and that this seat's transcript directory and its newest file are both readable (#217)")
        elif [ "$SEAT_STALL" = "UNKNOWN" ] && [ "$SEAT_STALL_UNKNOWN" = "sample-invalid" ]; then
          stall_note=" — STALL CHECK DID NOT RUN (host slept through the CPU windows)"
          WARNINGS+=("$role: this seat holds an unanswered turn, but the host slept through both CPU sample windows twice, so whether it is working could not be measured — a suspended process accrues no CPU either way. No verdict was taken rather than a guessed one. Re-run when the host is awake; the keep-awake decision is #194 (#217)")
        fi
        line "$role" "OK" "$SEAT_HANDLE$age; claude pid(s) $SEAT_PIDS$husk_note$mute_note$stall_note$dark_note"
        if [ "$SEAT_PID_COUNT" -gt 1 ]; then
          WARNINGS+=("$role: $SEAT_PID_COUNT claude processes share this worktree (pids $SEAT_PIDS) — likely a pre-restart generation left running; confirm by cwd+CPU before reaping (#155)")
        fi
      fi
      ;;
    DETACHED)
      line "$role" "DETACHED" "claude pid(s) $SEAT_PIDS alive but NO live agent pane$husk_note — runtime-restart signature"
      PROBLEMS+=("$role: agent process alive (pids $SEAT_PIDS) but its terminal detached — dispatches will land nowhere")
      ROLE_FAIL=1
      ;;
    NO-AGENT)
      line "$role" "NO-AGENT" "$SEAT_HANDLE is live but no claude process in $wtpath — bare shell, not a seat"
      PROBLEMS+=("$role: terminal exists but no agent process — the session exited")
      ROLE_FAIL=1
      ;;
    *)
      line "$role" "DOWN" "no live agent pane and no claude process$husk_note"
      PROBLEMS+=("$role: seat is down (no pane, no process)")
      ROLE_FAIL=1
      ;;
  esac
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
  scripts/restart-team.sh                       # every unhealthy seat; healthy seats are skipped
  scripts/restart-team.sh --only code-reviewer  # one seat, when that is all the unblock needs
A seat reported MUTE or STALLED is NOT in that set: its process is alive, so a
restart would stack a second session on it. Repair those in place instead —
a MUTE seat's reported reason says what it needs (a model pin clears with
/model sent into the existing pane), and a STALLED seat took a dispatch and
never began a turn at all, so look at the live pane before doing anything.
Relaunch only if that fails and you first close the seat.

Never let an automated run restart the fleet on its own — a restart racing a
coordinator run leaves two live sessions on one seat, and both answer dispatches.
Since #179 the restart skips seats this probe reports healthy (so it no longer
relaunches a live coordinator on top of itself), but skip-if-healthy is a
backstop, not a licence to automate recovery.
After a restart: re-arm the CEO crons (team/roles/ceo.md) and check
`orca orchestration task-list` for dispatches orphaned by the outage.
EOF

# First failing check in declared order wins, so the exit code names the most
# fundamental cause rather than the last one noticed.
if [ "$RUNTIME_OK" != "1" ]; then exit 3; fi
if [ "$DISK_FAIL" = "1" ]; then exit 4; fi
if [ "$ROLE_FAIL" = "1" ]; then exit 5; fi
exit 0
