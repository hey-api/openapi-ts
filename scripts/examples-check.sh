#!/usr/bin/env bash

# Check if generated client code for all examples is up-to-date
# This script is used in CI to ensure examples are kept in sync with the codebase

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Checking if generated code is up-to-date..."

# Generate fresh code
"$SCRIPT_DIR/examples-generate.sh"

# Check if there are any changes
if ! git diff --quiet; then
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "❌ ERROR: Generated code is out of sync!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "The following files have changed:"
  git diff --name-only
  echo ""
  echo "To fix this, run:"
  echo "  pnpm examples:generate"
  echo ""
  echo "Then commit the changes."
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All generated code is up-to-date!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
