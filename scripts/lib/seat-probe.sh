#!/usr/bin/env bash
# seat-probe.sh — the shared, READ-ONLY per-seat health probe (#179).
#
# One definition of "is this seat alive?", sourced by both fleet-liveness.sh
# (which reports) and restart-team.sh (which skips healthy seats). It was
# duplicated-by-omission before: liveness knew how to tell a live seat from a
# husk, and restart knew nothing at all, so the documented recovery command
# relaunched seats that were already up — including `coordinator`, the one seat
# that is usually alive during an outage because a scheduled coordinator run is
# what discovers it. That produced two live sessions on one seat, both
# answering dispatches: the exact hazard liveness prints a warning about.
#
# The probe checks two INDEPENDENT signals, because neither alone is enough
# (see the long-form rationale in fleet-liveness.sh):
#   pane    — a connected, writable Orca terminal with a non-null title and a
#             non-null lastOutputAt. A runtime restart leaves husks: panes with
#             a null title and no lastOutputAt.
#   process — a live `claude` whose cwd is exactly that role's worktree.
#
# This file defines functions only — sourcing it has no side effects. Nothing
# here mutates, launches, kills or repairs anything; keeping the probe inert is
# what makes it safe for the read-only preflight to share with the recovery
# script.
#
# Requires: orca, jq, lsof, ps. Written for bash 3.2 (macOS ships 3.2): no
# associative arrays, no `mapfile`, parallel arrays instead.
#
# Usage:
#   . "$(dirname "$0")/lib/seat-probe.sh"
#   seat_probe_scan_processes            # once per run — builds the pid->cwd map
#   seat_probe_classify "$worktree_path" # per seat — sets SEAT_* below
#
# After seat_probe_classify, these globals describe that seat:
#   SEAT_STATUS       OK | DETACHED | NO-AGENT | DOWN | MISSING
#   SEAT_PIDS         space-separated claude pids with that cwd ("" if none)
#   SEAT_PID_COUNT    count of the above
#   SEAT_HANDLE       live agent pane handle ("" if none)
#   SEAT_LAST_OUTPUT  epoch-ms of that pane's last output ("" if none)
#   SEAT_AGE_S        seconds since last output ("" if unknown)
#   SEAT_HUSKS        count of husk panes for that worktree
#
# Only SEAT_STATUS=OK means "reachable" — a dispatch will land. Every other
# value means a dispatch goes nowhere, but they are NOT interchangeable:
# DETACHED still has a live process (reaping it is a separate decision from
# relaunching a pane), while DOWN has neither.

# Build the pid -> cwd map for every live `claude` process on the machine.
# Deliberately independent of the Orca runtime: a runtime restart leaves these
# processes running while their terminals detach, and that gap is the whole
# signal.
#
# Enumerated with `ps -A`, NOT `pgrep`. Verified 2026-07-20: pgrep (both -x and
# -f) does not report the `claude` process that is an ancestor of the calling
# shell, while `ps -A` lists it — so a seat probing itself was reported as
# NO-AGENT. A false "your live seat is down" is the most damaging output this
# probe can produce: it invites a restart of a healthy seat, which is the
# duplicate-session hazard. Match on the basename of comm, since ps reports
# some processes with a full path.
seat_probe_scan_processes() {
  SEAT_PROBE_PIDS=()
  SEAT_PROBE_CWDS=()
  local pid cwd
  for pid in $(ps -Ao pid=,comm= 2>/dev/null | awk '{n=split($2,p,"/"); if (p[n]=="claude") print $1}'); do
    cwd="$(lsof -a -d cwd -p "$pid" -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)"
    [ -n "$cwd" ] || continue
    SEAT_PROBE_PIDS+=("$pid")
    SEAT_PROBE_CWDS+=("$cwd")
  done
}

# Echo the pids whose cwd is exactly <path>.
seat_probe_pids_for_path() {
  local target="$1" i=0 out=""
  while [ "$i" -lt "${#SEAT_PROBE_PIDS[@]}" ]; do
    if [ "${SEAT_PROBE_CWDS[$i]}" = "$target" ]; then
      out="$out ${SEAT_PROBE_PIDS[$i]}"
    fi
    i=$(( i + 1 ))
  done
  echo "${out# }"
}

# Classify one seat by its worktree PATH.
#
# Worktrees are addressed by path, never by `name:` — Orca resolves display
# names GLOBALLY with no repo scoping, so a same-named worktree in another
# project would otherwise report this fleet as healthy when it is not.
seat_probe_classify() {
  local wtpath="$1"
  SEAT_STATUS=""
  SEAT_PIDS=""
  SEAT_PID_COUNT=0
  SEAT_HANDLE=""
  SEAT_LAST_OUTPUT=""
  SEAT_AGE_S=""
  SEAT_HUSKS=0

  if [ ! -d "$wtpath" ]; then
    SEAT_STATUS="MISSING"
    return 0
  fi

  local terms
  terms="$(orca terminal list --worktree "path:$wtpath" --json 2>/dev/null || true)"

  SEAT_HANDLE="$(jq -r --arg p "$wtpath" '
    [ .result.terminals[]?
      | select(.worktreePath == $p and .connected and .writable
               and .title != null and .title != "" and .lastOutputAt != null and .lastOutputAt > 0) ]
    | sort_by(.lastOutputAt) | reverse | (first // {}) | .handle // empty' <<<"$terms" 2>/dev/null || true)"
  SEAT_LAST_OUTPUT="$(jq -r --arg p "$wtpath" '
    [ .result.terminals[]?
      | select(.worktreePath == $p and .connected and .writable
               and .title != null and .title != "" and .lastOutputAt != null and .lastOutputAt > 0) ]
    | sort_by(.lastOutputAt) | reverse | (first // {}) | .lastOutputAt // empty' <<<"$terms" 2>/dev/null || true)"
  SEAT_HUSKS="$(jq -r --arg p "$wtpath" '
    [ .result.terminals[]?
      | select(.worktreePath == $p and ((.title // "") == "" or (.lastOutputAt // 0) == 0)) ]
    | length' <<<"$terms" 2>/dev/null || echo 0)"
  [ -n "$SEAT_HUSKS" ] || SEAT_HUSKS=0

  SEAT_PIDS="$(seat_probe_pids_for_path "$wtpath")"
  [ -n "$SEAT_PIDS" ] && SEAT_PID_COUNT="$(wc -w <<<"$SEAT_PIDS" | tr -d ' ')"

  if [ -n "$SEAT_LAST_OUTPUT" ]; then
    local now_ms
    now_ms=$(( $(date +%s) * 1000 ))
    SEAT_AGE_S=$(( (now_ms - SEAT_LAST_OUTPUT) / 1000 ))
    [ "$SEAT_AGE_S" -lt 0 ] && SEAT_AGE_S=0
  fi

  if [ -n "$SEAT_HANDLE" ] && [ "$SEAT_PID_COUNT" -gt 0 ]; then
    SEAT_STATUS="OK"
  elif [ -z "$SEAT_HANDLE" ] && [ "$SEAT_PID_COUNT" -gt 0 ]; then
    SEAT_STATUS="DETACHED"
  elif [ -n "$SEAT_HANDLE" ] && [ "$SEAT_PID_COUNT" -eq 0 ]; then
    SEAT_STATUS="NO-AGENT"
  else
    SEAT_STATUS="DOWN"
  fi
  return 0
}
