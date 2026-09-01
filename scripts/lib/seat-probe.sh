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
# Optionally, and ONLY for a reporting caller:
#   seat_probe_mute_check "$worktree_path"   # sets SEAT_MUTE* below
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
#
# And after seat_probe_mute_check (#212):
#   SEAT_MUTE         YES | NO | UNKNOWN
#   SEAT_MUTE_REASON  the local decline's own text ("" unless YES)
#   SEAT_MUTE_TS      that message's timestamp ("" unless YES)
#   SEAT_MUTE_AGE_S   seconds since it, when derivable ("" otherwise)
#
# WHY THIS IS SEPARATE FROM seat_probe_classify, AND MUST STAY SEPARATE (#212)
#
# A seat can be pane-live and process-live and still be unable to complete a
# turn. On 2026-08-31/09-01 the code-reviewer seat was pinned to an exhausted
# model: it consumed every dispatch in ~1s and declined locally, so four
# consecutive runs read `code-reviewer OK` while no review could happen (#211).
# Both signals this probe measures really were green — the gap is that neither
# measures a COMPLETED TURN.
#
# The fix is additive on purpose. SEAT_STATUS keeps its exact current meaning
# and vocabulary, because restart-team.sh branches on it: it skips a seat only
# when SEAT_STATUS = OK, and every other value falls through to relaunch. A new
# SEAT_STATUS value would therefore make restart-team.sh relaunch a seat whose
# claude process is ALIVE — two live sessions on one seat, both answering
# dispatches, which is the precise hazard this shared probe was written to
# remove. So muteness is reported through its own globals, and this function is
# never called by seat_probe_classify. restart-team.sh does not call it and is
# byte-for-byte unaffected.
#
# That is also operationally right: a restart is the WRONG repair for a mute
# seat. The process is healthy; run 510 cleared the real incident by sending
# `/model opus` into the existing seat, in seconds, killing nothing.

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

# --- muteness (#212) --------------------------------------------------------
#
# Transcript root and the one decline text that is NOT a fault, both overridable
# so the check is testable against fixtures without touching a real seat.
SEAT_PROBE_SESSION_BASE="${SEAT_PROBE_SESSION_BASE:-$HOME/.claude/projects}"
SEAT_PROBE_BENIGN_DECLINE="${SEAT_PROBE_BENIGN_DECLINE:-No response requested.}"

# Worktree path -> transcript directory. Same slug rule the coordinator
# watchdog already uses (every non-alphanumeric becomes '-'), deliberately
# reused rather than re-derived so the two cannot drift apart.
seat_probe_session_dir() {
  printf '%s/%s\n' "$SEAT_PROBE_SESSION_BASE" "$(printf '%s' "$1" | sed 's/[^A-Za-z0-9]/-/g')"
}

# Decide whether a seat's LAST turn was answered by the model or by the CLI.
#
# The tell is structural, not a string match: the CLI records a local decline as
# an assistant message with model "<synthetic>" and zero input+output tokens.
# Measured across every seat transcript on this host, that signature covers the
# whole family of causes that leave a seat green but useless — exhausted
# credits, an expired login, a revoked token, and transient API failures alike.
#
# Exactly one local decline is BENIGN and must not raise an alarm: the
# "No response requested." the CLI writes when a dispatch asked for no reply.
# That is a normal, healthy end state and was the one false positive available
# here, so it is suppressed explicitly rather than left to a heuristic.
#
# Everything else fails CLOSED to reporting but OPEN to alarm severity: the
# decline's own text is carried out verbatim in SEAT_MUTE_REASON instead of
# being sorted into a guessed taxonomy of error strings. "You're out of usage
# credits" and "API Error: 529 Overloaded" need different responses, and the
# reader can tell them apart at a glance; this probe should not pretend to.
#
# Every ambiguity yields UNKNOWN, which reports nothing: no transcript
# directory, no readable session file, no assistant message, or jq unable to
# parse. A false "your live seat is dead" is the most damaging output this file
# can produce, so absence of evidence never becomes evidence of muteness.
seat_probe_mute_check() {
  local wtpath="$1" dir newest last ts model toks text base epoch now

  SEAT_MUTE="UNKNOWN"
  SEAT_MUTE_REASON=""
  SEAT_MUTE_TS=""
  SEAT_MUTE_AGE_S=""

  dir="$(seat_probe_session_dir "$wtpath")"
  [ -d "$dir" ] || return 0

  newest="$(ls -t "$dir"/*.jsonl 2>/dev/null | head -1)"
  [ -n "$newest" ] && [ -r "$newest" ] || return 0

  # `fromjson? | objects` survives both malformed lines and bare scalars: a
  # single bad line must not abort the pass and take the verdict with it.
  last="$(jq -Rrc '
      fromjson? | objects
      | select(.type == "assistant")
      | [ (.timestamp // ""),
          (.message.model // ""),
          ((.message.usage.input_tokens // 0) + (.message.usage.output_tokens // 0)),
          ((.message.content[0].text) // "") ]
      | @tsv' "$newest" 2>/dev/null | tail -1)"
  [ -n "$last" ] || return 0

  ts="$(printf '%s' "$last" | cut -f1)"
  model="$(printf '%s' "$last" | cut -f2)"
  toks="$(printf '%s' "$last" | cut -f3)"
  text="$(printf '%s' "$last" | cut -f4-)"

  # A real answer from the model: not mute, and nothing more to say.
  if [ "$model" != "<synthetic>" ] || [ "$toks" != "0" ]; then
    SEAT_MUTE="NO"
    return 0
  fi

  case "$text" in
    "$SEAT_PROBE_BENIGN_DECLINE"*)
      SEAT_MUTE="NO"
      return 0
      ;;
  esac

  SEAT_MUTE="YES"
  SEAT_MUTE_REASON="$text"
  SEAT_MUTE_TS="$ts"

  # Age is a convenience, never a gate — a decline is the last word on this
  # seat whether it landed a minute or a week ago. If the timestamp will not
  # parse, report muteness without it rather than suppressing the finding.
  base="${ts%%.*}"
  base="${base%Z}"
  epoch="$(TZ=UTC date -j -f '%Y-%m-%dT%H:%M:%S' "$base" '+%s' 2>/dev/null || true)"
  if [ -n "$epoch" ]; then
    now="$(date +%s)"
    SEAT_MUTE_AGE_S=$(( now - epoch ))
    [ "$SEAT_MUTE_AGE_S" -lt 0 ] && SEAT_MUTE_AGE_S=0
  fi

  return 0
}
