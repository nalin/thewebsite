#!/bin/bash
# Deployment verification script for thewebsite
# Waits for Vercel deployment, checks status, runs smoke tests

set -euo pipefail

VERCEL_TOKEN="${VERCEL_TOKEN:-}"
VERCEL_PROJECT="${VERCEL_PROJECT:-thewebsite}"
PRODUCTION_URL="${PRODUCTION_URL:-https://thewebsite.app}"
MAX_WAIT_SECONDS=180  # 3 minutes
POLL_INTERVAL=10

if [[ -z "$VERCEL_TOKEN" ]]; then
  echo "ERROR: VERCEL_TOKEN is required"
  exit 1
fi

echo "=== Deployment Verification ==="
echo "Project: $VERCEL_PROJECT"
echo "URL: $PRODUCTION_URL"
echo ""

# ── Step 1: Wait for Vercel deployment to reach READY state ────────────────
echo "Waiting up to ${MAX_WAIT_SECONDS}s for Vercel deployment..."

ELAPSED=0
DEPLOYMENT_STATE=""

while [[ $ELAPSED -lt $MAX_WAIT_SECONDS ]]; do
  RESPONSE=$(curl -sf \
    -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v6/deployments?projectId=${VERCEL_PROJECT}&limit=1&target=production" \
    2>/dev/null || echo '{}')

  DEPLOYMENT_STATE=$(echo "$RESPONSE" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    deployments = data.get('deployments', [])
    if deployments:
        print(deployments[0].get('state', 'UNKNOWN'))
    else:
        print('NONE')
except Exception:
    print('ERROR')
" 2>/dev/null || echo "ERROR")

  echo "  [${ELAPSED}s] Deployment state: $DEPLOYMENT_STATE"

  if [[ "$DEPLOYMENT_STATE" == "READY" ]]; then
    echo "Deployment is READY."
    break
  elif [[ "$DEPLOYMENT_STATE" == "ERROR" || "$DEPLOYMENT_STATE" == "CANCELED" ]]; then
    echo "ERROR: Deployment failed with state: $DEPLOYMENT_STATE"
    exit 1
  fi

  sleep $POLL_INTERVAL
  ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

if [[ "$DEPLOYMENT_STATE" != "READY" ]]; then
  echo "ERROR: Deployment did not reach READY state within ${MAX_WAIT_SECONDS}s (last state: $DEPLOYMENT_STATE)"
  exit 1
fi

# ── Step 2: Smoke tests on critical pages ──────────────────────────────────
echo ""
echo "Running smoke tests on critical pages..."

CRITICAL_PATHS=(
  "/"
  "/r"
  "/pricing"
  "/blog"
  "/api/requests"
)

FAILED=0

for PATH in "${CRITICAL_PATHS[@]}"; do
  URL="${PRODUCTION_URL}${PATH}"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$URL" || echo "000")

  if [[ "$HTTP_CODE" =~ ^[23] ]]; then
    echo "  PASS  $URL ($HTTP_CODE)"
  else
    echo "  FAIL  $URL ($HTTP_CODE)"
    FAILED=$((FAILED + 1))
  fi
done

echo ""
if [[ $FAILED -gt 0 ]]; then
  echo "ERROR: $FAILED smoke test(s) failed"
  exit 1
fi

echo "All smoke tests passed. Deployment verified successfully."
exit 0
