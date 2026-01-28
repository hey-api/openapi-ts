#!/usr/bin/env bash

result=$(pnpm turbo run build --affected --dry-run=json 2>&1)

json=$(printf '%s\n' "$result" | awk '/^{/ {flag=1} flag {print}')

if [ -z "$json" ]; then
  echo "Error: no JSON output from turbo; aborting." >&2
  echo "Raw result was:"
  echo "$result"
  exit 1
fi

echo "Affected tasks:"
echo "$json" | jq -r '.tasks[].directory'

packages=$(echo "$json" | jq -r '.tasks[].directory' | grep '^packages/' | while read -r dir; do
  if [ "$(jq -r '.private' "$dir/package.json")" != "true" ]; then
    echo "./$dir"
  fi
done)

echo "Packages to publish:"
echo "$packages"

if [ -n "$packages" ]; then
  pnpx pkg-pr-new publish --pnpm $packages
else
  echo "No packages to publish"
fi
