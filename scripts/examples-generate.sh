#!/usr/bin/env bash

# Generate client code for all examples that have openapi-ts script
# This script is used to ensure examples are up-to-date with the latest code

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "Generating client code for all examples..."

# Find all examples with openapi-ts script and generate code
for dir in "$ROOT_DIR"/examples/*/; do
  example_name=$(basename "$dir")
  package_json="$dir/package.json"
  
  # Skip if package.json doesn't exist
  if [ ! -f "$package_json" ]; then
    continue
  fi
  
  # Check if the example has openapi-ts script
  if grep -q "\"openapi-ts\":" "$package_json"; then
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Generating: $example_name"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    # Run openapi-ts for this example
    (cd "$dir" && pnpm openapi-ts)
    
    echo "✅ Completed: $example_name"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ All examples generated successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
