#!/usr/bin/env bash
set -euo pipefail

# Deployment verification script
# Usage: ./scripts/verify-deployment.sh [URL]
# Defaults to https://thewebsite.app if no URL provided

BASE_URL="${1:-https://thewebsite.app}"
PASS=0
FAIL=0
ERRORS=()

check() {
  local label="$1"
  local url="$2"
  local expected_status="${3:-200}"

  actual_status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$url" || echo "000")

  if [ "$actual_status" = "$expected_status" ]; then
    echo "  [PASS] $label ($url) -> $actual_status"
    PASS=$((PASS + 1))
  else
    echo "  [FAIL] $label ($url) -> expected $expected_status, got $actual_status"
    FAIL=$((FAIL + 1))
    ERRORS+=("$label: expected HTTP $expected_status, got $actual_status")
  fi
}

echo ""
echo "Verifying deployment at: $BASE_URL"
echo "========================================"

# Core pages
check "Homepage"         "$BASE_URL/"
check "Requests page"    "$BASE_URL/requests"

# API endpoints
check "Requests API"     "$BASE_URL/api/requests"

# Static assets / health
check "Favicon"          "$BASE_URL/favicon.ico"

echo ""
echo "========================================"
echo "Results: $PASS passed, $FAIL failed"

if [ ${#ERRORS[@]} -gt 0 ]; then
  echo ""
  echo "Failures:"
  for err in "${ERRORS[@]}"; do
    echo "  - $err"
  done
  echo ""
  echo "DEPLOYMENT VERIFICATION FAILED"
  exit 1
fi

echo ""
echo "DEPLOYMENT VERIFICATION PASSED"
exit 0
