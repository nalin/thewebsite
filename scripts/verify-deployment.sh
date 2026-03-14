#!/usr/bin/env bash
# verify-deployment.sh — Shell wrapper for post-deployment smoke tests.
# Usage: ./scripts/verify-deployment.sh [BASE_URL]
# Default BASE_URL: https://thewebsite.app

set -euo pipefail

BASE_URL="${1:-${SMOKE_TEST_URL:-https://thewebsite.app}}"

echo "Running deployment verification against: $BASE_URL"
node "$(dirname "$0")/smoke-test.js" "$BASE_URL"
