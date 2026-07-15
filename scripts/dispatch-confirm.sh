#!/usr/bin/env bash
# dispatch-confirm.sh — coordinator-side Orca dispatch with confirmation (#127).
#
# Makes a dispatch verifiable instead of fire-and-forget:
#   1. re-resolves the live agent terminal handle for a worktree (never trusts
#      a cached handle),
#   2. creates the orchestration task and dispatches it with --inject,
#   3. polls dispatch-show until the dispatch shows as landed (bounded wait),
#   4. on a stale terminal handle (or a dispatch that never lands), re-resolves
#      the handle and retries the dispatch exactly once,
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
#   --timeout    max seconds to wait for the dispatch to land (default 60)
#
# Internal coordinator tooling only — not part of the app build.
set -euo pipefail

usage() {
  sed -n '2,22p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' >&2
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
[[ "$TIMEOUT" =~ ^[0-9]+$ ]] || { echo "error: --timeout must be an integer (seconds)" >&2; exit 2; }
command -v orca >/dev/null 2>&1 || { echo "error: 'orca' not found on PATH" >&2; exit 1; }
command -v jq   >/dev/null 2>&1 || { echo "error: 'jq' is required" >&2; exit 1; }

# Pick the live agent terminal for the worktree: connected + writable panes,
# preferring titled ones (Orca's agent status hooks title agent panes; bare
# shells have title null), most recent output first.
resolve_handle() {
  orca terminal list --worktree "$WORKTREE" --json | jq -r '
    [.result.terminals[]? | select(.connected and .writable)] as $live
    | (if ($live | map(select(.title != null and .title != "")) | length) > 0
       then $live | map(select(.title != null and .title != ""))
       else $live
       end)
    | sort_by(.lastOutputAt // 0) | reverse
    | (first // {}) | .handle // empty'
}

# Poll dispatch-show until the dispatch has landed on a pane. Sets DISPATCH_ID
# and LAST_STATUS as it goes; returns 1 if the deadline passes first.
DISPATCH_ID=""
LAST_STATUS=""
confirm_landed() {
  local deadline=$(( SECONDS + TIMEOUT ))
  local out status pane
  while (( SECONDS < deadline )); do
    out="$(orca orchestration dispatch-show --task "$TASK_ID" --json 2>/dev/null || true)"
    status="$(jq -r '.result.dispatch.status // empty' <<<"$out" 2>/dev/null || true)"
    pane="$(jq -r '.result.dispatch.assignee_pane_key // empty' <<<"$out" 2>/dev/null || true)"
    DISPATCH_ID="$(jq -r '.result.dispatch.id // empty' <<<"$out" 2>/dev/null || true)"
    LAST_STATUS="$status"
    # Landed: the dispatch exists, is (or was) running, and a pane accepted it.
    if [[ -n "$pane" ]] && [[ "$status" == "dispatched" || "$status" == "completed" ]]; then
      return 0
    fi
    sleep 2
  done
  return 1
}

# 1) Create the task once; both dispatch attempts reuse it.
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

# 2) Dispatch, confirm, and retry exactly once on a stale handle / no-show.
attempt=1
while :; do
  HANDLE="$(resolve_handle)"
  if [[ -z "$HANDLE" ]]; then
    echo "error: no live agent terminal found for worktree '$WORKTREE' ($TASK_ID left undispatched)" >&2
    exit 1
  fi
  echo "dispatching $TASK_ID to $HANDLE (attempt $attempt)"

  dispatch_out=""
  dispatch_rc=0
  dispatch_out="$(orca orchestration dispatch --task "$TASK_ID" --to "$HANDLE" --inject --json 2>&1)" || dispatch_rc=$?

  stale=0
  if grep -q 'terminal_handle_stale' <<<"$dispatch_out"; then
    stale=1
  fi

  if (( dispatch_rc == 0 )) && (( stale == 0 )); then
    if confirm_landed; then
      echo "confirmed: dispatch landed (status=$LAST_STATUS)"
      echo "taskId=$TASK_ID"
      echo "dispatchId=$DISPATCH_ID"
      exit 0
    fi
    # Dispatch command succeeded but never showed up live — treat like a stale
    # target and allow the single retry.
    echo "warn: dispatch not confirmed within ${TIMEOUT}s (last status: '${LAST_STATUS:-none}')" >&2
    stale=1
  fi

  if (( stale == 1 )) && (( attempt == 1 )); then
    echo "warn: retrying once with a re-resolved handle" >&2
    attempt=2
    continue
  fi

  echo "error: dispatch of $TASK_ID failed (attempt $attempt, exit $dispatch_rc):" >&2
  echo "$dispatch_out" >&2
  exit 1
done
