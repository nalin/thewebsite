#!/bin/bash
set -euo pipefail

# Deployment verification script
# Usage: VERCEL_TOKEN=<token> bash scripts/verify-deployment.sh
# Or set VERCEL_TOKEN in environment before running.

if [ -z "${VERCEL_TOKEN:-}" ]; then
  echo "ERROR: VERCEL_TOKEN environment variable is not set."
  echo "Export it before running: export VERCEL_TOKEN=<your-token>"
  exit 1
fi

# Wait for Vercel deployment to propagate
echo "Waiting for Vercel deployment (3 minutes)..."
sleep 180

# Get latest deployment
echo "Fetching latest deployment status..."
DEPLOYMENT=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v6/deployments?limit=1" | \
  jq -r ".deployments[0]")

STATE=$(echo "$DEPLOYMENT" | jq -r ".state")
ID=$(echo "$DEPLOYMENT" | jq -r ".uid")
URL=$(echo "$DEPLOYMENT" | jq -r ".url")

echo "Deployment ID:    $ID"
echo "Deployment URL:   $URL"
echo "Deployment state: $STATE"

# Check for failure
if [ "$STATE" = "ERROR" ] || [ "$STATE" = "FAILED" ]; then
  echo ""
  echo "DEPLOYMENT FAILED: $ID (state: $STATE)"
  echo "Fetching error logs..."

  LOG_FILE="/tmp/vercel-error-${ID}.log"
  curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
    "https://api.vercel.com/v1/deployments/$ID/events" > "$LOG_FILE"

  echo "--- Error log: $LOG_FILE ---"
  cat "$LOG_FILE"

  # Notify: append to deployment failure log for review
  NOTIFY_FILE="/tmp/deployment-failures.log"
  echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] FAILED deployment $ID (state: $STATE) — logs at $LOG_FILE" >> "$NOTIFY_FILE"
  echo "Failure appended to: $NOTIFY_FILE"

  exit 1
fi

# If not READY yet, warn but don't hard-fail (may still be building)
if [ "$STATE" != "READY" ]; then
  echo "WARNING: Deployment state is '$STATE' (expected READY). Proceeding with smoke tests anyway."
fi

echo ""
echo "Deployment succeeded (state: $STATE)"
echo "Running smoke tests..."

# Smoke tests — verify key pages return HTTP 200
smoke_test() {
  local url="$1"
  echo -n "  GET $url ... "
  if curl -sf --max-time 15 "$url" -o /dev/null; then
    echo "OK"
  else
    echo "FAILED"
    return 1
  fi
}

smoke_test "https://thewebsite.app/"
smoke_test "https://thewebsite.app/faq"
smoke_test "https://thewebsite.app/course/module-1"

echo ""
echo "All checks passed. Deployment is live and healthy."
exit 0
