#!/usr/bin/env bash
# seat-probe.test.sh — the retained harness for scripts/lib/seat-probe.sh (#225).
#
# WHY THIS FILE EXISTS
#
# Five PRs of genuinely subtle logic landed in seat-probe.sh (#212, #214, #217,
# #222), and every one of them was verified by ad-hoc scripts written for that
# round and deleted at the end of it. Nothing was retained, so each round
# re-derived the same ground — leading-zero handling, the string-compare-vs-
# arithmetic boundary, fail-open behaviour, jq's treatment of `false` vs absent
# — from scratch, and the regressions that were caught were not pinned against
# reappearing. This file is that pin.
#
# Each case names the issue it defends. A failure here is a REGRESSION of a
# defect that was already found once by hand; read the referenced issue before
# deciding the expectation is wrong.
#
# THE ONE INVARIANT EVERYTHING ELSE RESTS ON
#
# Every rejection falls OPEN — to the knob's default, and to the verdict that
# says the seat is fine. seat-probe.sh may fail toward "this seat is working"
# and never toward "your live seat is dead", because a false alarm sends
# restart-team.sh at a healthy seat and stacks a second session on it. Section 6
# sweeps that invariant across every knob; the rest of the file checks the
# specific paths that were once wrong in the other direction.
#
# CONSTRAINTS THIS HARNESS HOLDS ITSELF TO
#
#   * bash 3.2.57 — the macOS system bash these scripts actually run under.
#     No associative arrays, no `mapfile`, no `${var^^}`, no `local -n`.
#   * No network and no live fleet. Every transcript is a fixture under a
#     temporary SEAT_PROBE_SESSION_BASE, and the pid map is explicitly empty,
#     so no case depends on which seats happen to be up. The old verification's
#     reliance on the live fleet is part of what made it unrepeatable.
#   * Exit codes are asserted from UNPIPED runs. `head`/`grep` in a pipeline
#     replace the status of the thing under test and hide truncation, which is
#     how the SIGPIPE class (#155) survived being "verified" once already.
#   * The stall check SLEEPS when it reaches its CPU windows. No fixture here
#     has a live pid, so every case short-circuits before that; the whole
#     harness runs in about a second. If a case here starts taking 40s,
#     something reached the windows that should not have.
#
# Usage:
#   bash scripts/__tests__/seat-probe.test.sh          # run everything
#   bash scripts/__tests__/seat-probe.test.sh -v       # also print passing cases
#
# Exit status is 0 only when every case passed.

set -uo pipefail
# NOT `set -e`. An assertion that fails must be RECORDED and the run continue —
# a harness that stops at the first failure hides how much else broke, and the
# fail-open invariant is only meaningful swept across every knob at once.

VERBOSE=0
case "${1:-}" in
  -v | --verbose) VERBOSE=1 ;;
  -h | --help) sed -n '2,60p' "$0"; exit 0 ;;
  "") ;;
  *) printf 'unknown argument: %s\n' "$1" >&2; exit 2 ;;
esac

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
PROBE="$REPO_ROOT/scripts/lib/seat-probe.sh"

if [ ! -r "$PROBE" ]; then
  printf 'cannot read %s\n' "$PROBE" >&2
  exit 2
fi
if ! command -v jq >/dev/null 2>&1; then
  printf 'jq is required (the probe shells out to it)\n' >&2
  exit 2
fi

TMPROOT="$(mktemp -d "${TMPDIR:-/tmp}/seat-probe-test.XXXXXX")"
# chmod 000 fixtures would otherwise outlive a failure and leave an
# undeletable directory behind.
cleanup() {
  chmod -R u+rwx "$TMPROOT" 2>/dev/null || true
  rm -rf "$TMPROOT"
}
trap cleanup EXIT INT TERM

# root defeats the permission fixtures: a 000 directory is still readable, so
# the "unreadable" cases would silently assert nothing.
CAN_TEST_PERMS=1
if [ "$(id -u)" = "0" ]; then
  CAN_TEST_PERMS=0
fi

PASS=0
FAIL=0
SKIP=0
FAILED_NAMES=""

pass() {
  PASS=$(( PASS + 1 ))
  [ "$VERBOSE" -eq 1 ] && printf '  ok   %s\n' "$1"
  return 0
}
fail() {
  FAIL=$(( FAIL + 1 ))
  FAILED_NAMES="$FAILED_NAMES
  $1"
  printf '  FAIL %s\n' "$1"
  shift
  while [ "$#" -gt 0 ]; do
    printf '         %s\n' "$1"
    shift
  done
  return 0
}
skip() {
  SKIP=$(( SKIP + 1 ))
  printf '  skip %s (%s)\n' "$1" "$2"
  return 0
}
section() { printf '\n%s\n' "$1"; }

assert_eq() { # name expected actual
  if [ "$2" = "$3" ]; then
    pass "$1"
  else
    fail "$1" "expected: '$2'" "actual:   '$3'"
  fi
}

# --- fixtures ---------------------------------------------------------------

# THE SEAT COUNTER LIVES IN A FILE, NOT A VARIABLE, and that is the whole point
# of it. Every one of the 39 call sites below is `wt="$(new_seat)"` — a COMMAND
# SUBSTITUTION, which bash runs in a subshell, so a `SEAT_N=$(( SEAT_N + 1 ))`
# inside it increments a copy that dies with the subshell. The parent's counter
# never moves, every call returns the SAME path, and all 39 fixtures pile into
# one transcript directory: cases read each other's records, a `chmod 000` from
# a permission case outlives it, and the verdict a case gets depends on the
# order the cases happen to run in. That is worse than no harness — it was
# observed producing 19 failures on one run and 21 on the next from an
# unchanged tree, which is exactly the "re-derive it every round" problem this
# file exists to end. A counter file is shared state the subshell can actually
# advance, so uniqueness survives the substitution.
SEAT_SEQ="$TMPROOT/seat.seq"
printf '0\n' > "$SEAT_SEQ"
next_seat_n() {
  local n
  n=$(( $(cat "$SEAT_SEQ") + 1 ))
  printf '%s\n' "$n" > "$SEAT_SEQ"
  printf '%s' "$n"
}

# Echo a fresh fake worktree path whose transcript directory exists and is
# empty. The worktree itself is never created: neither check stats it, and a
# fixture that does not need a directory should not have one.
new_seat() {
  local path
  path="$TMPROOT/wt/seat$(next_seat_n)"
  mkdir -p "$(seat_probe_session_dir "$path")"
  printf '%s\n' "$path"
}

# A worktree path with NO transcript directory at all.
new_seat_no_dir() {
  printf '%s/wt/absent%s\n' "$TMPROOT" "$(next_seat_n)"
}

session_file() { # wtpath name -> path of a transcript file in its dir
  printf '%s/%s.jsonl\n' "$(seat_probe_session_dir "$1")" "$2"
}

# Record constructors. Each is one JSONL line on stdout.
rec_decline() { # ts text
  printf '{"type":"assistant","timestamp":"%s","message":{"model":"<synthetic>","usage":{"input_tokens":0,"output_tokens":0},"content":[{"type":"text","text":"%s"}]}}\n' "$1" "$2"
}
rec_answer() { # ts text
  printf '{"type":"assistant","timestamp":"%s","message":{"model":"claude-opus-5","usage":{"input_tokens":12,"output_tokens":34},"content":[{"type":"text","text":"%s"}]}}\n' "$1" "$2"
}
rec_dispatch() { # ts text  — a real unanswered user turn
  printf '{"type":"user","timestamp":"%s","message":{"role":"user","content":"%s"}}\n' "$1" "$2"
}
rec_dispatch_blocks() { # ts text — a dispatch carrying text BLOCKS, not a string
  printf '{"type":"user","timestamp":"%s","message":{"role":"user","content":[{"type":"text","text":"%s"}]}}\n' "$1" "$2"
}
rec_toolresult() { # ts — a tool result: a `user`-typed record that is NOT a dispatch
  printf '{"type":"user","timestamp":"%s","message":{"role":"user","content":[{"type":"tool_result","tool_use_id":"t1","content":"ok"}]},"toolUseResult":{"stdout":"ok"}}\n' "$1"
}
rec_toolresult_false() { # ts — toolUseResult is the LITERAL false (#217 jq trap)
  printf '{"type":"user","timestamp":"%s","message":{"role":"user","content":"see result"},"toolUseResult":false}\n' "$1"
}
rec_toolresult_mixed() { # ts — a text block AND a tool_result block in one record
  printf '{"type":"user","timestamp":"%s","message":{"role":"user","content":[{"type":"text","text":"and"},{"type":"tool_result","tool_use_id":"t1","content":"ok"}]}}\n' "$1"
}
rec_bad_message() { # ts type — .message is a STRING, not an object
  printf '{"type":"%s","timestamp":"%s","message":"not-an-object"}\n' "$2" "$1"
}
rec_bad_usage() { # ts — synthetic model, but the usage block is unreadable
  printf '{"type":"assistant","timestamp":"%s","message":{"model":"<synthetic>","usage":"not-an-object","content":[{"type":"text","text":"API Error"}]}}\n' "$1"
}
rec_bad_content() { # ts — synthetic model, zero tokens, .content is a STRING
  printf '{"type":"assistant","timestamp":"%s","message":{"model":"<synthetic>","usage":{"input_tokens":0,"output_tokens":0},"content":"not-an-array"}}\n' "$1"
}
rec_garbage() { printf 'this line is not json at all\n'; }
rec_scalar()  { printf '42\n'; }
rec_summary() { printf '{"type":"summary","summary":"a compacted conversation"}\n'; }

# --- the library under test -------------------------------------------------

# Point the probe at fixtures BEFORE sourcing: the transcript base is captured
# at source time with `:-`.
SEAT_PROBE_SESSION_BASE="$TMPROOT/projects"
export SEAT_PROBE_SESSION_BASE
mkdir -p "$SEAT_PROBE_SESSION_BASE"

# shellcheck source=scripts/lib/seat-probe.sh
. "$PROBE"

# An explicitly EMPTY pid map. Nothing here consults the real process table, so
# no case can be decided by which seats happen to be up — and every stall
# fixture stops at "no process" instead of spending 40s of CPU windows.
SEAT_PROBE_PIDS=()
SEAT_PROBE_CWDS=()

printf 'seat-probe harness — bash %s\n' "${BASH_VERSION:-unknown}"

# ============================================================================
section 'Section 1 — seat_probe_uint: the validator every knob goes through'
# ============================================================================

# name value default min max expected_out expected_rc want_warning
check_uint() {
  local case_name="$1" val="$2" def="$3" min="$4" max="$5" want="$6" want_warn="$7"
  local out rc err
  err="$TMPROOT/uint.err"
  # UNPIPED: command substitution preserves the function's own exit status.
  out="$(seat_probe_uint TEST_KNOB "$val" "$def" "$min" "$max" 2>"$err")"
  rc=$?
  if [ "$rc" -ne 0 ]; then
    fail "$case_name" "seat_probe_uint returned $rc; it must always return 0 (fail-open)"
    return 0
  fi
  if [ "$out" != "$want" ]; then
    fail "$case_name" "expected: '$want'" "actual:   '$out'"
    return 0
  fi
  if [ "$want_warn" = "yes" ] && [ ! -s "$err" ]; then
    fail "$case_name" "a rejected value must warn on stderr; nothing was written"
    return 0
  fi
  if [ "$want_warn" = "no" ] && [ -s "$err" ]; then
    fail "$case_name" "an accepted value must not warn; stderr said: $(cat "$err")"
    return 0
  fi
  pass "$case_name"
}

check_uint 'accepts a plain in-range value'                    '50'    '100' '1' '2000' '50'   no
check_uint 'accepts the minimum'                               '1'     '100' '1' '2000' '1'    no
check_uint 'accepts the maximum'                               '2000'  '100' '1' '2000' '2000' no
check_uint 'rejects one past the maximum'                      '2001'  '100' '1' '2000' '100'  yes
check_uint 'rejects below the minimum'                         '0'     '100' '1' '2000' '100'  yes
check_uint 'rejects the empty string'                          ''      '100' '1' '2000' '100'  yes
check_uint 'rejects a non-numeric value'                       'abc'   '100' '1' '2000' '100'  yes
check_uint 'rejects a negative value'                          '-5'    '100' '1' '2000' '100'  yes
check_uint 'rejects a decimal'                                 '1.5'   '100' '1' '2000' '100'  yes
check_uint 'rejects whitespace'                                ' 50'   '100' '1' '2000' '100'  yes
check_uint 'rejects an arithmetic injection'                   '1+1'   '100' '1' '2000' '100'  yes

# Leading zeros: the value is legal, and the OUTPUT must be canonical decimal.
# Callers use it in `$(( ))`, where bash reads a leading zero as OCTAL — an
# override of 0100 silently became 64 (review of #217). The direction was safe
# but the surprise was not.
check_uint 'accepts a leading-zero value'                      '0100'  '100' '1' '2000' '100'  no
check_uint 'normalises 0008 to 8, not octal'                   '0008'  '100' '1' '2000' '8'    no
check_uint 'normalises a lone 0 against min 0'                 '0'     '100' '0' '2000' '0'    no
check_uint 'strips zeros before the minimum test'              '0001'  '100' '1' '2000' '1'    no
# All-zeros must not strip to the empty string and then compare as one.
check_uint 'handles an all-zeros value'                        '000'   '100' '1' '2000' '100'  yes

# THE MAGNITUDE CLASS (#222). A 20-digit override is still all digits, and every
# numeric path that could reject it — `[ -gt ]` and `$(( ))` alike — first wraps
# it into the 64-bit range, where it can land ANYWHERE. These two values wrap in
# opposite directions and are the whole reason the guard counts digits instead
# of doing arithmetic:
#   99999999999999999999 -> 7766279631452241919  (huge: would pass a max test)
#   18446744073709551617 -> 1                    (tiny: would pass a min test)
# A guard that has to be right about a number cannot be the thing that mangles
# it. Both must be REJECTED, and the default returned unwrapped.
check_uint 'rejects the wrap-to-huge 20-digit value'   '99999999999999999999' '100' '1' '2000' '100' yes
check_uint 'rejects the wrap-to-1 20-digit value'      '18446744073709551617' '100' '1' '2000' '100' yes
check_uint 'rejects the wrap-to-1 value with no max'   '18446744073709551617' '100' '1' ''     '100' yes
check_uint 'rejects the wrap-to-huge value with no max' '99999999999999999999' '100' '1' ''    '100' yes
# Leading zeros must not smuggle an over-long value past the digit count.
check_uint 'strips zeros before the magnitude test'    '0000000000000000000050' '100' '1' '2000' '50' no

# The 18-digit cutoff, exactly. 18 digits is the widest value the guard will
# hand to `[` ; 19 is refused as incomparable rather than compared wrongly.
check_uint 'accepts 18 digits when no max is set'  '999999999999999999'  '100' '1' '' '999999999999999999' no
check_uint 'rejects 19 digits when no max is set'  '1999999999999999999' '100' '1' '' '100' yes

# The max test is a LENGTH-then-lexicographic compare, so its boundary has to be
# exercised at equal width in both directions.
check_uint 'accepts a same-width value below max'  '1999' '100' '1' '2000' '1999' no
check_uint 'rejects a same-width value above max'  '9000' '100' '1' '2000' '100'  yes
check_uint 'rejects a wider value than max'        '10000' '100' '1' '2000' '100' yes
check_uint 'accepts a narrower value than max'     '999'  '100' '1' '2000' '999'  no
# An empty max means UNBOUNDED, not "max is the empty string".
check_uint 'treats an empty max as unbounded'      '999999' '100' '1' '' '999999' no

# ============================================================================
section 'Section 2 — the derived knobs: sample window and CPU floor'
# ============================================================================

# name env_assignments... -> runs the getter with only those vars set
uint_default_sample="$SEAT_PROBE_CPU_SAMPLE_S_DEFAULT"
uint_default_floor="$SEAT_PROBE_CPU_FLOOR_CS_DEFAULT"

run_sample() { # value ("" = unset)
  local v="$1" out
  if [ -z "$v" ]; then
    out="$(SEAT_PROBE_CPU_SAMPLE_S= seat_probe_cpu_sample_s 2>/dev/null)"
  else
    out="$(SEAT_PROBE_CPU_SAMPLE_S="$v" seat_probe_cpu_sample_s 2>/dev/null)"
  fi
  printf '%s\n' "$out"
}
run_floor() { # floor_value sample_value
  local f="$1" s="$2" out
  out="$(SEAT_PROBE_CPU_FLOOR_CS="$f" SEAT_PROBE_CPU_SAMPLE_S="$s" seat_probe_cpu_floor_cs 2>/dev/null)"
  printf '%s\n' "$out"
}

assert_eq 'sample: unset falls to the default'      "$uint_default_sample" "$(run_sample '')"
assert_eq 'sample: a valid override is honoured'    '30'  "$(run_sample 30)"
assert_eq 'sample: 0 falls open to the default'     "$uint_default_sample" "$(run_sample 0)"
assert_eq 'sample: above the max falls open'        "$uint_default_sample" "$(run_sample $(( SEAT_PROBE_CPU_SAMPLE_MAX_S + 1 )))"
assert_eq 'sample: the max itself is accepted'      "$SEAT_PROBE_CPU_SAMPLE_MAX_S" "$(run_sample "$SEAT_PROBE_CPU_SAMPLE_MAX_S")"
assert_eq 'sample: garbage falls open'              "$uint_default_sample" "$(run_sample abc)"

# THE ONE KNOB WHOSE OVER-LARGE VALUE FAILS TOWARD A FALSE ALARM (#222). One
# process pinned to one core accrues sample_s * 100 centiseconds across the
# window, so a floor above that can only be cleared by a process using more
# than a whole core — every merely-working seat reads IDLE and
# fleet-liveness.sh calls it STALLED. The ceiling is physical, and the floor
# must be bounded by the SAME sample the window will actually spend.
assert_eq 'floor: unset falls to the default'       "$uint_default_floor" "$(SEAT_PROBE_CPU_FLOOR_CS= SEAT_PROBE_CPU_SAMPLE_S= seat_probe_cpu_floor_cs 2>/dev/null)"
assert_eq 'floor: a valid override is honoured'     '250'  "$(run_floor 250 20)"
assert_eq 'floor: the ceiling itself is accepted'   '2000' "$(run_floor 2000 20)"
assert_eq 'floor: one past the ceiling falls open'  "$uint_default_floor" "$(run_floor 2001 20)"
assert_eq 'floor: 10000 at the default sample falls open' "$uint_default_floor" "$(run_floor 10000 20)"
# The ceiling TRACKS the sample: the same floor is legal at a long window and
# rejected at a short one. A ceiling derived from the default rather than from
# the sample in force would get this wrong in both directions.
assert_eq 'floor: 3000 is legal at a 30s sample'    '3000' "$(run_floor 3000 30)"
assert_eq 'floor: 3000 falls open at a 20s sample'  "$uint_default_floor" "$(run_floor 3000 20)"
assert_eq 'floor: 500 falls open at a 1s sample'    "$uint_default_floor" "$(run_floor 500 1)"
assert_eq 'floor: 100 is legal at a 1s sample'      '100'  "$(run_floor 100 1)"
# An INVALID sample must not widen the ceiling. The sample falls open to its
# default first, so the ceiling is the default's — not one derived from garbage.
assert_eq 'floor: an invalid sample gives the default ceiling' \
  "$uint_default_floor" "$(run_floor 3000 abc)"
assert_eq 'floor: a valid floor survives an invalid sample' \
  '1500' "$(run_floor 1500 abc)"
# The magnitude class again, on the knob that actually points at the alarm.
assert_eq 'floor: a 20-digit override falls open'   "$uint_default_floor" "$(run_floor 99999999999999999999 20)"
assert_eq 'floor: the wrap-to-1 override falls open' "$uint_default_floor" "$(run_floor 18446744073709551617 20)"
assert_eq 'floor: a leading-zero floor is decimal'  '100'  "$(run_floor 0100 20)"

# ============================================================================
section 'Section 3 — seat_probe_min_declines: the persistence gate knob'
# ============================================================================

run_min_declines() {
  local out
  out="$(SEAT_PROBE_MUTE_MIN_DECLINES="$1" seat_probe_min_declines 2>/dev/null)"
  printf '%s\n' "$out"
}
assert_eq 'min-declines: a valid override is honoured' '3' "$(run_min_declines 3)"
assert_eq 'min-declines: 1 is accepted'                '1' "$(run_min_declines 1)"
assert_eq 'min-declines: 0 falls open to the default'  "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT" "$(run_min_declines 0)"
assert_eq 'min-declines: garbage falls open'           "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT" "$(run_min_declines abc)"
assert_eq 'min-declines: empty falls open'             "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT" "$(run_min_declines '')"
# Over-large is DELIBERATELY accepted here: it demands a decline run no
# transcript can reach, so the seat reports NOT mute — the safe direction. This
# knob is the mirror of SEAT_PROBE_CPU_FLOOR_CS and must stay unbounded.
assert_eq 'min-declines: over-large is accepted (fails toward "fine")' \
  '999999' "$(run_min_declines 999999)"

# ============================================================================
section 'Section 4 — seat_probe_mute_check: fixture transcripts'
# ============================================================================

# Runs the check UNPIPED and asserts the whole verdict at once. The check must
# always return 0 — it reports through globals, and a non-zero return would kill
# a caller running `set -e`.
#   $1 name  $2 worktree  $3 want SEAT_MUTE  $4 want SEAT_MUTE_UNKNOWN
#   $5 want SEAT_MUTE_RUN (optional; "" = do not check)
mute_case() {
  local name="$1" wt="$2" want_mute="$3" want_unknown="$4" want_run="${5:-}"
  local rc
  seat_probe_mute_check "$wt"
  rc=$?
  if [ "$rc" -ne 0 ]; then
    fail "$name" "seat_probe_mute_check returned $rc; it must always return 0"
    return 0
  fi
  if [ "$SEAT_MUTE" != "$want_mute" ]; then
    fail "$name" "SEAT_MUTE expected '$want_mute', got '$SEAT_MUTE'" \
      "reason='$SEAT_MUTE_REASON' unknown='$SEAT_MUTE_UNKNOWN' run=$SEAT_MUTE_RUN"
    return 0
  fi
  if [ "$SEAT_MUTE_UNKNOWN" != "$want_unknown" ]; then
    fail "$name" "SEAT_MUTE_UNKNOWN expected '$want_unknown', got '$SEAT_MUTE_UNKNOWN'"
    return 0
  fi
  if [ -n "$want_run" ] && [ "$SEAT_MUTE_RUN" != "$want_run" ]; then
    fail "$name" "SEAT_MUTE_RUN expected '$want_run', got '$SEAT_MUTE_RUN'"
    return 0
  fi
  pass "$name"
}

# --- the two reasons a guard can return without a verdict --------------------
#
# THE INVARIANT THIS GROUP DEFENDS (#214, #216, #218, #219): a guard that
# returns without a verdict must say WHICH of the two reasons it had. "There is
# nothing here" and "I cannot look" are both UNKNOWN, and folding them together
# is how a permission-broken transcript silently disabled the mute check for a
# whole seat with no line and no warning. The verdict is identical either way;
# only the visibility differs, and the visibility is the point.

wt="$(new_seat_no_dir)"
mute_case 'mute: no transcript directory says so' "$wt" UNKNOWN no-transcript-dir

wt="$(new_seat)"
mute_case 'mute: an empty directory is "nothing here"' "$wt" UNKNOWN no-transcript

if [ "$CAN_TEST_PERMS" -eq 1 ]; then
  # `[ -d ]` stays TRUE on an unreadable directory — stat works through the
  # parent — and the glob then expands to nothing because it cannot be READ. A
  # check keyed only on -d lands on the silent "no transcripts here" path.
  wt="$(new_seat)"
  dir="$(seat_probe_session_dir "$wt")"
  rec_answer '2026-09-02T10:00:00.000Z' 'hello' > "$dir/s.jsonl"
  chmod 000 "$dir"
  mute_case 'mute: an unreadable DIRECTORY is a failed check, not an empty one' \
    "$wt" UNKNOWN unreadable
  chmod 755 "$dir"

  # Same distinction one level down: a transcript that EXISTS and cannot be read.
  wt="$(new_seat)"
  dir="$(seat_probe_session_dir "$wt")"
  rec_answer '2026-09-02T10:00:00.000Z' 'hello' > "$dir/s.jsonl"
  chmod 000 "$dir/s.jsonl"
  mute_case 'mute: an unreadable TRANSCRIPT is a failed check' "$wt" UNKNOWN unreadable
  chmod 644 "$dir/s.jsonl"
else
  skip 'mute: unreadable directory' 'running as root'
  skip 'mute: unreadable transcript' 'running as root'
fi

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
rec_dispatch '2026-09-02T10:00:00.000Z' 'do the thing' > "$dir/s.jsonl"
mute_case 'mute: a transcript with no assistant record says so' \
  "$wt" UNKNOWN no-assistant-message

# --- the persistence gate (#212, #214) ---------------------------------------
#
# ONE DECLINE IS NOT MUTENESS. Measured over 308 real transcripts, 143 END on a
# local decline and ~100 of those are transient transport conditions — the seat
# is healthy and answers the next dispatch. A check that fires on one decline
# goes red on the single most common way a session ends, and a check that is
# usually wrong is one the loop learns to ignore.

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_dispatch '2026-09-02T10:00:00.000Z' 'go'
  rec_decline  '2026-09-02T10:00:01.000Z' 'API Error: Connection lost mid-response'
} > "$dir/s.jsonl"
mute_case 'mute: ONE decline is not mute (the 143-transcript false positive)' \
  "$wt" NO '' 1

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_dispatch '2026-09-02T10:00:00.000Z' 'go'
  rec_decline  '2026-09-02T10:00:01.000Z' 'You are out of usage credits'
  rec_decline  '2026-09-02T10:00:02.000Z' 'You are out of usage credits'
} > "$dir/s.jsonl"
mute_case 'mute: two consecutive declines is mute' "$wt" YES '' 2
assert_eq 'mute: the decline text is carried out verbatim' \
  'You are out of usage credits' "$SEAT_MUTE_REASON"
assert_eq 'mute: the decline timestamp is reported' \
  '2026-09-02T10:00:02.000Z' "$SEAT_MUTE_TS"

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-02T10:00:00.000Z' 'e1'
  rec_decline '2026-09-02T10:00:01.000Z' 'e2'
  rec_decline '2026-09-02T10:00:02.000Z' 'e3'
  rec_decline '2026-09-02T10:00:03.000Z' 'e4'
} > "$dir/s.jsonl"
mute_case 'mute: the run counts every trailing decline' "$wt" YES '' 4

# A real answer AFTER the declines ends the run: the seat recovered.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-02T10:00:00.000Z' 'e1'
  rec_decline '2026-09-02T10:00:01.000Z' 'e2'
  rec_answer  '2026-09-02T10:00:02.000Z' 'back to work'
} > "$dir/s.jsonl"
mute_case 'mute: a real answer after two declines is not mute' "$wt" NO '' 0

# The run is CONSECUTIVE and read from the tail, so declines earlier in the
# transcript do not accumulate across a recovery.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-02T10:00:00.000Z' 'e1'
  rec_answer  '2026-09-02T10:00:01.000Z' 'fine'
  rec_decline '2026-09-02T10:00:02.000Z' 'e2'
} > "$dir/s.jsonl"
mute_case 'mute: declines separated by an answer do not add up' "$wt" NO '' 1

# BENIGN DECLINES BREAK THE RUN (#214). "No response requested." is what the CLI
# writes when a dispatch asked for no reply — a healthy end state. Counting it
# would let one transient blip plus one normal no-reply dispatch manufacture a
# run=2: a false alarm of exactly the shape the persistence gate exists to
# prevent.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-02T10:00:00.000Z' 'API Error: 529 Overloaded'
  rec_decline '2026-09-02T10:00:01.000Z' 'No response requested.'
  rec_decline '2026-09-02T10:00:02.000Z' 'API Error: 529 Overloaded'
} > "$dir/s.jsonl"
mute_case 'mute: a benign decline BREAKS the run rather than extending it' \
  "$wt" NO '' 1

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-02T10:00:00.000Z' 'No response requested.'
  rec_decline '2026-09-02T10:00:01.000Z' 'No response requested.'
} > "$dir/s.jsonl"
mute_case 'mute: two benign declines are not mute' "$wt" NO ''

# An empty override must not collapse the shell pattern to a bare `*` and make
# the seat permanently unmutable. Both the awk loop and the shell case guard
# against it, one layer apart, and they must agree.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-02T10:00:00.000Z' 'API Error: ENOTFOUND'
  rec_decline '2026-09-02T10:00:01.000Z' 'API Error: ENOTFOUND'
} > "$dir/s.jsonl"
( SEAT_PROBE_BENIGN_DECLINE=""
  seat_probe_mute_check "$wt"
  [ "$SEAT_MUTE" = "YES" ] ) \
  && pass 'mute: an EMPTY benign override cannot make a seat unmutable' \
  || fail 'mute: an EMPTY benign override cannot make a seat unmutable' \
       'a mute seat reported NO with SEAT_PROBE_BENIGN_DECLINE=""'

# The expansion is QUOTED, so an override's glob metacharacters are LITERAL:
# '*' matches a text BEGINNING with an asterisk, not everything. (An earlier
# revision of the comment in seat-probe.sh claimed the opposite; it was measured
# wrong at the #214 gate.)
( SEAT_PROBE_BENIGN_DECLINE="*"
  seat_probe_mute_check "$wt"
  [ "$SEAT_MUTE" = "YES" ] ) \
  && pass 'mute: a glob metacharacter override is matched literally' \
  || fail 'mute: a glob metacharacter override is matched literally' \
       'SEAT_PROBE_BENIGN_DECLINE="*" suppressed a real mute verdict'

# An invalid persistence knob must fail OPEN to the default, not toward alarm.
# `[ abc -lt 2 ]` returns status 2, an `if` reads that as false, and control
# would fall through to MUTE=YES — unconditionally mute, with a raw `integer
# expression expected` leaking into the report (#214).
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_dispatch '2026-09-02T10:00:00.000Z' 'go'
  rec_decline  '2026-09-02T10:00:01.000Z' 'API Error: ENOTFOUND'
} > "$dir/s.jsonl"
( SEAT_PROBE_MUTE_MIN_DECLINES="abc"
  seat_probe_mute_check "$wt" 2>/dev/null
  [ "$SEAT_MUTE" = "NO" ] ) \
  && pass 'mute: a garbage min-declines knob fails open, not toward alarm' \
  || fail 'mute: a garbage min-declines knob fails open, not toward alarm' \
       'one decline was reported mute under SEAT_PROBE_MUTE_MIN_DECLINES=abc'

# Lowering the gate to 1 must still work — the knob is real, not decorative.
( SEAT_PROBE_MUTE_MIN_DECLINES=1
  seat_probe_mute_check "$wt"
  [ "$SEAT_MUTE" = "YES" ] ) \
  && pass 'mute: min-declines=1 catches a single decline' \
  || fail 'mute: min-declines=1 catches a single decline' \
       'the gate did not lower'

# --- degrade, never abort: the stale-verdict class (#213, #214) --------------
#
# The verdict is read from the TAIL of what jq emitted, so a type error on the
# TRAILING record does not merely skip it — it aborts the pass and yields a
# verdict from an OLDER message. That is the one path in the file that could
# fail to a WRONG answer rather than to UNKNOWN. Each accessor is type-guarded
# so a malformed record still emits, with empty fields, and therefore reads as a
# real answer: MUTE=NO.

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline     '2026-09-02T10:00:00.000Z' 'API Error: ENOTFOUND'
  rec_decline     '2026-09-02T10:00:01.000Z' 'API Error: ENOTFOUND'
  rec_bad_message '2026-09-02T10:00:02.000Z' 'assistant'
} > "$dir/s.jsonl"
mute_case 'mute: a non-object .message degrades instead of yielding a STALE mute' \
  "$wt" NO ''

# THE USAGE BLOCK IS WHY THE TOKEN TOTAL IS -1 AND NOT 0. Mapping an unreadable
# usage block to 0 is the one place the invariant would break: combined with
# model "<synthetic>" it reads as a confirmed local decline, so a garbage usage
# block would COUNT TOWARD the run and fail toward ALARM (measured at the #214
# gate: NO run=0 -> YES run=3).
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline   '2026-09-02T10:00:00.000Z' 'API Error: ENOTFOUND'
  rec_decline   '2026-09-02T10:00:01.000Z' 'API Error: ENOTFOUND'
  rec_bad_usage '2026-09-02T10:00:02.000Z'
} > "$dir/s.jsonl"
mute_case 'mute: an unreadable usage block reads as an answer, never as a decline' \
  "$wt" NO ''

# A synthetic, zero-token record whose CONTENT will not yield text cannot
# explain itself, and an unexplained alarm is worse than none.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline     '2026-09-02T10:00:00.000Z' 'API Error: ENOTFOUND'
  rec_bad_content '2026-09-02T10:00:01.000Z'
} > "$dir/s.jsonl"
mute_case 'mute: a decline with no readable text is unexplained, not mute' \
  "$wt" UNKNOWN unexplained-decline

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-02T10:00:00.000Z' ''
  rec_decline '2026-09-02T10:00:01.000Z' ''
} > "$dir/s.jsonl"
mute_case 'mute: an empty decline text is unexplained, not mute' \
  "$wt" UNKNOWN unexplained-decline

# Malformed LINES (as opposed to malformed shapes) must not take the pass down:
# `fromjson? | objects` skips them.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_garbage
  rec_scalar
  rec_summary
  rec_decline '2026-09-02T10:00:00.000Z' 'API Error: ENOTFOUND'
  rec_decline '2026-09-02T10:00:01.000Z' 'API Error: ENOTFOUND'
} > "$dir/s.jsonl"
mute_case 'mute: unparseable lines are skipped, not fatal' "$wt" YES '' 2

# --- transcript selection ----------------------------------------------------

# The NEWEST transcript decides, and "newest" is mtime — not name order.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_decline '2026-09-01T10:00:00.000Z' 'API Error: ENOTFOUND'
  rec_decline '2026-09-01T10:00:01.000Z' 'API Error: ENOTFOUND'
} > "$dir/zzz-old.jsonl"
rec_answer '2026-09-02T10:00:00.000Z' 'working' > "$dir/aaa-new.jsonl"
touch -t 202601010000 "$dir/zzz-old.jsonl"
touch -t 202606010000 "$dir/aaa-new.jsonl"
mute_case 'mute: the newest transcript decides, not the last name' "$wt" NO ''
touch -t 202609010000 "$dir/zzz-old.jsonl"
mute_case 'mute: making the other file newest flips the verdict' "$wt" YES '' 2

# NO PIPELINE IN THE SELECTION (#155). `ls -t | head -1` looks equivalent and is
# not: head exits after one line, ls takes SIGPIPE, and under a caller running
# `set -euo pipefail` that 141 propagates and kills the WHOLE run. It hides on a
# small directory — ls finishes into the pipe buffer before head closes it — and
# only fires once a seat accumulates enough transcripts to outrun the buffer.
# The coordinator seat has 300+, which truncated fleet-liveness.sh to five lines
# and exit 141. A one-file fixture cannot exercise this; the directory has to be
# big enough to fill the pipe.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
i=0
while [ "$i" -lt 400 ]; do
  printf '{"type":"summary","summary":"filler %s"}\n' "$i" > "$dir/f$i.jsonl"
  i=$(( i + 1 ))
done
{ rec_decline '2026-09-02T10:00:00.000Z' 'API Error: ENOTFOUND'
  rec_decline '2026-09-02T10:00:01.000Z' 'API Error: ENOTFOUND'
} > "$dir/zz-real.jsonl"
# The fillers are stamped OLD rather than the real transcript stamped NEWEST:
# the fillers were just written, so their mtime is now, and any fixed past
# stamp on zz-real would leave a filler as the newest file — the check would
# then read a `summary`-only transcript and report UNKNOWN, passing the SIGPIPE
# assertion for a reason that has nothing to do with SIGPIPE. Ageing the
# fillers keeps the selection unambiguous without putting a fixture mtime in
# the future.
touch -t 202601010000 "$dir"/f*.jsonl
touch -t 202609020000 "$dir/zz-real.jsonl"
( set -euo pipefail
  . "$PROBE"
  SEAT_PROBE_PIDS=()
  SEAT_PROBE_CWDS=()
  seat_probe_mute_check "$wt"
  [ "$SEAT_MUTE" = "YES" ] ) >/dev/null 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then
  pass 'mute: 400 transcripts under `set -euo pipefail` — no SIGPIPE, right verdict'
else
  fail 'mute: 400 transcripts under `set -euo pipefail` — no SIGPIPE, right verdict' \
    "the run exited $rc (141 means a pipeline took SIGPIPE — the #155 class)"
fi

# ============================================================================
section 'Section 5 — seat_probe_stall_check: fixture transcripts'
# ============================================================================

# NOTE ON COST. Every fixture below has an EMPTY pid map, so the check stops at
# "no process" and never reaches its CPU windows. That is deliberate: the
# windows sleep 20s each, and a harness that sleeps is a harness nobody runs.
# "UNKNOWN/no-process" is therefore this file's way of saying THE GATE OPENED —
# the record was read as an unanswered dispatch — and "NO" means it did not.
#
#   $1 name  $2 worktree  $3 want SEAT_STALL  $4 want SEAT_STALL_UNKNOWN
stall_case() {
  local name="$1" wt="$2" want="$3" want_unknown="$4" rc
  seat_probe_stall_check "$wt"
  rc=$?
  if [ "$rc" -ne 0 ]; then
    fail "$name" "seat_probe_stall_check returned $rc; it must always return 0"
    return 0
  fi
  if [ "$SEAT_STALL" != "$want" ]; then
    fail "$name" "SEAT_STALL expected '$want', got '$SEAT_STALL'" \
      "unknown='$SEAT_STALL_UNKNOWN' ts='$SEAT_STALL_TS' cpu='$SEAT_STALL_CPU'"
    return 0
  fi
  if [ "$SEAT_STALL_UNKNOWN" != "$want_unknown" ]; then
    fail "$name" "SEAT_STALL_UNKNOWN expected '$want_unknown', got '$SEAT_STALL_UNKNOWN'"
    return 0
  fi
  pass "$name"
}

# --- the same two-reasons invariant, in the second checker -------------------

wt="$(new_seat_no_dir)"
stall_case 'stall: no transcript directory says so' "$wt" UNKNOWN no-transcript-dir

wt="$(new_seat)"
stall_case 'stall: an empty directory is "nothing here"' "$wt" UNKNOWN no-transcript

if [ "$CAN_TEST_PERMS" -eq 1 ]; then
  wt="$(new_seat)"
  dir="$(seat_probe_session_dir "$wt")"
  rec_answer '2026-09-02T10:00:00.000Z' 'hi' > "$dir/s.jsonl"
  chmod 000 "$dir"
  stall_case 'stall: an unreadable DIRECTORY is a failed check' "$wt" UNKNOWN unreadable
  chmod 755 "$dir"

  wt="$(new_seat)"
  dir="$(seat_probe_session_dir "$wt")"
  rec_answer '2026-09-02T10:00:00.000Z' 'hi' > "$dir/s.jsonl"
  chmod 000 "$dir/s.jsonl"
  stall_case 'stall: an unreadable TRANSCRIPT is a failed check' "$wt" UNKNOWN unreadable
  chmod 644 "$dir/s.jsonl"
else
  skip 'stall: unreadable directory' 'running as root'
  skip 'stall: unreadable transcript' 'running as root'
fi

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_summary; rec_garbage; } > "$dir/s.jsonl"
stall_case 'stall: a transcript with no conversational record says so' \
  "$wt" UNKNOWN no-conversation

# --- the gate itself ---------------------------------------------------------

wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_dispatch '2026-09-02T10:00:00.000Z' 'go'
  rec_answer   '2026-09-02T10:00:01.000Z' 'done'
} > "$dir/s.jsonl"
stall_case 'stall: a transcript ending on an assistant record owes nothing' "$wt" NO ''
assert_eq 'stall: an answered turn takes no CPU windows' '' "$SEAT_STALL_CPU"

# The gate OPENS on a genuine unanswered dispatch — a plain user record with no
# assistant record after it.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer   '2026-09-02T10:00:00.000Z' 'ready'
  rec_dispatch '2026-09-02T10:00:01.000Z' 'please do the thing'
} > "$dir/s.jsonl"
stall_case 'stall: an unanswered dispatch opens the gate' "$wt" UNKNOWN no-process
assert_eq 'stall: the unanswered dispatch timestamp is reported' \
  '2026-09-02T10:00:01.000Z' "$SEAT_STALL_TS"

# A dispatch carrying TEXT BLOCKS rather than a string is still a dispatch.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer         '2026-09-02T10:00:00.000Z' 'ready'
  rec_dispatch_blocks '2026-09-02T10:00:01.000Z' 'please do the thing'
} > "$dir/s.jsonl"
stall_case 'stall: a block-form dispatch opens the gate' "$wt" UNKNOWN no-process

# A TOOL RESULT IS ALSO WRITTEN AS A `user` RECORD, AND IT IS NOT A DISPATCH
# (#217). This is the correction that makes the gate mean what the issue asked
# for. Measured over 319 transcripts, of the 23 that end on a `user` record, 20
# end on a tool result — so keying the gate on the record TYPE alone opens it on
# 87% ordinary mid-turn traffic, including both live seats at the time, and
# hands the whole discrimination to the CPU windows (40s per healthy seat).
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_dispatch   '2026-09-02T10:00:00.000Z' 'go'
  rec_answer     '2026-09-02T10:00:01.000Z' 'calling a tool'
  rec_toolresult '2026-09-02T10:00:02.000Z'
} > "$dir/s.jsonl"
stall_case 'stall: a trailing TOOL RESULT is mid-turn traffic, not a stall' "$wt" NO ''
assert_eq 'stall: a tool result takes no CPU windows' '' "$SEAT_STALL_CPU"

# `has(k) and .k != null`, NOT `// null`. jq's `//` treats `false` as ABSENT, so
# a tool whose result is the literal `false` would read as "no tool result here"
# and OPEN the gate — the unsafe direction, since every other ambiguity in the
# file closes it.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer            '2026-09-02T10:00:00.000Z' 'calling a tool'
  rec_toolresult_false  '2026-09-02T10:00:01.000Z'
} > "$dir/s.jsonl"
stall_case 'stall: a toolUseResult of literal FALSE is still a tool result' "$wt" NO ''

# ANY tool_result block disqualifies the record: a mixed block is still a turn
# in progress, and the ambiguous direction has to be "the seat is fine".
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer          '2026-09-02T10:00:00.000Z' 'calling a tool'
  rec_toolresult_mixed '2026-09-02T10:00:01.000Z'
} > "$dir/s.jsonl"
stall_case 'stall: a mixed text+tool_result record is not a dispatch' "$wt" NO ''

# A NON-OBJECT .message MUST NOT DROP THE ROW. `.message.content?` on a string
# `.message` yields `empty`, and an `elif` whose CONDITION is empty produces no
# output at all — so the record would VANISH from the pass rather than fall
# through to "plain", and the verdict would be read from an older record. That
# is the stale-verdict class re-opened inside its own fix, and it announces
# nothing: 0 of the 316 transcripts on this host have such a record. Here the
# malformed record is the LAST one, so a dropped row would report NO (from the
# assistant before it) instead of opening the gate.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer      '2026-09-02T10:00:00.000Z' 'ready'
  rec_bad_message '2026-09-02T10:00:01.000Z' 'user'
} > "$dir/s.jsonl"
stall_case 'stall: a non-object .message falls through to "plain", never dropped' \
  "$wt" UNKNOWN no-process

# RECORDS ARE ORDERED BY FILE POSITION, NEVER BY TIMESTAMP. 5 of the 24,560
# user/assistant records on this host step BACKWARDS in time, so a timestamp
# sort would reorder the very tail the verdict is read from. Here the trailing
# dispatch carries an EARLIER timestamp than the answer before it: file order
# opens the gate, a timestamp sort would report NO.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer   '2026-09-02T10:00:09.000Z' 'ready'
  rec_dispatch '2026-09-02T10:00:01.000Z' 'go'
} > "$dir/s.jsonl"
stall_case 'stall: the tail is file position, not timestamp order' "$wt" UNKNOWN no-process

# Unparseable lines after a real dispatch must not change the verdict.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer   '2026-09-02T10:00:00.000Z' 'ready'
  rec_dispatch '2026-09-02T10:00:01.000Z' 'go'
  rec_garbage
  rec_scalar
} > "$dir/s.jsonl"
stall_case 'stall: trailing unparseable lines do not close the gate' \
  "$wt" UNKNOWN no-process

# The two checks look at the same transcript and must not contradict each other
# on the same file. A transcript ending on a decline is MUTE's business: it ends
# on an ASSISTANT record, which is precisely the record the stall gate requires
# to be absent.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_dispatch '2026-09-02T10:00:00.000Z' 'go'
  rec_decline  '2026-09-02T10:00:01.000Z' 'API Error: ENOTFOUND'
  rec_decline  '2026-09-02T10:00:02.000Z' 'API Error: ENOTFOUND'
} > "$dir/s.jsonl"
mute_case  'mute+stall: a declining seat is MUTE...'      "$wt" YES '' 2
stall_case 'mute+stall: ...and is NOT stalled'            "$wt" NO ''

# ...and the converse: a seat that produced no assistant record at all is the
# stall check's business, and reports UNKNOWN (not mute) in the other.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
rec_dispatch '2026-09-02T10:00:00.000Z' 'go' > "$dir/s.jsonl"
mute_case  'mute+stall: a seat that never answered is not MUTE...' \
  "$wt" UNKNOWN no-assistant-message
stall_case 'mute+stall: ...it is the stall check that sees it' "$wt" UNKNOWN no-process

# ============================================================================
section 'Section 6 — the fail-open invariant, swept across every knob'
# ============================================================================

# THE ONE INVARIANT THE WHOLE FILE RESTS ON. Every rejection falls open to the
# knob's default, always with exit status 0 and always with a line on stderr —
# a silent fallback makes a typo'd knob undetectable, and a non-zero return
# would kill a caller running `set -e` in the middle of a health check.
#
# The values below are the ones that have actually gone wrong: the two 64-bit
# wrap points, an octal-looking value, a status-2 `[` comparison, and the empty
# string.
BAD_VALUES='abc -1 1.5 "" 0 000 99999999999999999999 18446744073709551617 1e3 0x10 1+1 %s'

# SET-BUT-EMPTY IS THE ONE VALUE THAT FALLS OPEN SILENTLY, and that is the
# contract, not a gap. Every knob is normalised at source time with `:-`
# (`SEAT_PROBE_CPU_SAMPLE_S="${SEAT_PROBE_CPU_SAMPLE_S:-20}"`), so `KNOB=` and
# an unset KNOB are the SAME state by the time any getter runs — the empty
# value is gone before there is anything to warn about. It is also the shell's
# own idiom for "use the default", so warning on it would mean warning on a
# deliberate unset. What the sweep still demands of the empty case is the part
# that matters: the default, and exit 0. Loudness is owed for a value that was
# actually typed wrong, which is every other entry above.
sweep_fail_open() { # knob_name getter_fn default
  local knob="$1" getter="$2" def="$3" v out rc err bad=0
  err="$TMPROOT/sweep.err"
  for v in $BAD_VALUES; do
    [ "$v" = '""' ] && v=""
    : >"$err"
    # Pin the sample window ONLY when it is not the knob under test. The floor's
    # ceiling is derived from it, so the floor sweep needs it fixed — but pinning
    # it while sweeping SEAT_PROBE_CPU_SAMPLE_S itself overwrites the bad value
    # with a VALID one, and since the pin equals the default the getter then
    # returns the expected default from a value that was never rejected. Every
    # sample case passed its verdict assertion for that reason and only the
    # missing warning gave it away.
    if [ "$knob" = "SEAT_PROBE_CPU_SAMPLE_S" ]; then
      out="$(env "$knob=$v" bash -c ". '$PROBE'; $getter" 2>"$err")"
    else
      out="$(env "$knob=$v" "SEAT_PROBE_CPU_SAMPLE_S=20" bash -c \
        ". '$PROBE'; $getter" 2>"$err")"
    fi
    rc=$?
    if [ "$rc" -ne 0 ]; then
      fail "fail-open: $knob=$v" "the getter exited $rc; every rejection must return 0"
      bad=1
      continue
    fi
    if [ "$out" != "$def" ]; then
      fail "fail-open: $knob=$v" "expected the default '$def', got '$out'"
      bad=1
      continue
    fi
    if [ -z "$v" ]; then
      # See the note above: `:-` at source time already turned this into "unset".
      if [ -s "$err" ]; then
        fail "fail-open: $knob=<empty>" \
          "set-but-empty is normalised to unset at source time and must be silent; got: $(cat "$err")"
        bad=1
      fi
      continue
    fi
    if [ ! -s "$err" ]; then
      fail "fail-open: $knob=$v" 'the fallback was SILENT; a typod knob must warn on stderr'
      bad=1
    fi
  done
  [ "$bad" -eq 0 ] && pass "fail-open: $knob rejects every bad value to its default, loudly"
  return 0
}

sweep_fail_open SEAT_PROBE_CPU_SAMPLE_S      seat_probe_cpu_sample_s   "$uint_default_sample"
sweep_fail_open SEAT_PROBE_CPU_FLOOR_CS      seat_probe_cpu_floor_cs   "$uint_default_floor"
sweep_fail_open SEAT_PROBE_MUTE_MIN_DECLINES seat_probe_min_declines   "$SEAT_PROBE_MUTE_MIN_DECLINES_DEFAULT"

# And the verdict side of the same invariant: no bad knob value may turn a
# healthy fixture into an alarm. A false "your live seat is dead" sends
# restart-team.sh at a working seat and stacks a second session on it — the one
# output this file is written never to produce.
wt_ok="$(new_seat)"
dir="$(seat_probe_session_dir "$wt_ok")"
{ rec_dispatch '2026-09-02T10:00:00.000Z' 'go'
  rec_answer   '2026-09-02T10:00:01.000Z' 'done'
} > "$dir/s.jsonl"

alarm=0
for v in abc -1 0 99999999999999999999 18446744073709551617 ""; do
  ( SEAT_PROBE_MUTE_MIN_DECLINES="$v"
    SEAT_PROBE_CPU_FLOOR_CS="$v"
    SEAT_PROBE_CPU_SAMPLE_S="$v"
    seat_probe_mute_check "$wt_ok" 2>/dev/null
    [ "$SEAT_MUTE" = "NO" ] || exit 1
    seat_probe_stall_check "$wt_ok" 2>/dev/null
    [ "$SEAT_STALL" = "NO" ] || exit 1 ) || {
      fail "fail-open: a healthy seat stays healthy under a bad knob ($v)" \
        'a garbage knob value produced an alarm on a healthy fixture'
      alarm=1
    }
done
[ "$alarm" -eq 0 ] && pass 'fail-open: no bad knob value turns a healthy seat into an alarm'

# ============================================================================
section 'Section 7 — the caller contract'
# ============================================================================

# Both real callers source this file under `set -euo pipefail`, and one of them
# (coordinator-watchdog.sh) treats a failure to source as "launch unguarded". So
# sourcing must be silent and inert, and every check must survive the strict
# options end to end.
( set -euo pipefail
  . "$PROBE" ) >"$TMPROOT/source.out" 2>"$TMPROOT/source.err"
rc=$?
if [ "$rc" -ne 0 ]; then
  fail 'contract: sourcing under `set -euo pipefail` succeeds' "exit $rc: $(cat "$TMPROOT/source.err")"
elif [ -s "$TMPROOT/source.out" ] || [ -s "$TMPROOT/source.err" ]; then
  fail 'contract: sourcing is silent' \
    "stdout='$(cat "$TMPROOT/source.out")' stderr='$(cat "$TMPROOT/source.err")'"
else
  pass 'contract: sourcing is silent, inert and survives `set -euo pipefail`'
fi

# A caller that has not run seat_probe_scan_processes must not trip `set -u` on
# the pid map. fleet-liveness.sh scans first, but restart-team.sh and the
# watchdog reach these globals on paths that do not.
( set -euo pipefail
  . "$PROBE"
  seat_probe_pids_for_path /nowhere >/dev/null ) >/dev/null 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then
  pass 'contract: the pid map is safe to read before a scan under `set -u`'
else
  fail 'contract: the pid map is safe to read before a scan under `set -u`' "exit $rc"
fi

# Both verdict globals must be readable before their check has ever run — a
# reporting caller that reads them on an early path would otherwise die on
# `set -u` rather than report UNKNOWN.
( set -euo pipefail
  . "$PROBE"
  [ "$SEAT_MUTE" = "UNKNOWN" ] && [ "$SEAT_STALL" = "UNKNOWN" ] ) >/dev/null 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then
  pass 'contract: SEAT_MUTE/SEAT_STALL initialise to UNKNOWN at source time'
else
  fail 'contract: SEAT_MUTE/SEAT_STALL initialise to UNKNOWN at source time' "exit $rc"
fi

# Every check runs unpiped under the strict options against a real fixture.
( set -euo pipefail
  . "$PROBE"
  SEAT_PROBE_PIDS=()
  SEAT_PROBE_CWDS=()
  seat_probe_mute_check "$wt_ok"
  seat_probe_stall_check "$wt_ok"
  seat_probe_session_dir "$wt_ok" >/dev/null
  seat_probe_cpu_sample_s >/dev/null
  seat_probe_cpu_floor_cs >/dev/null ) >/dev/null 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then
  pass 'contract: a full pass over one seat survives `set -euo pipefail`'
else
  fail 'contract: a full pass over one seat survives `set -euo pipefail`' "exit $rc"
fi

# ============================================================================
printf '\n%s\n' '---'
printf 'passed %d   failed %d   skipped %d\n' "$PASS" "$FAIL" "$SKIP"
if [ "$FAIL" -ne 0 ]; then
  printf 'failing cases:%s\n' "$FAILED_NAMES"
  printf '\nEach case names the issue it defends. A failure here is a REGRESSION of\n'
  printf 'a defect already found once by hand — read that issue before deciding the\n'
  printf 'expectation is wrong.\n'
  exit 1
fi
exit 0
