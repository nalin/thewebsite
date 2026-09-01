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
#   SEAT_MUTE_REASON  the trailing decline's own text ("" if there is none)
#   SEAT_MUTE_TS      that message's timestamp ("" if there is none)
#   SEAT_MUTE_AGE_S   seconds since it, when derivable ("" otherwise)
#   SEAT_MUTE_RUN     how many consecutive local declines the transcript ends on
#   SEAT_MUTE_UNKNOWN why the verdict is UNKNOWN ("" unless SEAT_MUTE=UNKNOWN)
#
# UNKNOWN IS NOT ONE CONDITION, AND THE DIFFERENCE IS THE WHOLE POINT (#214)
#
# Every ambiguity in the mute check yields UNKNOWN, and a reporting caller shows
# UNKNOWN as nothing at all — no line, no problem entry. That is right for a
# seat with no transcript yet and wrong for a jq that has started failing: the
# second one silently disables the mute check for that seat, and fleet-wide if
# it fails for every seat, while the report still reads OK. Same "green but
# useless" shape #212 exists to close, one level up. So the cause is carried
# out alongside the verdict and callers can tell the two apart:
#
#   no-transcript-dir     this seat has no transcript directory
#   no-transcript         no readable .jsonl in it
#   no-assistant-message  the transcript holds no assistant turn yet
#   unexplained-decline   a local decline carrying no text to explain itself
#   unreadable            THE CHECK ITSELF FAILED — jq missing, unreadable
#                         file, or a parse that aborted partway
#
# Only `unreadable` means the measurement is broken. The other four mean it ran
# and there was legitimately nothing to measure, which is the normal state of a
# freshly launched seat and must stay silent.
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
# How many consecutive local declines the transcript must END on before the seat
# is called mute. See the persistence rationale in seat_probe_mute_check.
SEAT_PROBE_MUTE_MIN_DECLINES="${SEAT_PROBE_MUTE_MIN_DECLINES:-2}"
SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT=2

# An unvalidated tunable does not fail neutrally here, it fails toward ALARM:
# `[ abc -lt 2 ]` returns status 2, the `if` reads that as false, control falls
# through to SEAT_MUTE="YES", and the check becomes unconditionally-mute while
# leaking a raw `integer expression expected` into the report (#214). So
# validate at use and fail OPEN to the default, the same doctrine
# coordinator-watchdog.sh applies to its own tunables — an invalid override must
# not skew the measurement. The warning goes to stderr because a silent fallback
# would make a typo'd knob undetectable.
seat_probe_min_declines() {
  case "${SEAT_PROBE_MUTE_MIN_DECLINES:-}" in
    "" | *[!0-9]*)
      printf 'seat-probe: SEAT_PROBE_MUTE_MIN_DECLINES must be a positive integer (got %s) — using %s\n' \
        "'${SEAT_PROBE_MUTE_MIN_DECLINES:-}'" "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT" >&2
      printf '%s\n' "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT"
      return 0
      ;;
  esac
  if [ "$SEAT_PROBE_MUTE_MIN_DECLINES" -lt 1 ]; then
    printf 'seat-probe: SEAT_PROBE_MUTE_MIN_DECLINES must be >= 1 (got %s) — using %s\n' \
      "$SEAT_PROBE_MUTE_MIN_DECLINES" "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT" >&2
    printf '%s\n' "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT"
    return 0
  fi
  printf '%s\n' "$SEAT_PROBE_MUTE_MIN_DECLINES"
}

# Initialised at source time so a caller that reads them before ever calling
# seat_probe_mute_check cannot trip `set -u`. SEAT_STATUS gets the same
# treatment from restart-team.sh; this file should not depend on that.
SEAT_MUTE="UNKNOWN"
SEAT_MUTE_REASON=""
SEAT_MUTE_TS=""
SEAT_MUTE_AGE_S=""
SEAT_MUTE_RUN=0
SEAT_MUTE_UNKNOWN="no-transcript-dir"

# Worktree path -> transcript directory. Same slug rule the coordinator
# watchdog already uses (every non-alphanumeric becomes '-'), deliberately
# reused rather than re-derived so the two cannot drift apart.
seat_probe_session_dir() {
  printf '%s/%s\n' "$SEAT_PROBE_SESSION_BASE" "$(printf '%s' "$1" | sed 's/[^A-Za-z0-9]/-/g')"
}

# Decide whether a seat is MUTE: pane- and process-live, but unable to complete
# a turn.
#
# The tell is structural, not a string match: the CLI records a local decline as
# an assistant message with model "<synthetic>" and zero input+output tokens.
# Measured across every seat transcript on this host, that signature covers the
# whole family of causes that leave a seat green but useless.
#
# BUT A SINGLE DECLINE IS NOT MUTENESS, and this is the correction that makes
# the check usable. Measured over 308 real transcripts: 143 of them END on a
# local decline, and 100 of those 143 are TRANSIENT transport conditions —
# ENOTFOUND, "your computer went to sleep mid-response", connection closed,
# request timed out — where the seat is perfectly healthy and answers the next
# dispatch. Only ~40 are durable (an expired login, a revoked token, an
# exhausted model pin). Host sleep and DNS blips are endemic here, so a check
# that fires on one decline would go red on the single most common way a session
# ends — and a check that is usually wrong is one the loop learns to ignore,
# which is exactly how the durable case gets missed again. That was measured on
# the review of this very change: the reviewing seat recorded "API Error:
# Connection lost mid-response", then went on to complete the review.
#
# So require PERSISTENCE instead of guessing at the wording of errors. Every one
# of those 143 historical cases ends on a run of exactly ONE decline. The real
# incident (#211) does not: its consecutive-decline run grows 1, 2, 3, 4 across
# the four starved dispatches. Requiring SEAT_PROBE_MUTE_MIN_DECLINES (2)
# suppresses all 143 single-event false positives and still catches the real
# thing from the second dispatch onward, at a cost of one cycle of latency.
# That measures muteness rather than inferring it from an error's text.
#
# One decline is BENIGN outright: the "No response requested." the CLI writes
# when a dispatch asked for no reply. It is a normal, healthy end state, so it
# BREAKS the consecutive run rather than extending it. Counting it would let one
# transient blip plus one normal no-reply dispatch add up to run=2 — a
# manufactured alarm of exactly the shape the persistence gate exists to
# prevent. Rare (2 benign declines in 306 transcripts) but a plain
# inconsistency; fixed in #214.
#
# The decline's own text is carried out verbatim rather than sorted into a
# guessed taxonomy: "You're out of usage credits" and "API Error: 529
# Overloaded" need different responses and the reader can tell them apart.
#
# Every ambiguity yields UNKNOWN: no transcript directory, no readable session
# file, no assistant message, jq unable to parse, or a decline with no text to
# explain itself. A false "your live seat is dead" is the most damaging output
# this file can produce, so absence of evidence never becomes evidence of
# muteness. UNKNOWN carries its cause in SEAT_MUTE_UNKNOWN so a caller can tell
# "nothing to measure" from "the measurement broke" — see the header; the
# verdict is identical either way, only the visibility differs.
#
# KNOWN REMAINING GAP (#212): this detects a local DECLINE, not "no completed
# turn". A seat wedged with no assistant message at all — a permission prompt
# swallowed mid-turn — still reports OK here.
seat_probe_mute_check() {
  local wtpath="$1" dir newest f res run ts model toks text base epoch now min_declines
  local jq_out jq_rc

  SEAT_MUTE="UNKNOWN"
  SEAT_MUTE_REASON=""
  SEAT_MUTE_TS=""
  SEAT_MUTE_AGE_S=""
  SEAT_MUTE_RUN=0
  SEAT_MUTE_UNKNOWN="no-transcript-dir"

  dir="$(seat_probe_session_dir "$wtpath")"
  [ -d "$dir" ] || return 0
  SEAT_MUTE_UNKNOWN="no-transcript"

  # Newest .jsonl, chosen WITHOUT a pipeline. `ls -t ... | head -1` looks
  # equivalent and is not: head exits after one line, ls takes SIGPIPE, and
  # under this file's callers (`set -euo pipefail`) that 141 propagates and
  # kills the whole run. It hides on a small directory — ls finishes into the
  # pipe buffer before head closes it — and only fires once a seat accumulates
  # enough transcripts to outrun the buffer. The coordinator seat has 303,
  # which truncated fleet-liveness to five lines and exit 141. No pipe, no bug.
  newest=""
  for f in "$dir"/*.jsonl; do
    [ -e "$f" ] || continue
    if [ -z "$newest" ] || [ "$f" -nt "$newest" ]; then
      newest="$f"
    fi
  done
  [ -n "$newest" ] && [ -r "$newest" ] || return 0

  # `fromjson? | objects` survives malformed lines and bare scalars, but that
  # only covers a line that will not PARSE. A line that parses into the wrong
  # SHAPE — `.message` a string, `.message.usage` a string, `.message.content`
  # a string — makes the accessor a type error, and a type error aborts the
  # whole jq pass. Because the verdict is read from the TAIL of what jq
  # emitted, an abort on the trailing record silently yields a verdict from an
  # OLDER message: the one path in this file that fails to a *wrong* answer
  # rather than to UNKNOWN. #213 guarded the content accessor, which closed the
  # two observed instances; every other accessor was still bare, so the class
  # stayed open (#214).
  #
  # So each accessor is type-guarded to DEGRADE rather than abort: a malformed
  # record still emits, with empty/zero fields. That matters more than skipping
  # it would — a skipped trailing record leaves the same stale tail an abort
  # does, whereas a degraded one is not "<synthetic>" and so reads as a real
  # answer, i.e. MUTE=NO. Ambiguity fails toward "this seat is fine", never
  # toward a false "your live seat is dead".
  #
  # The token total is why that last sentence needs -1 rather than 0. Mapping an
  # UNREADABLE usage block to 0 would have been the one place the invariant
  # broke: combined with model "<synthetic>" it reads as a confirmed local
  # decline, so a garbage usage block would COUNT TOWARD the run and fail toward
  # alarm (measured at the #214 gate: NO run=0 -> YES run=3). -1 says "no
  # readable count", which both breaks the awk run and fails the shell's != "0"
  # test, so the record reads as a real answer like every other degraded shape.
  # This costs nothing in detection: all 177 synthetic declines across the 364
  # real transcripts on this host carry a numeric usage block.
  #
  # jq runs on its OWN, with its exit status captured, rather than heading a
  # pipeline whose status is absorbed by `|| true`. Absorbing it was necessary —
  # callers run `set -euo pipefail`, so a non-zero anywhere in the pipeline
  # propagates out of the command substitution and `set -e` kills the WHOLE
  # caller; jq missing from PATH took fleet-liveness down with exit 127 rather
  # than degrading this one seat (the #155 SIGPIPE class). But absorbing it also
  # THREW THE STATUS AWAY, and that cost two things:
  #
  #   1. A failed check became indistinguishable from an empty transcript. Both
  #      left $res empty and both read as UNKNOWN, which a reporting caller
  #      prints as nothing — so a jq that starts failing at runtime disables the
  #      mute check invisibly (#214).
  #   2. A jq that aborted PARTWAY still had its partial output consumed, and
  #      the verdict is read from the TAIL of what was emitted. That is the
  #      stale-verdict class: an abort on the trailing record yields a verdict
  #      from an older message. The type guards above close the shapes seen so
  #      far; refusing to read a verdict out of a failed pass closes the class
  #      whatever the next unguarded shape turns out to be.
  #
  # `|| jq_rc=$?` keeps `set -e` off it while preserving the status, and a
  # non-zero now means UNKNOWN/unreadable — never a verdict.
  jq_rc=0
  jq_out="$(jq -Rrc '
      fromjson? | objects
      | select(.type == "assistant")
      | ((.message | objects) // {}) as $m
      | (($m.usage | objects) // {}) as $u
      | (($m.content | arrays) // []) as $c
      | [ ((.timestamp | strings) // ""),
          (($m.model | strings) // ""),
          ([ ($u.input_tokens | numbers), ($u.output_tokens | numbers) ] as $t
           | if ($t | length) == 0 then -1 else ($t | add) end),
          (((($c[0] | objects) // {}) | (.text | strings)) // "") ]
      | @tsv' "$newest" 2>/dev/null)" || jq_rc=$?

  if [ "$jq_rc" -ne 0 ]; then
    SEAT_MUTE_UNKNOWN="unreadable"
    return 0
  fi
  if [ -z "$jq_out" ]; then
    SEAT_MUTE_UNKNOWN="no-assistant-message"
    return 0
  fi

  # awk walks the emitted messages and reports the length of the trailing run of
  # consecutive local declines together with the last message's fields. A BENIGN
  # decline breaks that run rather than extending it: "No response requested."
  # is a healthy end state, so counting it as one of the two consecutive
  # failures-to-complete-a-turn could manufacture a run=2 out of one real
  # transient blip plus one normal no-reply dispatch — the exact false positive
  # the persistence gate exists to prevent (#214).
  res="$(printf '%s\n' "$jq_out" \
    | SEAT_PROBE_BENIGN_DECLINE="$SEAT_PROBE_BENIGN_DECLINE" awk -F'\t' '
        BEGIN { benign = ENVIRON["SEAT_PROBE_BENIGN_DECLINE"] }
        { n++; ts[n]=$1; mo[n]=$2; tk[n]=$3; tx[n]=$4 }
        END {
          if (n == 0) exit 0
          run = 0
          for (i = n; i >= 1; i--) {
            if (mo[i] != "<synthetic>" || tk[i] + 0 != 0) break
            # An empty override must not turn index() into "everything is
            # benign", which would make the seat permanently unmutable.
            if (benign != "" && index(tx[i], benign) == 1) break
            run++
          }
          printf "%d\t%s\t%s\t%s\t%s\n", run, ts[n], mo[n], tk[n], tx[n]
        }' || true)"
  # jq emitted lines, so awk had at least one record and always prints. An empty
  # $res here therefore means awk itself failed — a broken check, not no data.
  if [ -z "$res" ]; then
    SEAT_MUTE_UNKNOWN="unreadable"
    return 0
  fi

  run="$(printf '%s' "$res" | cut -f1)"
  ts="$(printf '%s' "$res" | cut -f2)"
  model="$(printf '%s' "$res" | cut -f3)"
  toks="$(printf '%s' "$res" | cut -f4)"
  text="$(printf '%s' "$res" | cut -f5-)"

  # A real answer from the model: not mute, and nothing more to say.
  if [ "$model" != "<synthetic>" ] || [ "$toks" != "0" ]; then
    SEAT_MUTE="NO"
    SEAT_MUTE_UNKNOWN=""
    return 0
  fi

  # The -n guard is the point of this block, and it mirrors the identical guard
  # in the awk loop above; without it the two disagree. The expansion is quoted,
  # so an override's glob metacharacters are LITERAL — '*' matches a text
  # BEGINNING with an asterisk, not everything. (An earlier revision of this
  # comment claimed the opposite and named glob metacharacters as the hazard.
  # That was measured wrong at the #214 gate: '*', '?' and 'You*' all leave a
  # mute seat correctly reporting YES.) The real hazard is an EMPTY value, which
  # collapses the pattern to a bare '*' that does match everything and would
  # make the seat permanently unmutable — the same hole the awk guard closes,
  # one layer up, and unreachable through the environment only because the `:-`
  # default above rewrites an empty override before it gets here.
  if [ -n "$SEAT_PROBE_BENIGN_DECLINE" ]; then
    case "$text" in
      "$SEAT_PROBE_BENIGN_DECLINE"*)
        SEAT_MUTE="NO"
        SEAT_MUTE_UNKNOWN=""
        return 0
        ;;
    esac
  fi

  # A decline with no text cannot explain itself; raising an unexplained alarm
  # is worse than raising none.
  if [ -z "$text" ]; then
    SEAT_MUTE_UNKNOWN="unexplained-decline"
    return 0
  fi

  SEAT_MUTE_REASON="$text"
  SEAT_MUTE_TS="$ts"
  SEAT_MUTE_RUN="$run"

  # Persistence gate: one decline is overwhelmingly a transient blip.
  min_declines="$(seat_probe_min_declines)"
  if [ "$run" -lt "$min_declines" ]; then
    SEAT_MUTE="NO"
    SEAT_MUTE_UNKNOWN=""
    return 0
  fi

  SEAT_MUTE="YES"
  SEAT_MUTE_UNKNOWN=""

  # Age is a convenience, never a gate. If the timestamp will not parse, report
  # muteness without it rather than suppressing the finding.
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
