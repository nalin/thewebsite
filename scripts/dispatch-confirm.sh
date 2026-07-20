#!/usr/bin/env bash
# dispatch-confirm.sh — coordinator-side Orca dispatch with confirmation (#127, #143).
#
# Makes a dispatch verifiable instead of fire-and-forget:
#   1. re-resolves the live agent terminal handle for a worktree (never trusts
#      a cached handle),
#   2. waits for the target pane to look idle before injecting, so the text is
#      not typed into a composer mid-turn where it gets discarded (#143),
#   3. creates the orchestration task and dispatches it with --inject,
#   4. polls dispatch-show until THAT dispatch (matched by id) has landed on a
#      pane (bounded wait, early bail on a terminal failure state),
#   5. retries the dispatch exactly once, with a freshly resolved handle, but
#      only when the first attempt verifiably did NOT land: a structured
#      terminal_handle_stale error, or a dispatch record in a terminal failure
#      state. An unconfirmed dispatch that may still land is never retried
#      (the CLI has no void/cancel verb, so re-dispatching could inject the
#      same task twice),
#   6. after landing, verifies the worker actually CONSUMED the injection —
#      "landed" only means the text reached the composer; if the worker was
#      mid-turn it is discarded at end-of-turn and the task never starts (#143).
#      Evidence of consumption is the task id appearing in the session
#      transcript. On a consumption timeout it first NUDGES the pane with a bare
#      Enter (the landed text may just be sitting unsubmitted in the composer)
#      and re-checks briefly; only if that surfaces nothing does it re-inject the
#      SAME task via `terminal send`, carrying the FULL reply path — the
#      coordinator handle plus worker_done/heartbeat command templates (from
#      --reply-to) — because that re-injection bypasses the orca-generated
#      dispatch preamble that normally carries it; a worker re-injected without
#      it would run the task and then report to nowhere. Same ids are cited
#      (never task-create again, which would double-dispatch), bounded,
#   7. prints taskId/dispatchId on success; exits non-zero with a diagnostic
#      otherwise, so the coordinator never assumes a dispatch that didn't land
#      or that landed but was never consumed.
#
# Usage:
#   scripts/dispatch-confirm.sh --worktree <selector> --spec <text> \
#     --reply-to <coordinator-handle> \
#     [--title <text>] [--timeout <seconds>] [--consume-timeout <seconds>]
#
#   --worktree         selector accepted by `orca terminal list --worktree`
#                      (e.g. name:engineer, branch:eng/foo, path:/abs/path)
#   --spec             task spec text (becomes the worker's TASK block)
#   --reply-to         the coordinator's OWN terminal handle (REQUIRED). A
#                      re-injection (step 6) goes out via `terminal send`, which
#                      bypasses the orca-generated dispatch preamble — so the
#                      re-injected worker would otherwise have no handle to
#                      report to, recreating the orphaned-worker_done failure
#                      #143 already recovers from by hand. The re-injection
#                      message embeds a complete worker_done + heartbeat template
#                      addressed here so the reply path survives the re-inject.
#   --title            optional concise task title
#   --timeout          max seconds to wait for the dispatch to land (default 60, min 1)
#   --consume-timeout  max seconds to wait for the worker to consume each
#                      injection before re-injecting (default 45, min 1)
#
#   Env-overridable tunables (all integer-validated, same as the flags):
#     CONSUME_TIMEOUT (>=1)  REINJECT_MAX (>=0)  IDLE_BUDGET (>=0)
#     QUIET_S (>=1)          NUDGE_RECHECK_S (>=1)
#
# Internal coordinator tooling only — not part of the app build.

# Detect sourcing (unit tests source this file for the helper functions) BEFORE
# enabling strict mode, so a plain `source` never flips the calling shell's
# options — it used to leave `set -e` on and kill a test harness at the first
# rc-1 helper call. Sourced: define the helpers, then return before the
# imperative flow (guard below). Executed: enable strict mode and run normally.
(return 0 2>/dev/null) && _SOURCED=1 || _SOURCED=0
[[ "$_SOURCED" == "1" ]] || set -euo pipefail

# Tunables (env-overridable for tests / unusual panes; integer-validated below).
CONSUME_TIMEOUT="${CONSUME_TIMEOUT:-45}"  # per-attempt wait for consumption evidence
REINJECT_MAX="${REINJECT_MAX:-2}"         # re-injections after a landed-but-unconsumed dispatch
IDLE_BUDGET="${IDLE_BUDGET:-20}"          # max seconds to wait for the pane to go idle before injecting
QUIET_S="${QUIET_S:-4}"                   # transcript must be quiet this long to count as idle
NUDGE_RECHECK_S="${NUDGE_RECHECK_S:-6}"   # after a bare-Enter nudge, re-check consumption this long

# --- globals populated by the main flow (declared so helpers are self-evident) ---
WORKTREE=""
SPEC=""
TITLE=""
TIMEOUT=60
REPLY_TO=""     # coordinator's own handle; the reply path a re-injection carries
TASK_ID=""
PROJDIR=""      # role's ~/.claude/projects transcript dir, or "" if unresolved
INJECT_AT=0     # epoch seconds captured immediately before each (re)injection
PROBE_STATE=""
LAST_STATUS=""

usage() {
  sed -n '2,60p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
  exit 2
}

# Pick the live agent terminal for the worktree: connected + writable panes,
# preferring titled ones (Orca's agent status hooks title agent panes; bare
# shells have title null), most recent output first.
#
# Wrong-pane risk: "most recent output" selects the *busiest* titled pane. In
# the standard layout (one agent pane per role worktree) that is the seat; in
# a multi-agent-pane worktree it can pick a pane that is mid-task. If that
# layout matters to you, pass a narrower --worktree selector.
#
# Errors from `terminal list` are swallowed into the empty-handle path so the
# caller gets the "no live agent terminal" diagnostic instead of an opaque
# set -e death inside a command substitution.
resolve_handle() {
  local out
  out="$(orca terminal list --worktree "$WORKTREE" --json 2>/dev/null || true)"
  jq -r '
    [.result.terminals[]? | select(.connected and .writable)] as $live
    | (if ($live | map(select(.title != null and .title != "")) | length) > 0
       then $live | map(select(.title != null and .title != ""))
       else $live
       end)
    | sort_by(.lastOutputAt // 0) | reverse
    | (first // {}) | .handle // empty' <<<"$out" 2>/dev/null || true
}

# Filesystem path of the target worktree (all panes in a worktree share it),
# used to locate the session transcript. Any matching terminal's worktreePath
# is fine. Empty on error.
resolve_wtpath() {
  local out
  out="$(orca terminal list --worktree "$WORKTREE" --json 2>/dev/null || true)"
  jq -r '[.result.terminals[]? | .worktreePath // empty] | (first // empty)' <<<"$out" 2>/dev/null || true
}

# Map a worktree path to its Claude Code transcript directory. Claude stores
# each session at ~/.claude/projects/<cwd-with-every-non-alnum-char-as-dash>/
# <uuid>.jsonl (rule verified 2026-07-17 against the live projects dir). Returns
# the dir only if it exists, else "" so callers degrade gracefully.
transcript_dir_for() {
  local wtpath="$1" munged d
  [[ -n "$wtpath" ]] || { echo ""; return 0; }
  munged="$(printf '%s' "$wtpath" | sed 's/[^a-zA-Z0-9]/-/g')"
  d="$HOME/.claude/projects/$munged"
  if [[ -d "$d" ]]; then echo "$d"; else echo ""; fi
}

# Portable file mtime (epoch seconds): BSD stat (macOS, where the coordinator
# runs) first, then GNU stat, then 0.
file_mtime() { stat -f %m "$1" 2>/dev/null || stat -c %Y "$1" 2>/dev/null || echo 0; }
now_epoch()  { date +%s; }

# Newest mtime across the transcript *.jsonl files (the active session is the
# one being appended to). 0 if no dir / no files.
newest_transcript_mtime() {
  [[ -n "$PROJDIR" ]] || { echo 0; return 0; }
  local f m newest=0
  while IFS= read -r f; do
    m="$(file_mtime "$f")"
    if (( m > newest )); then newest="$m"; fi
  done < <(find "$PROJDIR" -maxdepth 1 -name '*.jsonl' 2>/dev/null)
  echo "$newest"
}

# Best-effort idle wait (#143 hardening 2). Claude appends to the transcript on
# every message/tool event within a turn, so an advancing newest mtime == the
# pane is mid-turn; a mtime quiet for >= QUIET_S == idle at the composer.
# Returns 0 once it looks idle (or PROJDIR unknown → don't block), 1 if it
# stayed busy for the whole budget. NOTE: a turn blocked on a slow tool goes
# quiet mid-run, so this narrows — but cannot close — the race; the post-land
# consumption check (below) is what actually guarantees delivery.
wait_until_idle() {
  local budget="${1:-$IDLE_BUDGET}" deadline last now quiet_since
  [[ -n "$PROJDIR" ]] || return 0
  deadline=$(( SECONDS + budget ))
  last="$(newest_transcript_mtime)"
  quiet_since=$SECONDS
  while (( SECONDS < deadline )); do
    sleep 1
    now="$(newest_transcript_mtime)"
    if [[ "$now" != "$last" ]]; then
      last="$now"
      quiet_since=$SECONDS
    elif (( SECONDS - quiet_since >= QUIET_S )); then
      return 0
    fi
  done
  return 1
}

# Consumption evidence (#143 hardening 1): the worker submitted the injected
# text as a turn, so the dispatch preamble's task id now appears in a transcript
# file modified at/after the injection. The mtime guard rejects a stale task-id
# match; requiring the task id (not a bare mtime bump) rejects unrelated worker
# activity that merely advances the transcript while our text sits discarded in
# the composer. Returns 0 consumed, 1 not yet, 2 cannot determine — PROJDIR
# unset OR the transcript dir vanished mid-run (checked live so the rc-2 /
# cstate=2 "vanished mid-check" branch is actually reachable, not dead code).
consumed() {
  [[ -n "$PROJDIR" && -d "$PROJDIR" ]] || return 2
  local f m
  while IFS= read -r f; do
    m="$(file_mtime "$f")"
    if (( m + 1 >= INJECT_AT )) && grep -qF "$TASK_ID" "$f" 2>/dev/null; then
      return 0
    fi
  done < <(find "$PROJDIR" -maxdepth 1 -name '*.jsonl' 2>/dev/null)
  return 1
}

# One dispatch-show probe for a specific dispatch id. dispatch-show is
# task-addressed and returns a single dispatch record, so the id match is what
# guarantees we are looking at OUR dispatch and not a superseded one.
# Sets PROBE_STATE to landed|failed|pending and LAST_STATUS to the raw status.
probe_dispatch() {
  local expect="$1" out id status pane
  out="$(orca orchestration dispatch-show --task "$TASK_ID" --json 2>/dev/null || true)"
  id="$(jq -r '.result.dispatch.id // empty' <<<"$out" 2>/dev/null || true)"
  status="$(jq -r '.result.dispatch.status // empty' <<<"$out" 2>/dev/null || true)"
  pane="$(jq -r '.result.dispatch.assignee_pane_key // empty' <<<"$out" 2>/dev/null || true)"
  if [[ "$id" != "$expect" ]]; then
    LAST_STATUS="${status:+other-dispatch:$status}"
    PROBE_STATE="pending"
    return 0
  fi
  LAST_STATUS="$status"
  if [[ -n "$pane" ]] && [[ "$status" == "dispatched" || "$status" == "completed" ]]; then
    PROBE_STATE="landed"
  else
    case "$status" in
      failed|voided|canceled|cancelled|expired) PROBE_STATE="failed" ;;
      *)                                        PROBE_STATE="pending" ;;
    esac
  fi
}

# Poll until the given dispatch id lands. Returns 0 landed, 2 terminal failure
# (verifiably did not land — safe to re-dispatch), 1 deadline passed while
# still pending.
confirm_landed() {
  local expect="$1" deadline=$(( SECONDS + TIMEOUT ))
  while (( SECONDS < deadline )); do
    probe_dispatch "$expect"
    case "$PROBE_STATE" in
      landed) return 0 ;;
      failed) return 2 ;;   # early bail: no point burning the rest of the wait
    esac
    sleep 2
  done
  return 1
}

# ---------------------------------------------------------------------------
# Unit tests source this file for the detection helpers above (all pure function
# definitions). Stop before the imperative dispatch flow when sourced. _SOURCED
# was computed at the top (before strict mode), so this is just the return.
# ---------------------------------------------------------------------------
if [[ "$_SOURCED" == "1" ]]; then return 0; fi

# --- arg parsing --------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree)        WORKTREE="${2:?--worktree needs a value}";        shift 2 ;;
    --spec)            SPEC="${2:?--spec needs a value}";                shift 2 ;;
    --title)           TITLE="${2:?--title needs a value}";              shift 2 ;;
    --timeout)         TIMEOUT="${2:?--timeout needs a value}";          shift 2 ;;
    --consume-timeout) CONSUME_TIMEOUT="${2:?--consume-timeout needs a value}"; shift 2 ;;
    --reply-to)        REPLY_TO="${2:?--reply-to needs a value}";        shift 2 ;;
    -h|--help)         usage ;;
    *) echo "error: unknown argument '$1'" >&2; usage ;;
  esac
done

[[ -n "$WORKTREE" && -n "$SPEC" && -n "$REPLY_TO" ]] || usage

# Reject non-integer / out-of-range tunables — CLI flags AND env overrides —
# with a clear message instead of a cryptic set -e death inside later arithmetic.
validate_int() {  # <label> <value> <min>
  if ! [[ "$2" =~ ^[0-9]+$ ]] || (( $2 < $3 )); then
    echo "error: $1 must be an integer >= $3 (got '$2')" >&2
    exit 2
  fi
}
validate_int "--timeout"         "$TIMEOUT"         1
validate_int "--consume-timeout" "$CONSUME_TIMEOUT" 1
validate_int "REINJECT_MAX"      "$REINJECT_MAX"    0
validate_int "IDLE_BUDGET"       "$IDLE_BUDGET"     0
validate_int "QUIET_S"           "$QUIET_S"         1
validate_int "NUDGE_RECHECK_S"   "$NUDGE_RECHECK_S" 1

command -v orca >/dev/null 2>&1 || { echo "error: 'orca' not found on PATH" >&2; exit 1; }
command -v jq   >/dev/null 2>&1 || { echo "error: 'jq' is required" >&2; exit 1; }

# Resolve the transcript dir once, up front, from the worktree path. If it
# cannot be resolved the mid-turn/consumption checks degrade to no-ops (loudly
# noted at the end) rather than blocking the dispatch.
PROJDIR="$(transcript_dir_for "$(resolve_wtpath)")"
if [[ -z "$PROJDIR" ]]; then
  echo "warn: could not resolve a transcript dir for '$WORKTREE' — will dispatch but cannot verify consumption (#143)" >&2
fi

# 1) Create the task once; a retried dispatch reuses it.
create_args=(--spec "$SPEC" --json)
[[ -n "$TITLE" ]] && create_args+=(--task-title "$TITLE")
TASK_JSON="$(orca orchestration task-create "${create_args[@]}")"
TASK_ID="$(jq -r '.result.task.id // .result.id // empty' <<<"$TASK_JSON")"
if [[ -z "$TASK_ID" ]]; then
  echo "error: task-create returned no task id:" >&2
  echo "$TASK_JSON" >&2
  exit 1
fi
echo "created $TASK_ID"

# 2) Dispatch, confirm by dispatch id, retry at most once — and only when the
#    previous attempt verifiably failed.
err_file="$(mktemp)"
trap 'rm -f "$err_file"' EXIT

DISPATCH_ID=""
attempt=1
while :; do
  HANDLE="$(resolve_handle)"
  if [[ -z "$HANDLE" ]]; then
    echo "error: no live agent terminal found for worktree '$WORKTREE' ($TASK_ID left undispatched)" >&2
    exit 1
  fi

  # #143 hardening 2: don't inject into a pane that is mid-turn. Best-effort —
  # narrows the window; the post-land consumption check is the real guarantee.
  if [[ -n "$PROJDIR" ]]; then
    if ! wait_until_idle "$IDLE_BUDGET"; then
      echo "warn: pane still looked busy after ${IDLE_BUDGET}s — injecting anyway (will verify consumption)" >&2
    fi
  fi

  echo "dispatching $TASK_ID to $HANDLE (attempt $attempt)"

  # stdout and stderr captured separately: staleness is detected only from the
  # structured error code on a failed exit, never by substring — a spec that
  # merely *mentions* terminal_handle_stale must not trip it.
  INJECT_AT="$(now_epoch)"
  dispatch_rc=0
  dispatch_out="$(orca orchestration dispatch --task "$TASK_ID" --to "$HANDLE" --inject --json 2>"$err_file")" || dispatch_rc=$?
  dispatch_err="$(cat "$err_file")"

  if (( dispatch_rc != 0 )); then
    stale=0
    if jq -e '(.error.code? // empty) == "terminal_handle_stale"' <<<"$dispatch_err" >/dev/null 2>&1 \
       || jq -e '(.error.code? // empty) == "terminal_handle_stale"' <<<"$dispatch_out" >/dev/null 2>&1; then
      stale=1
    fi
    if (( stale == 1 && attempt == 1 )); then
      echo "warn: terminal handle stale — retrying once with a re-resolved handle" >&2
      attempt=2
      continue
    fi
    echo "error: dispatch of $TASK_ID failed (attempt $attempt, exit code $dispatch_rc):" >&2
    [[ -n "$dispatch_err" ]] && echo "$dispatch_err" >&2
    [[ -n "$dispatch_out" ]] && echo "$dispatch_out" >&2
    exit 1
  fi

  # rc == 0: pick up OUR dispatch id from the dispatch command's own output so
  # confirmation (and the printed dispatchId) can never refer to a superseded
  # dispatch record.
  DISPATCH_ID="$(jq -r '.result.dispatch.id // .result.dispatchId // .result.id // empty' <<<"$dispatch_out" 2>/dev/null || true)"
  if [[ -z "$DISPATCH_ID" ]]; then
    echo "error: dispatch succeeded but returned no dispatch id — cannot confirm it landed." >&2
    echo "       Inspect manually: orca orchestration dispatch-show --task $TASK_ID --json" >&2
    echo "$dispatch_out" >&2
    exit 1
  fi

  confirm_rc=0
  confirm_landed "$DISPATCH_ID" || confirm_rc=$?

  if (( confirm_rc == 1 )); then
    # Deadline passed while pending: one final probe to distinguish a late
    # landing from a dispatch that is still in flight.
    probe_dispatch "$DISPATCH_ID"
    case "$PROBE_STATE" in
      landed) confirm_rc=0 ;;
      failed) confirm_rc=2 ;;
    esac
  fi

  case "$confirm_rc" in
    0)
      echo "confirmed: dispatch landed (status=$LAST_STATUS)"
      break   # landed — proceed to consumption verification (#143)
      ;;
    2)
      # Verifiably failed (terminal state, never landed) — the only rc-0 case
      # where a second dispatch cannot become a double dispatch.
      if (( attempt == 1 )); then
        echo "warn: dispatch $DISPATCH_ID ended in terminal state '$LAST_STATUS' — retrying once with a re-resolved handle" >&2
        attempt=2
        continue
      fi
      echo "error: dispatch $DISPATCH_ID of $TASK_ID ended in terminal state '$LAST_STATUS' on the retry — giving up" >&2
      exit 1
      ;;
    *)
      # Still pending after the bounded wait. There is no dispatch void/cancel
      # verb, so re-dispatching here could inject the task twice if this one
      # lands late. Fail loudly instead and leave the decision to the caller.
      echo "error: dispatch $DISPATCH_ID of $TASK_ID not confirmed within ${TIMEOUT}s and not in a terminal state (last status: '${LAST_STATUS:-unknown}')." >&2
      echo "       NOT re-dispatching (it may still land — a retry could double-dispatch)." >&2
      echo "       Inspect with: orca orchestration dispatch-show --task $TASK_ID --json" >&2
      exit 1
      ;;
  esac
done

# 3) #143 hardening 1: 'landed' only means the text reached the composer. If the
#    worker was mid-turn, that text is discarded at end-of-turn and the task
#    never starts. Verify the worker actually CONSUMED it (its task id appears
#    in the transcript, written at/after our injection). On timeout, re-inject
#    the SAME task text via `terminal send` (never task-create again — that
#    double-dispatches) and re-verify. Bounded re-injections, then fail loudly.
if [[ -z "$PROJDIR" ]]; then
  echo "warn: consumption UNVERIFIED — no transcript dir for '$WORKTREE' (#143)." >&2
  echo "      Dispatch landed but I cannot confirm the worker consumed it; watch the pane." >&2
  echo "taskId=$TASK_ID"
  echo "dispatchId=$DISPATCH_ID"
  exit 0
fi

reinject=0
while :; do
  cdeadline=$(( SECONDS + CONSUME_TIMEOUT ))
  cstate=1
  while (( SECONDS < cdeadline )); do
    if consumed; then cstate=0; break; else crc=$?; fi
    if (( crc == 2 )); then cstate=2; break; fi
    sleep 3
  done

  if (( cstate == 0 )); then
    echo "confirmed: worker consumed dispatch (task id present in transcript)"
    echo "taskId=$TASK_ID"
    echo "dispatchId=$DISPATCH_ID"
    if (( reinject > 0 )); then echo "note: required $reinject recovery attempt(s) (nudge and/or re-send via terminal send)"; fi
    exit 0
  fi
  if (( cstate == 2 )); then
    echo "warn: consumption became unverifiable mid-check (transcript dir vanished) — treating as landed only" >&2
    echo "taskId=$TASK_ID"
    echo "dispatchId=$DISPATCH_ID"
    exit 0
  fi

  # Not consumed within CONSUME_TIMEOUT.
  if (( reinject >= REINJECT_MAX )); then
    echo "error: dispatch $DISPATCH_ID of $TASK_ID LANDED but was never consumed after $reinject re-injection(s) (${CONSUME_TIMEOUT}s each)." >&2
    echo "       The worker may be wedged mid-turn. Inspect the pane; do NOT task-create a duplicate (that double-dispatches)." >&2
    exit 1
  fi
  reinject=$(( reinject + 1 ))

  RHANDLE="$(resolve_handle)"
  if [[ -z "$RHANDLE" ]]; then
    echo "error: consumption timed out and no live terminal to re-inject into for '$WORKTREE'." >&2
    exit 1
  fi
  # Nudge-first (#145): the landed text may just be sitting UNSUBMITTED in the
  # composer (the documented TUI-startup case). A bare Enter submits it cleanly;
  # re-check for a short window. Only if that surfaces nothing do we re-send the
  # full task text — which would otherwise concatenate the stale composer text
  # with a fresh copy into one composite message.
  echo "warn: not consumed within ${CONSUME_TIMEOUT}s (attempt $reinject/$REINJECT_MAX) — nudging composer with a bare Enter first" >&2
  orca terminal send --terminal "$RHANDLE" --text "" --enter --json >/dev/null 2>&1 || true
  nudge_result=none
  ndeadline=$(( SECONDS + NUDGE_RECHECK_S ))
  while (( SECONDS < ndeadline )); do
    if consumed; then nudge_result=consumed; break; else nrc=$?; fi
    if (( nrc == 2 )); then nudge_result=vanished; break; fi
    sleep 2
  done
  case "$nudge_result" in
    consumed) echo "note: the bare-Enter nudge submitted the already-landed injection" >&2; continue ;;
    vanished) continue ;;   # transcript dir vanished; the outer loop's cstate=2 reports it
  esac

  echo "warn: nudge surfaced no consumption — re-sending the full task $TASK_ID via terminal send" >&2
  wait_until_idle "$IDLE_BUDGET" || true
  INJECT_AT="$(now_epoch)"
  # Reconstruct the reply path the discarded dispatch preamble carried. A
  # `terminal send` re-injection bypasses orca's preamble generation, so the
  # re-injected worker would otherwise know WHAT to do but not WHERE to report
  # — completing into a stale/unknown handle (the orphaned-worker_done failure).
  # Embed the coordinator handle (--reply-to), the worker's own handle (for
  # --from), and complete heartbeat + worker_done templates citing the SAME ids.
  REINJECT_MSG="DISPATCH (re-injection of task $TASK_ID / dispatch $DISPATCH_ID). A prior injection of this task landed but was not consumed — it was discarded from a mid-turn composer, so you never saw the original dispatch preamble. This is the SAME task; do NOT create a new task or dispatch.

You are the worker at terminal $RHANDLE. Report to the coordinator at $REPLY_TO. Send a heartbeat every ~5 min while working, and send EXACTLY ONE worker_done when finished (even on failure, with subject 'Failed: <reason>'):

  heartbeat:   orca orchestration send --to $REPLY_TO --from $RHANDLE --type heartbeat --subject alive --task-id $TASK_ID --dispatch-id $DISPATCH_ID --phase <investigating|implementing|reviewing|waiting>

  worker_done: orca orchestration send --to $REPLY_TO --from $RHANDLE --type worker_done --subject \"<short status>\" --body \"<3-sentence summary>\" --task-id $TASK_ID --dispatch-id $DISPATCH_ID --files-modified \"<comma,separated,paths>\"

TASK:
$SPEC"
  if ! orca terminal send --terminal "$RHANDLE" --text "$REINJECT_MSG" --enter --json >/dev/null 2>&1; then
    echo "warn: terminal send re-injection returned non-zero (will still re-verify)" >&2
  fi
done
