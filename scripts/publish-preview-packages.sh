#!/usr/bin/env bash

result=$(pnpx turbo run build --affected --dry-run=json 2>&1)

# turbo may emit warnings or other text before the JSON output. Extract the
# first JSON object/array found in the output so `jq` can parse it safely.
json=$(printf '%s\n' "$result" | awk '/^{/ {flag=1} flag {print}')

if [ -z "$json" ]; then
  echo "Error: no JSON output from turbo; aborting." >&2
  exit 1
fi

packages=$(echo "$json" | jq -r '.tasks[].directory' | grep '^packages/' | while read -r dir; do
  if [ "$(jq -r '.private' "$dir/package.json")" != "true" ]; then
    echo "./$dir"
  fi
done)

if [ -n "$packages" ]; then
  pnpx pkg-pr-new publish --pnpm $packages
fi
