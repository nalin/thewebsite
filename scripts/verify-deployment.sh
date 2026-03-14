#!/usr/bin/env bash
# Automated deployment verification script
# Waits for Vercel deployment to complete, then runs smoke tests

set -euo pipefail

VERCEL_TOKEN="${VERCEL_TOKEN:-}"
VERCEL_PROJECT="${VERCEL_PROJECT:-thewebsite}"
VERCEL_TEAM_SLUG="${VERCEL_TEAM_SLUG:-}"
SITE_URL="${SITE_URL:-https://thewebsite.vercel.app}"

WAIT_SECONDS=180   # 3 minutes
POLL_INTERVAL=15   # poll every 15s
MAX_RETRIES=$((WAIT_SECONDS / POLL_INTERVAL))

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${NC}[$(date -u +%H:%M:%S)] $*"; }
ok()   { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
fail() { echo -e "${RED}[FAIL]${NC} $*"; exit 1; }

# ---------------------------------------------------------------------------
# 1. Wait for latest Vercel deployment to reach READY state
# ---------------------------------------------------------------------------
wait_for_deployment() {
  if [[ -z "$VERCEL_TOKEN" ]]; then
    warn "VERCEL_TOKEN not set — skipping Vercel API check"
    return 0
  fi

  log "Waiting up to ${WAIT_SECONDS}s for Vercel deployment to become READY..."

  local api_base="https://api.vercel.com"
  local query="projectSlug=${VERCEL_PROJECT}&limit=1&state=BUILDING,INITIALIZING,QUEUED,READY,ERROR,CANCELED"
  if [[ -n "$VERCEL_TEAM_SLUG" ]]; then
    query="${query}&teamSlug=${VERCEL_TEAM_SLUG}"
  fi

  for ((i=1; i<=MAX_RETRIES; i++)); do
    local response
    response=$(curl -sf \
      -H "Authorization: Bearer ${VERCEL_TOKEN}" \
      "${api_base}/v6/deployments?${query}" 2>/dev/null) || {
      warn "Vercel API request failed (attempt ${i}/${MAX_RETRIES})"
      sleep "$POLL_INTERVAL"
      continue
    }

    local state
    state=$(echo "$response" | grep -o '"readyState":"[^"]*"' | head -1 | cut -d'"' -f4 2>/dev/null || true)

    log "Deployment state: ${state:-unknown} (attempt ${i}/${MAX_RETRIES})"

    case "$state" in
      READY)
        ok "Deployment is READY"
        return 0
        ;;
      ERROR|CANCELED)
        fail "Deployment ended in state: ${state}"
        ;;
      *)
        sleep "$POLL_INTERVAL"
        ;;
    esac
  done

  fail "Timed out after ${WAIT_SECONDS}s waiting for deployment to become READY"
}

# ---------------------------------------------------------------------------
# 2. Smoke tests — HTTP checks against the live site
# ---------------------------------------------------------------------------
smoke_test() {
  local url="$1"
  local expected_status="${2:-200}"
  local description="${3:-$url}"

  local actual_status
  actual_status=$(curl -so /dev/null -w "%{http_code}" --max-time 30 "$url" 2>/dev/null || echo "000")

  if [[ "$actual_status" == "$expected_status" ]]; then
    ok "HTTP ${actual_status} — ${description}"
    return 0
  else
    fail "Expected HTTP ${expected_status}, got ${actual_status} — ${description}"
  fi
}

run_smoke_tests() {
  log "Running smoke tests against ${SITE_URL} ..."

  smoke_test "${SITE_URL}/"                      200 "Homepage"
  smoke_test "${SITE_URL}/api/requests"          200 "Requests API"

  ok "All smoke tests passed"
}

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------
main() {
  log "=== Deployment Verification ==="
  log "Project : ${VERCEL_PROJECT}"
  log "Site URL: ${SITE_URL}"

  wait_for_deployment
  run_smoke_tests

  log "=== Verification complete ==="
}

main "$@"
