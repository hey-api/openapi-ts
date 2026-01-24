#!/usr/bin/env bash

# Update examples to use published npm versions instead of workspace references
# This script is used during release to prepare examples for StackBlitz

set -e

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

# Function to get the latest published version of a package
get_npm_version() {
  local package_name="$1"
  local max_attempts="${2:-30}"
  local attempt=1
  
  echo "Checking npm for ${package_name}..." >&2
  
  while [ "$attempt" -le "$max_attempts" ]; do
    # Try to get the latest version from npm
    version=$(npm view "${package_name}" version 2>/dev/null || echo "")
    
    if [ -n "$version" ]; then
      echo "$version"
      return 0
    fi
    
    echo "Attempt ${attempt}/${max_attempts}: Package not yet available on npm. Waiting 10 seconds..." >&2
    sleep 10
    attempt=$((attempt + 1))
  done
  
  echo "ERROR: Package ${package_name} not found on npm after ${max_attempts} attempts" >&2
  return 1
}

# Function to update package.json workspace references to npm versions
update_package_json() {
  local package_json="$1"
  local package_name="$2"
  local version="$3"
  
  # Use Node.js to update the package.json safely
  node -e "
    const fs = require('fs');
    const packageJson = JSON.parse(fs.readFileSync('${package_json}', 'utf8'));
    
    // Update dependencies
    if (packageJson.dependencies && packageJson.dependencies['${package_name}']) {
      if (packageJson.dependencies['${package_name}'].startsWith('workspace:')) {
        packageJson.dependencies['${package_name}'] = '^${version}';
      }
    }
    
    // Update devDependencies
    if (packageJson.devDependencies && packageJson.devDependencies['${package_name}']) {
      if (packageJson.devDependencies['${package_name}'].startsWith('workspace:')) {
        packageJson.devDependencies['${package_name}'] = '^${version}';
      }
    }
    
    fs.writeFileSync('${package_json}', JSON.stringify(packageJson, null, 2) + '\n');
  "
}

# Main script
main() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Updating examples to use published npm versions"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  
  # Get the versions of @hey-api packages from npm (wait for them to be published)
  echo "⏳ Waiting for @hey-api/openapi-ts to be available on npm..."
  OPENAPI_TS_VERSION=$(get_npm_version "@hey-api/openapi-ts" 30)
  
  if [ -z "$OPENAPI_TS_VERSION" ]; then
    echo "❌ Failed to get @hey-api/openapi-ts version from npm"
    exit 1
  fi
  
  echo "✅ Found @hey-api/openapi-ts@${OPENAPI_TS_VERSION} on npm"
  
  # Also check for @hey-api/nuxt (used by nuxt example)
  echo "⏳ Checking for @hey-api/nuxt..."
  NUXT_VERSION=$(get_npm_version "@hey-api/nuxt" 5)
  
  if [ -n "$NUXT_VERSION" ]; then
    echo "✅ Found @hey-api/nuxt@${NUXT_VERSION} on npm"
  else
    echo "⚠️  @hey-api/nuxt not found on npm (may not be published yet)"
  fi
  
  echo ""
  
  # Update all examples (except openapi-ts-sample)
  updated_count=0
  for dir in "$ROOT_DIR"/examples/*/; do
    example_name=$(basename "$dir")
    
    # Skip openapi-ts-sample
    if [ "$example_name" = "openapi-ts-sample" ]; then
      echo "⏭️  Skipping ${example_name}"
      continue
    fi
    
    package_json="$dir/package.json"
    if [ ! -f "$package_json" ]; then
      continue
    fi
    
    # Check if this example uses @hey-api packages
    needs_update=false
    
    if grep -q "\"@hey-api/openapi-ts\".*workspace:" "$package_json"; then
      needs_update=true
    fi
    
    if [ -n "$NUXT_VERSION" ] && grep -q "\"@hey-api/nuxt\".*workspace:" "$package_json"; then
      needs_update=true
    fi
    
    if [ "$needs_update" = true ]; then
      echo "📝 Updating ${example_name}"
      
      # Update @hey-api/openapi-ts
      if grep -q "\"@hey-api/openapi-ts\".*workspace:" "$package_json"; then
        update_package_json "$package_json" "@hey-api/openapi-ts" "$OPENAPI_TS_VERSION"
      fi
      
      # Update @hey-api/nuxt if available
      if [ -n "$NUXT_VERSION" ] && grep -q "\"@hey-api/nuxt\".*workspace:" "$package_json"; then
        update_package_json "$package_json" "@hey-api/nuxt" "$NUXT_VERSION"
      fi
      
      updated_count=$((updated_count + 1))
    fi
  done
  
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "✨ Updated ${updated_count} examples to use npm versions"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

main "$@"
