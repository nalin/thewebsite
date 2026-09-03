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
#   seat_probe_stall_check "$worktree_path"  # sets SEAT_STALL* below; SLEEPS
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
# And after seat_probe_stall_check (#217):
#   SEAT_STALL         YES | NO | UNKNOWN
#   SEAT_STALL_TS      timestamp of the trailing unanswered user record ("" if none)
#   SEAT_STALL_AGE_S   seconds since it, when derivable ("" otherwise)
#   SEAT_STALL_CPU     the measured per-pid CPU deltas, for the report ("" if
#                      no window was taken)
#   SEAT_STALL_UNKNOWN why the verdict is UNKNOWN ("" unless SEAT_STALL=UNKNOWN)
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
#   no-transcript-dir     this seat has no transcript directory at all
#   no-transcript         no .jsonl in it at all
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
#
# It takes no CEILING — over-large, it should demand a decline run no transcript
# can reach, which reports the seat NOT mute, toward "the seat is fine" and the
# only direction this file may fail in. The knob whose over-large value points
# the other way is SEAT_PROBE_CPU_FLOOR_CS, and that one is bounded (#222).
#
# BUT "NO CEILING" IS NOT THE SAME AS "NO MAGNITUDE SCREEN", and reading it that
# way left this knob failing toward ALARM — found by the retained harness (#225)
# on the very invariant the harness was written to sweep. A hand-rolled
# `[ "$val" -lt 1 ]` cannot judge a 20-digit value: under bash 3.2 it does not
# wrap, it ERRORS with `integer expression expected` and returns status 2, the
# `if` reads that as false, and control falls through to the bottom — returning
# the raw over-large value. It then fails the SAME way one layer up, where
# `[ "$run" -lt "$min_declines" ]` errors identically and falls through to
# SEAT_MUTE="YES". Measured: SEAT_PROBE_MUTE_MIN_DECLINES=18446744073709551617
# turns ONE transient decline into a mute verdict and leaks the raw `[` error
# into the report — precisely the two failures the validation in this function
# exists to prevent, surviving inside it for every value `[` cannot compare.
#
# So the check is not hand-rolled any more: it delegates to seat_probe_uint,
# whose digit-count screen (#222) refuses a value before any arithmetic sees it.
# Same doctrine, one implementation — an unbounded max there still means "no
# ceiling", and the 18-digit cutoff rejects only what `[` could not have
# compared anyway. A forward reference: seat_probe_uint is defined further down,
# which is fine because nothing calls this at source time.
seat_probe_min_declines() {
  seat_probe_uint SEAT_PROBE_MUTE_MIN_DECLINES \
    "${SEAT_PROBE_MUTE_MIN_DECLINES:-}" \
    "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT" 1 ""
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
# NOT THE SAME CHECK AS seat_probe_stall_check (#217). This one detects a local
# DECLINE: the seat answered, just not with the model. Its transcript therefore
# ends on an ASSISTANT record, which is precisely the record
# seat_probe_stall_check requires to be absent. A seat that produced no
# assistant message at all reports MUTE=NO here and is caught there instead.
#
# In the ordinary case the two verdicts do not overlap, but that is NOT a
# structural guarantee and it was wrong to state it as one: a transcript of
# [decline, decline, dispatch] yields MUTE=YES and also opens the stall gate.
# What actually keeps them apart is the CALLER — fleet-liveness.sh tests MUTE
# first and reaches the stall check only in the elif — so a caller that ran
# both independently would have to decide the precedence itself.
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

  # The directory guard needs the same split the file guard got in #218, for the
  # same reason and with the same failure if it does not: `[ -d ]` stays true on
  # an unreadable directory (stat works through the parent), the glob below then
  # expands to nothing because it cannot be READ, and the seat lands on the
  # silent "no transcripts here" path — a permission-broken directory disabling
  # the mute check with no line and no warning.
  #
  # -r is what the glob needs; -x is what stat'ing the entries needs (`[ -e ]`
  # and `-nt` in the loop). chmod 000 removes both, and either alone is enough
  # to make the enumeration lie, so both are required before trusting it.
  #
  # This is the LAST of the guards that run before jq. Every one of them can
  # fail for two distinguishable reasons — "there is nothing here" and "I cannot
  # look" — and each was written folding the two together, so the whole class
  # had to be closed one guard at a time: jq's exit status (#216), the file
  # (#218), and now the directory. The set is closed, and the invariant to hold
  # any future guard to is stated once here: a guard that returns without a
  # verdict MUST say which of the two it is.
  if [ ! -r "$dir" ] || [ ! -x "$dir" ]; then
    SEAT_MUTE_UNKNOWN="unreadable"
    return 0
  fi

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
  [ -n "$newest" ] || return 0

  # These two are not the same condition and must not share a cause. An empty
  # directory is "nothing to measure" and stays silent; a transcript that EXISTS
  # and cannot be read is the check failing, and #216's whole point is that a
  # failed check must say so. Folding them together left a permission-broken
  # transcript silently disabling the mute check for that seat — the exact
  # failure #216 was written to close, surviving inside its own fix because this
  # guard runs before jq and so never reached the status capture.
  if [ ! -r "$newest" ]; then
    SEAT_MUTE_UNKNOWN="unreadable"
    return 0
  fi

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

# --- stalled: received work, never completed a turn (#217) ------------------
#
# The other half of #212. seat_probe_mute_check catches a seat that ANSWERED
# locally; this catches one that did not answer AT ALL. That seat is pane-live
# and process-live, reports OK, consumes the next dispatch and produces
# nothing: operationally identical to the mute case, and invisible to every
# other signal in this file.
#
# THE EXACT SHAPE CAUGHT, STATED NARROWLY SO IT IS NOT OVERSOLD
#
# A dispatch that is followed by NO assistant record. That is a real and
# current failure: session f1f60284 in the coordinator worktree took the CEO
# prompt at 2026-09-02T11:45:53Z and wrote one user record and zero assistant
# records before the watchdog reaped it two hours later (#221).
#
# It does NOT catch a turn wedged AFTER the model has spoken — a permission
# prompt raised on a tool call leaves the transcript ending on the assistant's
# tool_use record, and this check reads that as answered. Detecting that needs
# a different signal, and claiming it here would be the kind of check that is
# usually wrong the file already has three issues about.
#
# THE SIGNAL IS LOCAL TO THE TRANSCRIPT — NO DISPATCH RECORDS NEEDED
#
# #214 assumed this needed "age of the last turn relative to a dispatch". It
# does not, which matters because the orchestration run binding is fenced and
# this probe cannot read it. A dispatch lands in the transcript as a `user`
# record; a completed turn is an `assistant` record after it. "Received work,
# never completed a turn" is just a transcript ENDING ON AN UNANSWERED `user`
# RECORD — the same file seat_probe_mute_check already reads.
#
# AND THAT SIGNAL ALONE CANNOT DO THE JOB, WHICH IS WHY THERE IS A SECOND ONE
#
# The tail of legitimate turns is enormous. Measured over the 308 transcripts
# on this host: 85 real user->assistant gaps exceeded an hour and the longest
# took five. So a waiting-time threshold low enough to catch a seat wedged for
# twenty minutes fires on hundreds of turns that were simply long, and one
# above the observed max catches nothing. There is no usable threshold, and the
# failing direction here is a false "your live seat is dead" — the single
# output this file is written never to produce.
#
# So the transcript signal is paired with a CONFIRMED-IDLE CPU READING, the
# protocol coordinator-watchdog.sh already uses (#205, #207): sample CPU across
# a window, then confirm with a SECOND window, because one sample cannot tell a
# working process from a stuck one.
#
#   unanswered `user` record  AND  CPU flat across two confirmed windows
#     = a seat that received work and is not working on it
#
# A long-running turn fails the second condition BY CONSTRUCTION, which is
# exactly what the age threshold alone could not do.
#
# Measured live on this host, reproducing #207's numbers: a claude mid-turn
# accrued +1.30s then +1.43s of CPU per 20s window; one idle at the prompt
# accrued +0.24s then +0.33s. The 1.0s floor sits between them.
#
# THE TWO MARGINS ARE NOT THE SAME SIZE, AND THE SMALL ONE IS THE ONE THAT
# MATTERS. Against the idle population (24-33cs) the floor has better than 3x
# headroom — that side only risks missing a stalled seat for a cycle. Against
# the busy population the margin is far thinner: an independent live sweep
# during review measured mid-turn seats at 123, 134, 138 and 144cs, i.e. about
# 1.3x the floor. THAT is the side protecting against a false "your live seat
# is dead", so anyone raising this floor should size the change against 123cs,
# not against 130.
#
# WHY THIS COUNTS CENTISECONDS WHEN THE WATCHDOG COUNTS WHOLE SECONDS
#
# Deliberate, not drift. The watchdog separates a hung run burning ~2ms/s from
# one that is working, so whole seconds are ample. Here the two populations are
# 0.3s and 1.3s per window, and truncating both to whole seconds lets an idle
# seat that happens to straddle a second boundary read as +1s — the floor
# exactly — and so read as working. That direction is SAFE (a stalled seat is
# missed for a cycle, never a live one condemned) but it is needlessly lossy
# when `ps -o cputime=` reports hundredths on this platform for free. The
# watchdog's own parser is left untouched: its threshold is correct at its own
# precision, and this change does not touch that file.
#
# COST, AND WHY A HEALTHY FLEET PAYS NONE OF IT
#
# This function SLEEPS — two windows, ~40s. It is therefore gated behind the
# free half: the CPU windows are taken only for a seat whose transcript ends on
# an unanswered DISPATCH — a plain user record, not a tool result. That
# distinction is what makes the claim true: keying the gate on the record type
# alone opened it on ordinary mid-turn traffic (both live seats, during
# review), turning a 2s fleet check into a 20-40s one. With tool results
# excluded the gate opens on 3 of 319 transcripts here, so a healthy fleet pays
# one jq pass per seat, the same as the mute check.
#
# The one seat that would otherwise always pay it is the caller's own. A
# coordinator running this probe is BY CONSTRUCTION mid-turn — the transcript
# record for the turn that invoked the script is the unanswered user record —
# so its own seat would take 40s of windows every run to confirm what the
# script running at all already proves. That seat short-circuits to NO. It is
# not a blind spot: a stacked hung predecessor on the coordinator seat is
# caught by the SEAT_PID_COUNT check, which fires before this one.
#
# UNKNOWN CAUSES (same doctrine as the mute check: only `unreadable` and
# `sample-invalid` mean the measurement itself broke and must be surfaced;
# the rest mean it ran and there was nothing to measure, and stay silent):
#
#   no-transcript-dir  no transcript directory for this seat
#   no-transcript      no .jsonl in it
#   no-conversation    no user or assistant record in the newest transcript
#   no-process         no live claude on this seat, so no CPU to read
#   unreadable         THE CHECK ITSELF FAILED — jq missing, unreadable file
#                      or directory, or a scan that aborted partway
#   sample-invalid     the host slept through both CPU windows, twice each; a
#                      suspended process accrues no CPU whether hung or
#                      working, so the window proves nothing (#205)

# Seconds between the two samples of one CPU window, the wall-clock overrun
# that marks a window as slept-through, and the CPU growth (in CENTISECONDS)
# below which a process is not working. Overridable for tests.
SEAT_PROBE_CPU_SAMPLE_S="${SEAT_PROBE_CPU_SAMPLE_S:-20}"
SEAT_PROBE_CPU_SAMPLE_S_DEFAULT=20
SEAT_PROBE_CPU_SLACK_S="${SEAT_PROBE_CPU_SLACK_S:-10}"
SEAT_PROBE_CPU_SLACK_S_DEFAULT=10
SEAT_PROBE_CPU_FLOOR_CS="${SEAT_PROBE_CPU_FLOOR_CS:-100}"
SEAT_PROBE_CPU_FLOOR_CS_DEFAULT=100
# Ceiling on the sample window. The stall check takes up to two windows per
# seat and fleet-liveness.sh walks every seat, so the sample is multiplied by
# the roster before it is spent — and the probe runs inside a coordinator run
# that fires every two hours. 300s keeps a whole fleet sweep an order of
# magnitude inside that cadence; a probe that cannot finish is a probe that did
# not run. It is also what makes the derived floor ceiling below a real number
# rather than one an override can inflate at will.
SEAT_PROBE_CPU_SAMPLE_MAX_S=300

# Initialised at source time, like the SEAT_MUTE* set, so a caller that reads
# them before ever calling seat_probe_stall_check cannot trip `set -u`.
SEAT_STALL="UNKNOWN"
SEAT_STALL_TS=""
SEAT_STALL_AGE_S=""
SEAT_STALL_CPU=""
SEAT_STALL_UNKNOWN="no-transcript-dir"
SEAT_PROBE_CPU_DELTAS=""

# Validate one non-negative-integer tunable, failing OPEN to its default.
#
# Same doctrine and the same reason as seat_probe_min_declines: an unvalidated
# tunable does not fail neutrally, it fails toward whichever branch a status-2
# `[` comparison happens to land on, while leaking `integer expression
# expected` into the report (#214). The warning goes to stderr because a silent
# fallback makes a typo'd knob undetectable.
#
# $1 name, $2 value, $3 default, $4 minimum, $5 maximum (OPTIONAL; empty means
# unbounded). A maximum belongs on a knob whose over-large value fails toward a
# FALSE ALARM — see the call sites, which say which direction each one fails.
seat_probe_uint() {
  local name="$1" val="$2" def="$3" min="$4" max="${5:-}" bare
  case "$val" in
    "" | *[!0-9]*)
      printf 'seat-probe: %s must be a non-negative integer (got %s) — using %s\n' \
        "$name" "'$val'" "$def" >&2
      printf '%s\n' "$def"
      return 0
      ;;
  esac
  # DIGIT COUNT DECIDES THE MAGNITUDE, not `[`. A 20-digit override is still all
  # digits, and every numeric path that could reject it — `[ -gt ]` and `$(( ))`
  # alike — first wraps it into the 64-bit range, where it can land anywhere:
  # 99999999999999999999 becomes 7766279631452241919, and 18446744073709551617
  # becomes 1. A guard that has to be right about a number cannot be the thing
  # that mangles it, so length screens the value out before any arithmetic sees
  # it (#222).
  bare="$val"
  while [ "${#bare}" -gt 1 ] && [ "${bare#0}" != "$bare" ]; do
    bare="${bare#0}"
  done
  if [ -n "$max" ] && { [ "${#bare}" -gt "${#max}" ] || \
    { [ "${#bare}" -eq "${#max}" ] && [ "$bare" \> "$max" ]; }; }; then
    printf 'seat-probe: %s must be <= %s (got %s) — using %s\n' \
      "$name" "$max" "$val" "$def" >&2
    printf '%s\n' "$def"
    return 0
  fi
  if [ "${#bare}" -gt 18 ]; then
    printf 'seat-probe: %s is too large to compare (got %s) — using %s\n' \
      "$name" "$val" "$def" >&2
    printf '%s\n' "$def"
    return 0
  fi
  if [ "$bare" -lt "$min" ]; then
    printf 'seat-probe: %s must be >= %s (got %s) — using %s\n' \
      "$name" "$min" "$val" "$def" >&2
    printf '%s\n' "$def"
    return 0
  fi
  # Emit CANONICAL DECIMAL. The value is validated as digits, but the callers
  # use it in arithmetic where bash reads a leading zero as octal — so an
  # override of `0100` would silently become 64. The direction is safe (a lower
  # floor reads busy more readily) but the surprise is not worth keeping
  # (review of #217).
  printf '%s\n' "$(( 10#$val ))"
}

# The validated sample window, in seconds. Both the window that spends it and
# the floor that is measured against it must agree on ONE number, so neither
# reads the raw variable.
seat_probe_cpu_sample_s() {
  seat_probe_uint SEAT_PROBE_CPU_SAMPLE_S "${SEAT_PROBE_CPU_SAMPLE_S:-}" \
    "$SEAT_PROBE_CPU_SAMPLE_S_DEFAULT" 1 "$SEAT_PROBE_CPU_SAMPLE_MAX_S"
}

# The validated CPU floor, in centiseconds, bounded by the window it is read
# against.
#
# This is the one tunable in the file whose over-large value fails toward a
# FALSE ALARM, which is the single output seat-probe.sh is written never to
# produce: with per-window deltas of 150 and 140cs, floor=100 reads BUSY and
# floor=10000 reads IDLE, so fleet-liveness.sh calls a working seat STALLED
# (#222). The bound is physical, not a tuning opinion — one process pinned to
# one core accrues sample_s * 100 centiseconds across the window, so a floor
# above that can only be cleared by a process using more than a whole core, and
# every seat that is merely working reads idle. Values below the ceiling can
# still be badly tuned; this closes the region where the knob cannot mean what
# it says. Like every other validation here it fails OPEN to the default.
seat_probe_cpu_floor_cs() {
  local sample
  sample="$(seat_probe_cpu_sample_s)"
  seat_probe_uint SEAT_PROBE_CPU_FLOOR_CS "${SEAT_PROBE_CPU_FLOOR_CS:-}" \
    "$SEAT_PROBE_CPU_FLOOR_CS_DEFAULT" 1 "$(( sample * 100 ))"
}

# `ps -o cputime=` for pid $1, in CENTISECONDS; empty when unreadable.
#
# Accepts every shape ps produces: [DD-]HH:MM:SS[.cc], MM:SS[.cc], SS[.cc].
# A missing fraction is .00 — Linux ps omits it — so this does not depend on
# the hundredths Darwin happens to print. Anything non-numeric yields empty,
# which callers treat as "no reading", never as zero.
seat_probe_cputime_cs() {
  local t="$1" frac=0 days=0 h=0 m=0 s=0
  [ -n "$t" ] || { echo ""; return; }
  case "$t" in
    *.*) frac="${t#*.}"; t="${t%%.*}" ;;
  esac
  # One digit after the point is TENTHS, so it must be scaled; three or more is
  # truncated to hundredths rather than rounded. Getting this wrong in the
  # generous direction is what would let an idle seat read as working.
  case "${#frac}" in
    1) frac="${frac}0" ;;
    2) : ;;
    *) frac="$(printf '%s' "$frac" | cut -c1-2)" ;;
  esac
  # A LEADING dash is junk, not a day separator. Splitting on it leaves an empty
  # `days` that 10# reads as 0, so "-5" would return a reading of 500 — and this
  # parser's whole invariant is that junk yields NO reading, never a number
  # (review of #217).
  case "$t" in
    -*) echo ""; return ;;
    *-*) days="${t%%-*}"; t="${t#*-}" ;;
  esac
  case "$t" in
    *:*:*) h="${t%%:*}"; t="${t#*:}"; m="${t%%:*}"; s="${t#*:}" ;;
    *:*)   m="${t%%:*}"; s="${t#*:}" ;;
    *)     s="$t" ;;
  esac
  case "$days$h$m$s$frac" in
    "" | *[!0-9]*) echo ""; return ;;
  esac
  echo $(( (((10#$days * 86400) + (10#$h * 3600) + (10#$m * 60) + 10#$s) * 100) + 10#$frac ))
}

# The claude process this very script is running inside, if any: walk the
# parent chain from $$ and return the first ancestor whose comm basename is
# `claude`. Empty when the caller is not running inside a seat.
#
# `ps -o ppid=` per hop rather than one `ps -A` pass, because the chain is
# short (a handful of hops) and a bounded loop cannot outlive a ps that starts
# returning junk — the guard below stops on any non-numeric or non-advancing
# ppid, so a truncated read ends the walk instead of spinning.
seat_probe_self_claude_pid() {
  local pid="$$" hops=0 comm ppid
  while [ "$hops" -lt 20 ]; do
    case "$pid" in "" | 0 | 1 | *[!0-9]*) return 0 ;; esac
    comm="$(ps -o comm= -p "$pid" 2>/dev/null | tr -d ' ')"
    if [ "$(basename "${comm:-/none}")" = "claude" ]; then
      printf '%s\n' "$pid"
      return 0
    fi
    ppid="$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')"
    [ "$ppid" != "$pid" ] || return 0
    pid="$ppid"
    hops=$(( hops + 1 ))
  done
  return 0
}

# Take one CPU window over the pids in $1.
#
# Sets SEAT_PROBE_CPU_DELTAS to "pid:delta_cs" per pid ("pid:none" when either
# sample was unreadable). Returns 0 for a valid window, 1 for one the host
# slept through — a suspended process accrues no CPU whether it is hung or
# working, so a window whose wall clock jumped proves nothing (#205, #207).
seat_probe_cpu_window() {
  local pids="$1" pid before after t0 t1 elapsed sample slack
  sample="$(seat_probe_cpu_sample_s)"
  # SLACK is deliberately left UNBOUNDED. Over-large, it declares every window
  # valid however long the host slept — which sends the reading toward BUSY and
  # so toward "the seat is fine", the direction this file is allowed to fail in.
  # Only a knob that can fail toward a false alarm gets a ceiling (#222).
  slack="$(seat_probe_uint SEAT_PROBE_CPU_SLACK_S "${SEAT_PROBE_CPU_SLACK_S:-}" "$SEAT_PROBE_CPU_SLACK_S_DEFAULT" 0)"

  SEAT_PROBE_CPU_DELTAS=""
  local befores=""
  for pid in $pids; do
    before="$(seat_probe_cputime_cs "$(ps -o cputime= -p "$pid" 2>/dev/null | tr -d ' ')")"
    befores="$befores $pid:${before:-none}"
  done

  t0="$(date +%s)"
  sleep "$sample"
  t1="$(date +%s)"
  elapsed=$(( t1 - t0 ))

  for pid in $pids; do
    before="$(printf '%s' "$befores" | tr ' ' '\n' | sed -n "s/^$pid://p")"
    after="$(seat_probe_cputime_cs "$(ps -o cputime= -p "$pid" 2>/dev/null | tr -d ' ')")"
    if [ -z "$before" ] || [ "$before" = "none" ] || [ -z "$after" ]; then
      SEAT_PROBE_CPU_DELTAS="$SEAT_PROBE_CPU_DELTAS $pid:none"
    else
      SEAT_PROBE_CPU_DELTAS="$SEAT_PROBE_CPU_DELTAS $pid:$(( after - before ))"
    fi
  done
  SEAT_PROBE_CPU_DELTAS="${SEAT_PROBE_CPU_DELTAS# }"

  [ "$elapsed" -le $(( sample + slack )) ]
}

# Did the window in SEAT_PROBE_CPU_DELTAS show any process working?
#
# Yes if ANY pid grew by at least the floor. An UNREADABLE delta also counts as
# working: a pid whose cputime stopped being readable is a process that changed
# under us, and this file's standing doctrine is that ambiguity fails toward
# "the seat is fine" — never toward a false "your live seat is dead".
seat_probe_cpu_window_busy() {
  local entry delta floor
  floor="$(seat_probe_cpu_floor_cs)"
  # No pids measured at all is a window that never ran, and a measurement that
  # never ran must read BUSY like every other broken one. Unreachable from
  # seat_probe_stall_check (its no-process guard fires first), but a future
  # caller reaching here with nothing would otherwise get "idle" out of thin air
  # (review of #217).
  [ -n "$SEAT_PROBE_CPU_DELTAS" ] || return 0
  for entry in $SEAT_PROBE_CPU_DELTAS; do
    delta="${entry#*:}"
    [ "$delta" = "none" ] && return 0
    # A NEGATIVE delta means the reading went backwards — a recycled pid, not an
    # idle process — so it belongs with the unreadable cases, not with zero. The
    # old `*[!0-9-]*` class admitted the leading dash and then `[ -5 -ge 100 ]`
    # counted it toward STALLED: the one direction that can only hurt.
    case "$delta" in *[!0-9]*) return 0 ;; esac
    [ "$delta" -ge "$floor" ] && return 0
  done
  return 1
}

# A valid window over the pids in $1, retaking ONCE before giving up — the same
# retake the watchdog does, for the same reason: one slept-through window is a
# routine event on this host (#194's root cause is a 1-minute sleep setting),
# two in a row is not.
seat_probe_cpu_window_or_fail() {
  seat_probe_cpu_window "$1" && return 0
  seat_probe_cpu_window "$1"
}

# Decide whether a seat is STALLED: pane- and process-live, holding work it has
# not answered, and not working on it. See the long-form rationale above.
seat_probe_stall_check() {
  local wtpath="$1" dir newest f jq_out jq_rc last_type last_kind pids self base epoch now

  SEAT_STALL="UNKNOWN"
  SEAT_STALL_TS=""
  SEAT_STALL_AGE_S=""
  SEAT_STALL_CPU=""
  SEAT_STALL_UNKNOWN="no-transcript-dir"

  dir="$(seat_probe_session_dir "$wtpath")"
  [ -d "$dir" ] || return 0

  # Both bits, for the reason spelled out at the same guard in the mute check:
  # `[ -d ]` stays true on an unreadable directory (stat works through the
  # parent), the glob then expands to nothing because it cannot be READ, and
  # the seat lands on the silent "no transcripts here" path. -r is what the
  # glob needs; -x is what stat'ing the entries needs.
  if [ ! -r "$dir" ] || [ ! -x "$dir" ]; then
    SEAT_STALL_UNKNOWN="unreadable"
    return 0
  fi

  SEAT_STALL_UNKNOWN="no-transcript"

  # Newest .jsonl WITHOUT a pipeline. `ls -t | head -1` is not equivalent: head
  # exits after one line, ls takes SIGPIPE, and under `set -euo pipefail` that
  # 141 kills the whole caller once a seat has enough transcripts to outrun the
  # pipe buffer. The coordinator seat has 302 (#155).
  newest=""
  for f in "$dir"/*.jsonl; do
    [ -e "$f" ] || continue
    if [ -z "$newest" ] || [ "$f" -nt "$newest" ]; then
      newest="$f"
    fi
  done
  [ -n "$newest" ] || return 0

  # Exists but cannot be read is the check FAILING, not an empty directory —
  # kept distinct for the reason #216/#218 exist.
  if [ ! -r "$newest" ]; then
    SEAT_STALL_UNKNOWN="unreadable"
    return 0
  fi

  # Every accessor is type-guarded to DEGRADE rather than abort, because a type
  # error aborts the whole jq pass and the verdict is read from the TAIL of
  # what was emitted — an abort on the trailing record would silently yield a
  # verdict from an OLDER record. That is the stale-verdict class #214 closed
  # in the mute check, and it is if anything sharper here: the record this
  # function cares about is precisely the last one.
  #
  # A degraded record emits an empty type, which matches neither "user" nor
  # "assistant" and so falls out of the select — leaving the tail to the last
  # WELL-FORMED conversational record. Combined with the captured exit status
  # below (a non-zero pass yields no verdict at all), a malformed trailing
  # record cannot manufacture a stall.
  #
  # Records are ordered BY FILE POSITION, never by timestamp: 5 of the 24,560
  # user/assistant records on this host step BACKWARDS in time, so a
  # timestamp sort would reorder the tail this verdict is read from.
  #
  # Sidechain (subagent) records are not excluded. Measured: 0 of the 307
  # transcripts on this host contain any, and in none does their presence
  # change which record is last. If a seat starts using subagents, a sidechain
  # tail means the main thread still owes a turn too — so the verdict stays
  # correct and the CPU windows decide it either way.
  #
  # A TOOL RESULT IS ALSO WRITTEN AS A `user` RECORD, AND IT IS NOT A DISPATCH.
  #
  # This is the correction that makes the gate mean what #217 asked for. The
  # CLI records the result of every tool call as a `user`-typed record, so a
  # transcript that ends on one is showing the ORDINARY MID-TURN STATE of any
  # turn that called a tool and has not yet emitted its next assistant message
  # — not a seat that received work and never answered.
  #
  # Measured over the 319 transcripts on this host, of the 23 that end on a
  # `user` record, 20 end on a tool result. Keying the gate on the record TYPE
  # alone would therefore open it on 87% mid-turn traffic, including both live
  # seats at the moment this was reviewed, and hand the entire discrimination
  # to the CPU windows — which is not the design, and which also cost a healthy
  # `fleet-liveness.sh` run 20-40s instead of the 2s it takes today.
  #
  # A dispatch carries a string or `text` blocks; a tool result carries a
  # `tool_result` block (and usually a top-level `toolUseResult`). Both markers
  # are checked, and ANY tool_result block in the content disqualifies the
  # record — a mixed block is still a turn in progress, and the ambiguous
  # direction has to be "the seat is fine". With this filter the gate opens on
  # 3 of 319 transcripts here, and all three are genuine unanswered dispatches.
  #
  # The kind is computed with the same degrade-never-abort discipline as the
  # type, and the guard has to sit on `.message` ITSELF, not on `.message.content`.
  # A non-object `.message` makes `.message.content?` yield `empty`; an `elif`
  # whose CONDITION is empty produces no output at all, so the record would
  # vanish from the pass rather than fall through to "plain" — the trailing
  # dispatch dropped, and the verdict read from an older record. That is the
  # #214 stale-verdict class re-opened inside its own fix, and it does not
  # announce itself: 0 of the 316 transcripts here have such a record, so
  # nothing would have caught it in use.
  #
  # `((.message | objects) // {}) as $m` is the idiom seat_probe_mute_check
  # already uses, and it makes every downstream accessor total: $m.content on a
  # missing key is null, `null | type` is "null", and `.type? // ""` inside the
  # map cannot raise on a non-object element. Every conversational record now
  # emits exactly one row, and a record whose kind cannot be determined falls to
  # "plain" — decided by the CPU windows, never suppressed by this filter.
  #
  # The toolUseResult test is `has(...) and != null`, NOT `// null`. jq's `//`
  # treats `false` as absent, so a tool whose result is the literal `false`
  # would have been read as "no tool result here" and OPENED the gate — the
  # unsafe direction, since every other ambiguity in this file closes it.
  jq_rc=0
  jq_out="$(jq -Rrc '
      fromjson? | objects
      | ((.type | strings) // "") as $t
      | select($t == "user" or $t == "assistant")
      | (((.message | objects) // {}) as $m
         | if $t != "user" then "plain"
           elif (has("toolUseResult") and (.toolUseResult != null)) then "toolres"
           elif (($m.content | type) == "array"
                 and (([$m.content[]? | (.type? // "")] | index("tool_result")) != null))
             then "toolres"
           else "plain" end) as $kind
      | [ $t, $kind, ((.timestamp | strings) // "") ]
      | @tsv' "$newest" 2>/dev/null)" || jq_rc=$?

  if [ "$jq_rc" -ne 0 ]; then
    SEAT_STALL_UNKNOWN="unreadable"
    return 0
  fi
  if [ -z "$jq_out" ]; then
    SEAT_STALL_UNKNOWN="no-conversation"
    return 0
  fi

  # awk rather than `tail -1`, so no pipeline status is discarded and the empty
  # case below can only mean awk itself failed.
  last_type="$(printf '%s\n' "$jq_out" | awk -F'\t' '{ t=$1; k=$2; ts=$3 } END { if (NR) printf "%s\t%s\t%s\n", t, k, ts }' || true)"
  if [ -z "$last_type" ]; then
    SEAT_STALL_UNKNOWN="unreadable"
    return 0
  fi
  SEAT_STALL_TS="$(printf '%s' "$last_type" | cut -f3)"
  last_kind="$(printf '%s' "$last_type" | cut -f2)"
  last_type="$(printf '%s' "$last_type" | cut -f1)"

  # The turn was answered, or is in progress. Nothing owed that this check can
  # see, nothing to measure, no windows taken — this is the path a healthy
  # fleet takes, and it is why the check is free. A tool result lands here for
  # the reason spelled out at the jq pass: it is mid-turn traffic, not a
  # dispatch.
  if [ "$last_type" != "user" ] || [ "$last_kind" != "plain" ]; then
    SEAT_STALL="NO"
    SEAT_STALL_TS=""
    SEAT_STALL_UNKNOWN=""
    return 0
  fi

  pids="$(seat_probe_pids_for_path "$wtpath")"
  if [ -z "$pids" ]; then
    SEAT_STALL_UNKNOWN="no-process"
    return 0
  fi

  # The caller's own seat. A coordinator running this probe is mid-turn by
  # construction — the record for the turn that invoked the script IS the
  # unanswered user record — so taking 40s of windows would only confirm what
  # the script running at all already proves.
  self="$(seat_probe_self_claude_pid)"
  if [ -n "$self" ]; then
    case " $pids " in
      *" $self "*)
        SEAT_STALL="NO"
        SEAT_STALL_CPU="self:$self"
        SEAT_STALL_UNKNOWN=""
        return 0
        ;;
    esac
  fi

  if ! seat_probe_cpu_window_or_fail "$pids"; then
    SEAT_STALL_UNKNOWN="sample-invalid"
    return 0
  fi
  SEAT_STALL_CPU="w1:$SEAT_PROBE_CPU_DELTAS"
  if seat_probe_cpu_window_busy; then
    SEAT_STALL="NO"
    SEAT_STALL_UNKNOWN=""
    return 0
  fi

  # CONFIRM. One flat window is not enough — the whole reason #207 added a
  # second one is that a single sample cannot tell a working process from a
  # stuck one.
  if ! seat_probe_cpu_window_or_fail "$pids"; then
    SEAT_STALL_UNKNOWN="sample-invalid"
    return 0
  fi
  SEAT_STALL_CPU="$SEAT_STALL_CPU w2:$SEAT_PROBE_CPU_DELTAS"
  if seat_probe_cpu_window_busy; then
    SEAT_STALL="NO"
    SEAT_STALL_UNKNOWN=""
    return 0
  fi

  SEAT_STALL="YES"
  SEAT_STALL_UNKNOWN=""

  # Age is a convenience, never a gate — the whole point of this check is that
  # no age threshold can decide it. If the timestamp will not parse, report the
  # stall without it rather than suppressing the finding.
  base="${SEAT_STALL_TS%%.*}"
  base="${base%Z}"
  epoch="$(TZ=UTC date -j -f '%Y-%m-%dT%H:%M:%S' "$base" '+%s' 2>/dev/null || true)"
  if [ -n "$epoch" ]; then
    now="$(date +%s)"
    SEAT_STALL_AGE_S=$(( now - epoch ))
    [ "$SEAT_STALL_AGE_S" -lt 0 ] && SEAT_STALL_AGE_S=0
  fi

  return 0
}
