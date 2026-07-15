#!/usr/bin/env bash
# dispatch-confirm.sh — coordinator-side Orca dispatch with confirmation (#127).
#
# Makes a dispatch verifiable instead of fire-and-forget:
#   1. re-resolves the live agent terminal handle for a worktree (never trusts
#      a cached handle),
#   2. creates the orchestration task and dispatches it with --inject,
#   3. polls dispatch-show until THAT dispatch (matched by id) has landed on a
#      pane (bounded wait, early bail on a terminal failure state),
#   4. retries the dispatch exactly once, with a freshly resolved handle, but
#      only when the first attempt verifiably did NOT land: a structured
#      terminal_handle_stale error, or a dispatch record in a terminal failure
#      state. An unconfirmed dispatch that may still land is never retried
#      (the CLI has no void/cancel verb, so re-dispatching could inject the
#      same task twice),
#   5. prints taskId/dispatchId on success; exits non-zero with a diagnostic
#      otherwise, so the coordinator never assumes a dispatch that didn't land.
#
# Usage:
#   scripts/dispatch-confirm.sh --worktree <selector> --spec <text> \
#     [--title <text>] [--timeout <seconds>]
#
#   --worktree   selector accepted by `orca terminal list --worktree`
#                (e.g. name:engineer, branch:eng/foo, path:/abs/path)
#   --spec       task spec text (becomes the worker's TASK block)
#   --title      optional concise task title
#   --timeout    max seconds to wait for the dispatch to land (default 60, min 1)
#
# Internal coordinator tooling only — not part of the app build.
set -euo pipefail

usage() {
  sed -n '2,28p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
  exit 2
}

WORKTREE=""
SPEC=""
TITLE=""
TIMEOUT=60

while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree) WORKTREE="${2:?--worktree needs a value}"; shift 2 ;;
    --spec)     SPEC="${2:?--spec needs a value}";         shift 2 ;;
    --title)    TITLE="${2:?--title needs a value}";       shift 2 ;;
    --timeout)  TIMEOUT="${2:?--timeout needs a value}";   shift 2 ;;
    -h|--help)  usage ;;
    *) echo "error: unknown argument '$1'" >&2; usage ;;
  esac
done

[[ -n "$WORKTREE" && -n "$SPEC" ]] || usage
if ! [[ "$TIMEOUT" =~ ^[0-9]+$ ]] || (( TIMEOUT < 1 )); then
  echo "error: --timeout must be an integer >= 1 (seconds)" >&2
  exit 2
fi
command -v orca >/dev/null 2>&1 || { echo "error: 'orca' not found on PATH" >&2; exit 1; }
command -v jq   >/dev/null 2>&1 || { echo "error: 'jq' is required" >&2; exit 1; }

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

# One dispatch-show probe for a specific dispatch id. dispatch-show is
# task-addressed and returns a single dispatch record, so the id match is what
# guarantees we are looking at OUR dispatch and not a superseded one.
# Sets PROBE_STATE to landed|failed|pending and LAST_STATUS to the raw status.
PROBE_STATE=""
LAST_STATUS=""
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

attempt=1
while :; do
  HANDLE="$(resolve_handle)"
  if [[ -z "$HANDLE" ]]; then
    echo "error: no live agent terminal found for worktree '$WORKTREE' ($TASK_ID left undispatched)" >&2
    exit 1
  fi
  echo "dispatching $TASK_ID to $HANDLE (attempt $attempt)"

  # stdout and stderr captured separately: staleness is detected only from the
  # structured error code on a failed exit, never by substring — a spec that
  # merely *mentions* terminal_handle_stale must not trip it.
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
      echo "taskId=$TASK_ID"
      echo "dispatchId=$DISPATCH_ID"
      exit 0
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
