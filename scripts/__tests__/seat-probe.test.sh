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
# restart-team.sh at a healthy seat and stacks a second session on it. Section 7
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
#     harness runs in a few seconds (measured 6.6s with Section 7's 300-session
#     fixture, against 2.4s before it). If a case here starts taking 40s,
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
section 'Section 3 — seat_probe_cpu_window_busy: the BUSY/IDLE decision'
# ============================================================================

# THE FALSE-ALARM-CRITICAL HALF OF THE STALLED VERDICT (#228). Every other part
# of the stall check only narrows the population; this function alone decides
# whether a live seat is working. A wrong BUSY->IDLE flip here is the exact
# output the fail-open invariant forbids — fleet-liveness.sh reports STALLED
# and restart-team.sh stacks a second session on a seat that was working.
#
# It is also the cheapest thing in this file to pin, because it SLEEPS NOTHING.
# The function that sleeps is seat_probe_cpu_window; this one is a pure
# decision over SEAT_PROBE_CPU_DELTAS, so every case below costs microseconds
# and the harness's ~1s budget is untouched. The header's "the stall check
# SLEEPS when it reaches its CPU windows" is true of the window, not of the
# decision, and it is why this half went uncovered until #228.
#
# That the gap was real was proved by MUTATION, not by reading: both #220
# defects reintroduced in a scratch copy left the harness green at 109/0.

# name deltas want(BUSY|IDLE) [floor]
busy_case() {
  local name="$1" deltas="$2" want="$3" floor="${4:-$uint_default_floor}"
  local rc got
  # UNPIPED, and in a SUBSHELL — so no case's floor or deltas can reach a later
  # one. A leaked floor would read as a passing boundary rather than as a
  # failure, which is the shape of bug this section exists to catch (#232: the
  # comment here previously justified the subshell with a claim about `VAR=x
  # func` prefix assignments persisting, which is not true of the bash 3.2.57
  # this harness targets — the containment argument does not need it).
  ( SEAT_PROBE_CPU_FLOOR_CS="$floor"
    SEAT_PROBE_CPU_DELTAS="$deltas"
    seat_probe_cpu_window_busy ) 2>/dev/null
  rc=$?
  case "$rc" in
    0) got=BUSY ;;
    1) got=IDLE ;;
    *) fail "$name" "returned $rc; this decision is 0=BUSY / 1=IDLE and nothing else"
       return 0 ;;
  esac
  assert_eq "$name" "$want" "$got"
}

# The two defects #220 fixed, each one review round's worth of argument.
busy_case 'cpu-busy: a negative delta is a recycled pid, not idleness' '111:-5'   BUSY
busy_case 'cpu-busy: an empty window never ran, so it cannot read idle' ''        BUSY
busy_case 'cpu-busy: an unreadable delta reads busy'                   '111:none' BUSY
busy_case 'cpu-busy: a non-numeric delta reads busy'                   '111:abc'  BUSY
# An entry carrying no colon at all: `${entry#*:}` leaves it whole, and
# whatever it then looks like must still land on BUSY.
busy_case 'cpu-busy: a malformed entry with no colon reads busy'       '111'      BUSY

# The floor boundary, at and below it. The two IDLE lines here are the only
# assertions in this section allowed to come back IDLE at all.
busy_case 'cpu-busy: one centisecond below the floor reads idle' '111:99'  IDLE
busy_case 'cpu-busy: the floor itself reads busy'                '111:100' BUSY
busy_case 'cpu-busy: a zero delta reads idle'                    '111:0'   IDLE

# ANY pid working makes the window busy; it takes every pid idle to read idle.
busy_case 'cpu-busy: every pid below the floor reads idle'  '111:0 222:5'    IDLE
busy_case 'cpu-busy: one busy pid among idle ones'          '111:0 222:250'  BUSY
busy_case 'cpu-busy: one unreadable pid among idle ones'    '111:0 222:none' BUSY

# The floor knob reaches the decision...
busy_case 'cpu-busy: a raised floor is honoured'     '111:100' IDLE 250
busy_case 'cpu-busy: a raised floor is not exceeded' '111:250' BUSY 250

# ...and a REJECTED floor may not. This is #222's harm path end to end: an
# over-large floor is refused by seat_probe_uint, the decision runs on the
# default, and a pid that spent a whole second of CPU still reads BUSY. Were
# the rejected value to get through, 100cs would read IDLE and a working seat
# would be reported STALLED — which is how #222 was found.
busy_err="$TMPROOT/cpu-busy.err"
( SEAT_PROBE_CPU_FLOOR_CS=9999
  SEAT_PROBE_CPU_DELTAS='111:100'
  seat_probe_cpu_window_busy ) 2>"$busy_err"
busy_rc=$?
assert_eq 'cpu-busy: an over-large floor falls open, so the floor still reads busy' \
  '0' "$busy_rc"
if [ -s "$busy_err" ]; then
  pass 'cpu-busy: the rejected floor warns on stderr'
else
  fail 'cpu-busy: the rejected floor warns on stderr' \
    'the fallback was SILENT; a typod knob must warn'
fi

# ============================================================================
section 'Section 4 — seat_probe_min_declines: the persistence gate knob'
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
section 'Section 5 — seat_probe_mute_check: fixture transcripts'
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
section 'Section 6 — seat_probe_stall_check: fixture transcripts'
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

# --- the WIRING: how a window result becomes a verdict (#231) ----------------
#
# Every fixture above stops at the no-process guard, so until now NOTHING in
# this file observed the branch the check takes with a window result in hand.
# That gap was proved real by MUTATION at the #230 gate: inverting the first
# window's test —
#
#     -  if seat_probe_cpu_window_busy; then
#     +  if ! seat_probe_cpu_window_busy; then
#
# — left the harness at 124/0, exit 0. That inversion is precisely the false
# alarm this file is written never to produce: a working seat reads STALLED,
# fleet-liveness.sh reports it, and restart-team.sh stacks a second session on
# a live process.
#
# THE SEAM IS FUNCTION SHADOWING IN A SUBSHELL, NOT A HOOK IN THE PROBE. #231
# assumed this needed an injectable window result added to seat-probe.sh, and
# worried — correctly — that such a seam could become a way for a caller to
# talk the check into "the seat is fine". No seam is needed. bash lets this
# harness redefine seat_probe_pids_for_path, seat_probe_self_claude_pid and
# seat_probe_cpu_window_or_fail INSIDE the command substitution below, where
# the definitions die with the subshell. seat-probe.sh is untouched, so the
# production surface gains nothing a caller could reach.
#
# What is replaced is only the part that SLEEPS. The decision itself —
# seat_probe_cpu_window_busy, pinned case by case above — is left alone and
# still decides every case here from the injected deltas, so these cases pin
# the wiring rather than restating the decision. Cost: microseconds.
#
#   $1 name  $2 worktree  $3 window-1 spec  $4 window-2 spec
#   $5 want SEAT_STALL  $6 want SEAT_STALL_UNKNOWN  $7 want SEAT_STALL_CPU
#   $8 self pid (optional; the caller's own claude pid, '' for none)
#
# A window spec is either a SEAT_PROBE_CPU_DELTAS string or the word `fail`,
# which stands for a window the host slept through.
wired_case() {
  local name="$1" wt="$2" w1="$3" w2="$4" want="$5" want_unknown="$6"
  local want_cpu="$7" self_pid="${8-}"
  local out rc got got_unknown got_cpu
  out="$(
    seat_probe_pids_for_path()  { printf '%s\n' '111 222'; }
    seat_probe_self_claude_pid() { [ -n "$self_pid" ] && printf '%s\n' "$self_pid"; return 0; }
    wired_n=0
    seat_probe_cpu_window_or_fail() {
      local spec
      wired_n=$(( wired_n + 1 ))
      if [ "$wired_n" -eq 1 ]; then spec="$w1"; else spec="$w2"; fi
      if [ "$spec" = fail ]; then
        SEAT_PROBE_CPU_DELTAS=''
        return 1
      fi
      SEAT_PROBE_CPU_DELTAS="$spec"
      return 0
    }
    seat_probe_stall_check "$wt"
    printf '%s\t%s\t%s\t%s' "$?" "$SEAT_STALL" "$SEAT_STALL_UNKNOWN" "$SEAT_STALL_CPU"
  )"
  rc="$(printf '%s' "$out" | cut -f1)"
  got="$(printf '%s' "$out" | cut -f2)"
  got_unknown="$(printf '%s' "$out" | cut -f3)"
  got_cpu="$(printf '%s' "$out" | cut -f4)"
  if [ "$rc" != 0 ]; then
    fail "$name" "seat_probe_stall_check returned $rc; it must always return 0"
    return 0
  fi
  if [ "$got" != "$want" ]; then
    fail "$name" "SEAT_STALL expected '$want', got '$got'" \
      "unknown='$got_unknown' cpu='$got_cpu'"
    return 0
  fi
  if [ "$got_unknown" != "$want_unknown" ]; then
    fail "$name" "SEAT_STALL_UNKNOWN expected '$want_unknown', got '$got_unknown'"
    return 0
  fi
  if [ "$got_cpu" != "$want_cpu" ]; then
    fail "$name" "SEAT_STALL_CPU expected '$want_cpu', got '$got_cpu'"
    return 0
  fi
  pass "$name"
}

# One fixture serves every wiring case: a genuine unanswered dispatch, which is
# the only transcript shape that reaches a window at all.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
{ rec_answer   '2026-09-02T10:00:00.000Z' 'ready'
  rec_dispatch '2026-09-02T10:00:01.000Z' 'go'
} > "$dir/s.jsonl"

# THE CASE THE MUTATION ESCAPED. A busy first window ends it: NO, one window
# recorded, no confirm window taken. Invert the test and this reads YES.
wired_case 'stall-wiring: a busy first window ends the check at NO' \
  "$wt" '111:250 222:0' '111:0 222:0' NO '' 'w1:111:250 222:0'

# The CONFIRM window is not decoration (#207): one flat window cannot tell a
# working process from a stuck one, so a busy SECOND window still reads NO.
# Delete the confirm window, or invert its test, and this reads YES.
wired_case 'stall-wiring: a busy confirm window still ends at NO' \
  "$wt" '111:0 222:0' '111:250 222:0' NO '' 'w1:111:0 222:0 w2:111:250 222:0'

# TWO flat windows, and only then, is a stall. Both windows are reported, so
# the finding carries its own evidence.
wired_case 'stall-wiring: two flat windows are the STALLED verdict' \
  "$wt" '111:0 222:0' '111:0 222:0' YES '' 'w1:111:0 222:0 w2:111:0 222:0'

# The fail-open invariant, at the wiring: an UNREADABLE delta reads busy, so a
# pid that changed under the probe can never manufacture a stall.
wired_case 'stall-wiring: an unreadable delta in a window falls open to NO' \
  "$wt" '111:none 222:0' '111:0 222:0' NO '' 'w1:111:none 222:0'

# `sample-invalid` — the eighth UNKNOWN cause, and the last one with no
# assertion at all (#229 gap 2). A window the host slept through proves
# nothing, so the check reports that it could not measure rather than a
# verdict, at EITHER window. The first case also pins that no CPU evidence is
# recorded when the first window never produced any.
wired_case 'stall-wiring: a slept-through first window is UNKNOWN, not a verdict' \
  "$wt" fail fail UNKNOWN sample-invalid ''
wired_case 'stall-wiring: a slept-through confirm window is UNKNOWN, not a verdict' \
  "$wt" '111:0 222:0' fail UNKNOWN sample-invalid 'w1:111:0 222:0'

# THE SELF GUARD, ahead of both windows. A coordinator running this probe is
# mid-turn by construction — the unanswered record IS the turn that invoked the
# script — so its own seat reports NO without taking 40s of windows. The window
# specs below would read STALLED if the guard let them run.
wired_case 'stall-wiring: the probe never stalls its own seat' \
  "$wt" '111:0 222:0' '111:0 222:0' NO '' 'self:111' 111

# --- a jq that fails must say so, never read as an empty transcript (#229) ---
#
# The stall check's `jq_rc != 0 -> unreadable` branch. Forcing it false leaves
# the harness green: the behaviour degrades to `no-conversation`, which is
# SILENT — exactly the #216 shape, a broken check reading as "nothing to
# measure" instead of "this check failed". The mute side of this class is
# covered by the permission fixtures; this is the stall side's jq status, and
# it is the same class the #214 chain closed five instances of.
#
# Reached with a jq on PATH that always fails, so the transcript stays
# perfectly readable and the earlier -r guards cannot be what fires. This case
# needs no permission fixture, so unlike those it also runs as root.
JQ_STUB_DIR="$TMPROOT/brokenjq"
mkdir -p "$JQ_STUB_DIR"
printf '#!/bin/sh\nexit 3\n' > "$JQ_STUB_DIR/jq"
chmod 755 "$JQ_STUB_DIR/jq"

brokenjq_stall_case() { # name worktree want want_unknown
  local name="$1" wt="$2" want="$3" want_unknown="$4" out rc got got_unknown
  out="$(
    PATH="$JQ_STUB_DIR:$PATH"
    # bash caches command lookups; a PATH assignment is documented to
    # invalidate them, but say so explicitly rather than rely on it.
    hash -r 2>/dev/null || true
    seat_probe_stall_check "$wt"
    printf '%s\t%s\t%s' "$?" "$SEAT_STALL" "$SEAT_STALL_UNKNOWN"
  )"
  rc="$(printf '%s' "$out" | cut -f1)"
  got="$(printf '%s' "$out" | cut -f2)"
  got_unknown="$(printf '%s' "$out" | cut -f3)"
  if [ "$rc" != 0 ]; then
    fail "$name" "seat_probe_stall_check returned $rc; it must always return 0"
    return 0
  fi
  if [ "$got" != "$want" ] || [ "$got_unknown" != "$want_unknown" ]; then
    fail "$name" "expected '$want'/'$want_unknown', got '$got'/'$got_unknown'"
    return 0
  fi
  pass "$name"
}

# The stub is only ever a stub. If it ever stopped failing, the case below
# would pass for the wrong reason.
if "$JQ_STUB_DIR/jq" -n . >/dev/null 2>&1; then
  fail 'stall: the broken-jq stub actually fails' 'the stub returned 0'
else
  pass 'stall: the broken-jq stub actually fails'
fi

# The same fixture that reports UNKNOWN/no-process with a working jq: with a
# failing one it must report the CHECK failing, not an empty conversation.
brokenjq_stall_case 'stall: a jq that fails is a failed check, not "no conversation"' \
  "$wt" UNKNOWN unreadable

# ============================================================================
section 'Section 7 — seat_probe_dark_check: a WINDOW of sessions (#221)'
# ============================================================================

# THE FAILURE THIS SECTION DEFENDS. Between 2026-09-01 19:19Z and
# 2026-09-02 13:28Z eleven scheduled coordinator slots fired and NINE produced
# no work; the ops record went dark for 25 hours and every existing signal read
# green. Neither of the two checks above can see it, and the reason is
# structural rather than a matter of tuning:
#
#   * the mute check needs 2+ consecutive declines IN ONE TRANSCRIPT, and each
#     scheduled run gets a FRESH session — so eight failures were eight separate
#     first offences and the run never reached 2;
#   * the stall check needs the transcript to end WITHOUT an assistant record,
#     and eight of the nine ended WITH one, the synthetic decline.
#
# So the cases here are about a SEQUENCE of sessions, and the ones that matter
# most are the two that must NOT fire: a single dark session, and two of them.
# Those are the transient-transport class the persistence doctrine exists to
# suppress, and a check that goes red on them is one the loop learns to ignore.

# $1 name  $2 worktree  $3 want SEAT_DARK  $4 want SEAT_DARK_UNKNOWN
# $5 want SEAT_DARK_COUNT (optional)  $6 want SEAT_DARK_TOTAL (optional)
dark_case() {
  local name="$1" wt="$2" want_dark="$3" want_unknown="$4"
  local want_count="${5:-}" want_total="${6:-}" rc
  seat_probe_dark_check "$wt"
  rc=$?
  if [ "$rc" -ne 0 ]; then
    fail "$name" "seat_probe_dark_check returned $rc; it must always return 0"
    return 0
  fi
  if [ "$SEAT_DARK" != "$want_dark" ]; then
    fail "$name" "SEAT_DARK expected '$want_dark', got '$SEAT_DARK'" \
      "count=$SEAT_DARK_COUNT total=$SEAT_DARK_TOTAL unreadable=$SEAT_DARK_UNREADABLE unknown='$SEAT_DARK_UNKNOWN'"
    return 0
  fi
  if [ "$SEAT_DARK_UNKNOWN" != "$want_unknown" ]; then
    fail "$name" "SEAT_DARK_UNKNOWN expected '$want_unknown', got '$SEAT_DARK_UNKNOWN'"
    return 0
  fi
  if [ -n "$want_count" ] && [ "$SEAT_DARK_COUNT" != "$want_count" ]; then
    fail "$name" "SEAT_DARK_COUNT expected '$want_count', got '$SEAT_DARK_COUNT'"
    return 0
  fi
  if [ -n "$want_total" ] && [ "$SEAT_DARK_TOTAL" != "$want_total" ]; then
    fail "$name" "SEAT_DARK_TOTAL expected '$want_total', got '$SEAT_DARK_TOTAL'"
    return 0
  fi
  pass "$name"
}

# Write one session file with an EXPLICIT mtime, because this check is the only
# one whose verdict depends on the ORDER of several files. Records on stdin.
# $1 wtpath  $2 session name  $3 touch stamp (YYYYMMDDhhmm)
mk_session() {
  local f
  f="$(session_file "$1" "$2")"
  cat > "$f"
  touch -t "$3" "$f"
}

# A dead scheduled run, as it actually appears on disk: one user record carrying
# the prompt, one synthetic zero-token decline, nothing else. Eight of the nine
# #221 failures are byte-for-byte this shape.
dead_run() { # wt name stamp [text]
  { rec_dispatch '2026-09-01T19:19:38.000Z' 'the CEO prompt'
    rec_decline  '2026-09-01T19:19:39.000Z' "${4:-API Error: Unable to connect to API (ENOTFOUND)}"
  } | mk_session "$1" "$2" "$3"
}

# A run that did work.
live_run() { # wt name stamp
  { rec_dispatch '2026-09-02T07:18:15.000Z' 'the CEO prompt'
    rec_answer   '2026-09-02T07:20:00.000Z' 'merged #204'
    rec_dispatch '2026-09-02T07:30:00.000Z' 'next'
    rec_answer   '2026-09-02T07:41:49.000Z' 'done'
  } | mk_session "$1" "$2" "$3"
}

# --- the two reasons a guard can return without a verdict --------------------
#
# Same invariant as Sections 5 and 6 (#214, #216, #218): a guard that returns
# without a verdict must say WHICH of the two reasons it had.

wt="$(new_seat_no_dir)"
dark_case 'dark: no transcript directory says so' "$wt" UNKNOWN no-transcript-dir

wt="$(new_seat)"
dark_case 'dark: an empty directory is "nothing here"' "$wt" UNKNOWN no-transcript

# Sessions that exist and were never PROMPTED are a third, distinct nothing:
# nothing was asked of them, so they cannot have failed to answer.
wt="$(new_seat)"
rec_summary | mk_session "$wt" s1 202609010800
rec_summary | mk_session "$wt" s2 202609011000
dark_case 'dark: sessions that never received a prompt say so' \
  "$wt" UNKNOWN no-prompted-session

# The case above stops inside jq — a transcript of nothing but `summary` records
# emits no conversational rows at all, so the emptiness is decided before awk
# ever runs. This one reaches the OTHER unprompted path, the one awk decides: a
# transcript that DOES carry conversational records, all of them assistant, and
# no user record among them. Nothing was asked of that session either, so it is
# not evidence of an outage — and without a case here the awk branch that says
# so is untested, which mutation-testing caught (a mutation folding "unprompted"
# into "dark" survived the summary-only fixture).
wt="$(new_seat)"
for n in 1 2 3; do
  rec_decline '2026-09-01T19:19:39.000Z' 'API Error: Unable to connect to API (ENOTFOUND)' \
    | mk_session "$wt" "s$n" "20260901080$n"
done
dark_case 'dark: assistant records with no prompt are still not darkness' \
  "$wt" UNKNOWN no-prompted-session

if [ "$CAN_TEST_PERMS" -eq 1 ]; then
  wt="$(new_seat)"
  dead_run "$wt" s1 202609010800
  dir="$(seat_probe_session_dir "$wt")"
  chmod 000 "$dir"
  dark_case 'dark: an unreadable DIRECTORY is a failed check, not an empty one' \
    "$wt" UNKNOWN unreadable
  chmod 755 "$dir"

  # Every session in the window unreadable is the measurement failing. It must
  # NOT read as "no sessions here", and it must never read as darkness.
  wt="$(new_seat)"
  dead_run "$wt" s1 202609010800
  dead_run "$wt" s2 202609011000
  dead_run "$wt" s3 202609011200
  dir="$(seat_probe_session_dir "$wt")"
  chmod 000 "$dir"/s1.jsonl "$dir"/s2.jsonl "$dir"/s3.jsonl
  dark_case 'dark: every session unreadable is a failed check, never an alarm' \
    "$wt" UNKNOWN unreadable
  chmod 644 "$dir"/s1.jsonl "$dir"/s2.jsonl "$dir"/s3.jsonl
else
  skip 'dark: unreadable directory' 'running as root'
  skip 'dark: every session unreadable' 'running as root'
fi

# --- the persistence gate, which is the whole reason this is 3 and not 1 -----
#
# Measured over the coordinator's 299 transcripts: runs of consecutive dark
# sessions are 1, 2, 2, 2, 2, 3, 4, 6, 25 and 41 long. A threshold of 3
# suppresses all six short blips — the same ENOTFOUND/timeout family the mute
# check's own persistence gate suppresses — and still catches every real
# outage. These first two cases are that gate.

wt="$(new_seat)"
dead_run "$wt" s1 202609010800
dark_case 'dark: ONE dead run is not darkness' "$wt" NO '' 1 1

wt="$(new_seat)"
dead_run "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
dark_case 'dark: TWO dead runs are still not darkness' "$wt" NO '' 2 2

# THE #221 SIGNAL. Three consecutive scheduled runs that each took the prompt
# and produced nothing. On the real transcripts this fires at 2026-09-01
# 23:23:37Z — the third dead slot, about four hours in, against the 25 hours
# the loop actually ran blind.
wt="$(new_seat)"
dead_run "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
dead_run "$wt" s3 202609011200
dark_case 'dark: THREE dead runs is the #221 signal' "$wt" YES '' 3 3

# AND THEY DO NOT HAVE TO BE CONSECUTIVE. This is the case a trailing-streak
# rule gets wrong and the reason this check counts over a window instead: the
# real incident had a working run at 07:18Z sitting in the middle of nine dead
# ones, which resets a streak to zero and hides the outage.
wt="$(new_seat)"
dead_run "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
live_run "$wt" s3 202609011200
dead_run "$wt" s4 202609011400
dark_case 'dark: a working run in the middle does not reset the count' \
  "$wt" YES '' 3 4

# --- what is NOT darkness ----------------------------------------------------

wt="$(new_seat)"
live_run "$wt" s1 202609010800
live_run "$wt" s2 202609011000
live_run "$wt" s3 202609011200
dark_case 'dark: runs that did work are not dark' "$wt" NO '' 0 3

# ONE real assistant record is enough. The boundary is structural — zero versus
# non-zero — not a tuned count of turns, and it fails toward "the loop is fine".
# The real 07:18Z run is exactly this shape at a larger scale: 85 assistant
# records of which 84 were real and one was a synthetic decline.
wt="$(new_seat)"
{ rec_dispatch '2026-09-02T07:18:15.000Z' 'the CEO prompt'
  rec_decline  '2026-09-02T07:18:16.000Z' 'API Error: Unable to connect to API (ENOTFOUND)'
  rec_answer   '2026-09-02T07:20:00.000Z' 'recovered and did the work'
} | mk_session "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
dead_run "$wt" s3 202609011200
dark_case 'dark: one real record makes a session worked, declines notwithstanding' \
  "$wt" NO '' 2 3

# THE BENIGN DECLINE (#214). "No response requested." is the healthy end state
# of a dispatch that asked for no reply. Counting it as darkness would
# manufacture an outage out of three perfectly good no-reply dispatches — the
# same false positive the mute check refuses, one level up.
wt="$(new_seat)"
dead_run "$wt" s1 202609010800 'No response requested.'
dead_run "$wt" s2 202609011000 'No response requested.'
dead_run "$wt" s3 202609011200 'No response requested.'
dark_case 'dark: benign "no response requested" sessions are worked, not dark' \
  "$wt" NO '' 0 3

# A DEGRADED USAGE BLOCK MUST READ AS A REAL ANSWER, NOT AS DARKNESS. This is
# the -1 trap the mute check documents: mapping an unreadable usage block to 0
# would combine with model "<synthetic>" to read as a confirmed decline, so a
# garbage usage block would COUNT TOWARD an outage. It has to fail the other
# way.
wt="$(new_seat)"
for n in 1 2 3; do
  { rec_dispatch '2026-09-01T19:19:38.000Z' 'the CEO prompt'
    rec_bad_usage '2026-09-01T19:19:39.000Z'
  } | mk_session "$wt" "s$n" "20260901080$n"
done
dark_case 'dark: an unreadable usage block reads as worked, never as dark' \
  "$wt" NO '' 0 3

# A NON-OBJECT .message MUST NOT DROP THE RECORD (#217's elif trap, and #214's
# stale-verdict class). If such a record vanished from the pass, a session could
# lose the very user record that makes it count as prompted.
wt="$(new_seat)"
for n in 1 2 3; do
  { rec_bad_message '2026-09-01T19:19:38.000Z' user
    rec_decline '2026-09-01T19:19:39.000Z' 'API Error: Unable to connect to API (ENOTFOUND)'
  } | mk_session "$wt" "s$n" "20260901080$n"
done
dark_case 'dark: a non-object .message still counts as a prompted session' \
  "$wt" YES '' 3 3

# Malformed lines, bare scalars and compaction summaries survive the pass
# without aborting it.
wt="$(new_seat)"
for n in 1 2 3; do
  { rec_garbage
    rec_scalar
    rec_summary
    rec_dispatch '2026-09-01T19:19:38.000Z' 'the CEO prompt'
    rec_decline  '2026-09-01T19:19:39.000Z' 'API Error: Unable to connect to API (ENOTFOUND)'
  } | mk_session "$wt" "s$n" "20260901080$n"
done
dark_case 'dark: garbage lines do not abort the pass' "$wt" YES '' 3 3

# --- the window -------------------------------------------------------------
#
# The window is what keeps this check inside its runtime budget AND what stops
# an outage from alarming forever: old dark sessions age out as new ones push
# them off the end.

wt="$(new_seat)"
dead_run "$wt" s1 202609010800
dead_run "$wt" s2 202609010900
dead_run "$wt" s3 202609011000
for n in 4 5 6 7 8 9; do
  live_run "$wt" "s$n" "2026090111$(printf '%02d' $(( n * 5 )))"
done
dark_case 'dark: the full window still sees three old darks' "$wt" YES '' 3 9
# Narrow the window to the newest four and the darks fall off the end entirely.
( SEAT_PROBE_DARK_WINDOW=4
  seat_probe_dark_check "$wt"
  [ "$SEAT_DARK" = "NO" ] && [ "$SEAT_DARK_COUNT" = "0" ] ) 2>/dev/null
if [ $? -eq 0 ]; then
  pass 'dark: a narrower window drops sessions older than it'
else
  fail 'dark: a narrower window drops sessions older than it' \
    'the window did not bound how far back the count reaches'
fi

# NEWEST-FIRST ORDERING, which SEAT_DARK_LAST depends on entirely. It reports
# the most recent session that produced work, and that is the field separating
# "the loop is dark right now" from "it was dark yesterday and has recovered".
# Reading the window oldest-first would report the wrong one and quietly invert
# that meaning.
wt="$(new_seat)"
{ rec_dispatch '2026-09-01T01:00:00.000Z' 'old'
  rec_answer   '2026-09-01T01:00:01.000Z' 'old work'
} | mk_session "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
dead_run "$wt" s3 202609011200
dead_run "$wt" s4 202609011400
{ rec_dispatch '2026-09-03T09:00:00.000Z' 'new'
  rec_answer   '2026-09-03T09:00:01.000Z' 'new work'
} | mk_session "$wt" s5 202609011600
seat_probe_dark_check "$wt"
assert_eq 'dark: SEAT_DARK_LAST reports the NEWEST working session' \
  '2026-09-03T09:00:01.000Z' "$SEAT_DARK_LAST"

# An unprompted session is not EVIDENCE in either direction: never counted as
# dark, never counted in the total the verdict is read against.
wt="$(new_seat)"
dead_run "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
dead_run "$wt" s3 202609011200
rec_summary | mk_session "$wt" s4 202609011400
dark_case 'dark: an unprompted session is not counted as evidence' \
  "$wt" YES '' 3 3

# ...BUT IT DOES CONSUME A WINDOW SLOT, and that is a separate claim needing a
# separate fixture, because the case above cannot see it: four files against the
# default window of 10 never reach the slot rule at all. It passed identically
# whether a slot was spent or not, while its name asserted one of the two — the
# "verified once" shape #155, #214 and #229 each closed, and it is why the
# mutation row that claimed to pin it could not have been real (the code already
# WAS the mutation).
#
# So this fixture makes the window SMALLER than the file count. Newest-first:
# two unprompted, then four dead runs, with the window at 4.
#
#   slot IS spent (shipped): the window covers unprompted, unprompted, dead,
#     dead -> 2 of 2 dark, below the threshold of 3 -> NO
#   slot NOT spent:          the window skips past the two unprompted and
#     reaches four dead runs -> 4 of 4 dark -> YES
#
# The two behaviours give OPPOSITE verdicts on the same files, so this case can
# only pass under one of them.
wt="$(new_seat)"
rec_summary | mk_session "$wt" s6 202609011600
rec_summary | mk_session "$wt" s5 202609011500
dead_run "$wt" s4 202609011400
dead_run "$wt" s3 202609011300
dead_run "$wt" s2 202609011200
dead_run "$wt" s1 202609011100

# Set in THIS shell, not a subshell: dark_case reports through PASS/FAIL
# counters, and a `( ... )` wrapper would increment a copy that dies with it —
# the same subshell trap the seat counter at the top of this file exists for.
# Restored to the source-time value rather than unset, because the getter warns
# on a set-but-empty knob once sourcing's `:-` has already run.
SEAT_PROBE_DARK_WINDOW=4
dark_case 'dark: an unprompted session still consumes a window slot' \
  "$wt" NO '' 2 2
SEAT_PROBE_DARK_WINDOW=10

# Files that are not transcripts are ignored rather than counted or tripped over.
wt="$(new_seat)"
dir="$(seat_probe_session_dir "$wt")"
dead_run "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
dead_run "$wt" s3 202609011200
printf 'not a transcript\n' > "$dir/notes.txt"
mkdir -p "$dir/a-subdirectory"
dark_case 'dark: non-transcript entries are ignored' "$wt" YES '' 3 3

# --- a PARTIAL failure is not UNKNOWN, and must say so ----------------------
#
# If some sessions parsed and others did not, the verdict stands on the ones
# that did — but the caller has to be able to say the window was measured
# incompletely. An unreadable session is never counted as dark.
if [ "$CAN_TEST_PERMS" -eq 1 ]; then
  wt="$(new_seat)"
  dir="$(seat_probe_session_dir "$wt")"
  dead_run "$wt" s1 202609010800
  dead_run "$wt" s2 202609011000
  dead_run "$wt" s3 202609011200
  live_run "$wt" s4 202609011400
  chmod 000 "$dir"/s4.jsonl
  seat_probe_dark_check "$wt"
  if [ "$SEAT_DARK" = "YES" ] && [ "$SEAT_DARK_UNREADABLE" = "1" ] && [ "$SEAT_DARK_TOTAL" = "3" ]; then
    pass 'dark: a partly unreadable window still yields a verdict and reports the gap'
  else
    fail 'dark: a partly unreadable window still yields a verdict and reports the gap' \
      "SEAT_DARK=$SEAT_DARK unreadable=$SEAT_DARK_UNREADABLE total=$SEAT_DARK_TOTAL (want YES/1/3)"
  fi
  chmod 644 "$dir"/s4.jsonl
else
  skip 'dark: a partly unreadable window' 'running as root'
fi

# --- a big directory: no truncation, no early exit, window honoured ---------
#
# `ls -t | head -$window` is the obvious spelling of "newest N" and is the one
# this check refuses to use, because head exits after its lines and ls can take
# SIGPIPE — a 141 that propagates under a caller's `set -euo pipefail` and kills
# the whole run. That is the #155 class the mute and stall checks both carry
# comments about.
#
# BE PRECISE ABOUT WHAT THIS CASE DOES AND DOES NOT PROVE. Measured on the real
# coordinator directory while writing this: 299 entries make ~17KB of `ls`
# output, which fits inside the 64KB pipe buffer, so `ls -t | head -1` there
# completes with status 0 and does NOT reproduce the signal. A fixture of this
# size therefore cannot demonstrate SIGPIPE either, and claiming it did would be
# the kind of "verified once" that let the class survive in the first place.
#
# What it does prove is the part that is checkable at this size and is what
# actually broke: a directory far larger than the window still yields a verdict,
# still honours the window, and still returns 0 under the strict options. The
# SIGPIPE class is closed by CONSTRUCTION — there is no pipeline in the
# enumeration to take a signal — and that is a property of the code, not of this
# fixture. The assertion is on the UNPIPED exit status.
wt="$(new_seat)"
dead_run "$wt" s001 202609010800
dead_run "$wt" s002 202609010900
dead_run "$wt" s003 202609011000
n=4
while [ "$n" -le 300 ]; do
  live_run "$wt" "s$(printf '%03d' "$n")" "202608$(printf '%02d' $(( (n % 27) + 1 )))0800"
  n=$(( n + 1 ))
done
( set -euo pipefail
  . "$PROBE"
  SEAT_PROBE_PIDS=()
  SEAT_PROBE_CWDS=()
  seat_probe_dark_check "$wt"
  [ "$SEAT_DARK" = "YES" ] || exit 9
  [ "$SEAT_DARK_TOTAL" = "10" ] || exit 10 ) >/dev/null 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then
  pass 'dark: a 300-session directory truncates nothing and honours the window'
else
  fail 'dark: a 300-session directory truncates nothing and honours the window' \
    "exit $rc (141 = SIGPIPE; 9 = wrong verdict; 10 = window not honoured)"
fi

# --- the knobs --------------------------------------------------------------

uint_default_window="$SEAT_PROBE_DARK_WINDOW_DEFAULT"
uint_default_min="$SEAT_PROBE_DARK_MIN_DEFAULT"

assert_eq 'dark knob: the window defaults to 10' '10' "$(seat_probe_dark_window)"
assert_eq 'dark knob: the threshold defaults to 3' '3' "$(seat_probe_dark_min)"
assert_eq 'dark knob: a valid window override is honoured' \
  '25' "$(SEAT_PROBE_DARK_WINDOW=25 seat_probe_dark_window 2>/dev/null)"
assert_eq 'dark knob: a valid threshold override is honoured' \
  '5' "$(SEAT_PROBE_DARK_MIN=5 seat_probe_dark_min 2>/dev/null)"

# THE WINDOW TAKES A CEILING AND THE THRESHOLD DOES NOT, and the rule deciding
# that is the one at seat_probe_uint: a knob is bounded only when its
# over-large value fails toward a FALSE ALARM.
#
# An over-large WINDOW sweeps further back, so more old dark sessions land
# inside the count and a fixed threshold fires on outages that already
# recovered — the alarm direction. It is also the runtime bound: each session
# costs one jq pass, and walking all 299 transcripts costs 2.8s against the
# 0.2s the newest 10 cost.
assert_eq 'dark knob: the window is capped at its ceiling (alarm direction)' \
  "$uint_default_window" "$(SEAT_PROBE_DARK_WINDOW=$(( SEAT_PROBE_DARK_WINDOW_MAX + 1 )) seat_probe_dark_window 2>/dev/null)"
assert_eq 'dark knob: the window accepts exactly its ceiling' \
  "$SEAT_PROBE_DARK_WINDOW_MAX" "$(SEAT_PROBE_DARK_WINDOW=$SEAT_PROBE_DARK_WINDOW_MAX seat_probe_dark_window 2>/dev/null)"

# An over-large THRESHOLD demands more dark sessions than a window can hold,
# which reports the seat NOT dark — toward "the loop is fine", the only
# direction this file may fail in. So it is unbounded, exactly like
# SEAT_PROBE_MUTE_MIN_DECLINES, and a huge-but-comparable value must be
# ACCEPTED rather than rejected back to a default that would alarm.
assert_eq 'dark knob: the threshold has no ceiling (it fails toward "fine")' \
  '999999999' "$(SEAT_PROBE_DARK_MIN=999999999 seat_probe_dark_min 2>/dev/null)"

# And the verdict side of that: an absurd threshold silences the check, never
# the reverse.
wt="$(new_seat)"
dead_run "$wt" s1 202609010800
dead_run "$wt" s2 202609011000
dead_run "$wt" s3 202609011200
( SEAT_PROBE_DARK_MIN=999999999
  seat_probe_dark_check "$wt"
  [ "$SEAT_DARK" = "NO" ] ) 2>/dev/null
if [ $? -eq 0 ]; then
  pass 'dark: an over-large threshold silences the check rather than tripping it'
else
  fail 'dark: an over-large threshold silences the check rather than tripping it' \
    'an unreachable threshold produced an alarm'
fi

# ============================================================================
section 'Section 8 — the fail-open invariant, swept across every knob'
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
sweep_fail_open SEAT_PROBE_DARK_WINDOW       seat_probe_dark_window    "$SEAT_PROBE_DARK_WINDOW_DEFAULT"
sweep_fail_open SEAT_PROBE_DARK_MIN          seat_probe_dark_min       "$SEAT_PROBE_DARK_MIN_DEFAULT"

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
    SEAT_PROBE_DARK_WINDOW="$v"
    SEAT_PROBE_DARK_MIN="$v"
    seat_probe_mute_check "$wt_ok" 2>/dev/null
    [ "$SEAT_MUTE" = "NO" ] || exit 1
    seat_probe_stall_check "$wt_ok" 2>/dev/null
    [ "$SEAT_STALL" = "NO" ] || exit 1
    seat_probe_dark_check "$wt_ok" 2>/dev/null
    [ "$SEAT_DARK" = "NO" ] || exit 1 ) || {
      fail "fail-open: a healthy seat stays healthy under a bad knob ($v)" \
        'a garbage knob value produced an alarm on a healthy fixture'
      alarm=1
    }
done
[ "$alarm" -eq 0 ] && pass 'fail-open: no bad knob value turns a healthy seat into an alarm'

# ============================================================================
section 'Section 9 — the caller contract'
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
  [ "$SEAT_MUTE" = "UNKNOWN" ] && [ "$SEAT_STALL" = "UNKNOWN" ] \
    && [ "$SEAT_DARK" = "UNKNOWN" ] ) >/dev/null 2>&1
rc=$?
if [ "$rc" -eq 0 ]; then
  pass 'contract: SEAT_MUTE/SEAT_STALL/SEAT_DARK initialise to UNKNOWN at source time'
else
  fail 'contract: SEAT_MUTE/SEAT_STALL/SEAT_DARK initialise to UNKNOWN at source time' "exit $rc"
fi

# Every check runs unpiped under the strict options against a real fixture.
( set -euo pipefail
  . "$PROBE"
  SEAT_PROBE_PIDS=()
  SEAT_PROBE_CWDS=()
  seat_probe_mute_check "$wt_ok"
  seat_probe_stall_check "$wt_ok"
  seat_probe_dark_check "$wt_ok"
  seat_probe_session_dir "$wt_ok" >/dev/null
  seat_probe_dark_window >/dev/null
  seat_probe_dark_min >/dev/null
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
