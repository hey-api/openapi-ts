#!/bin/bash

result=$(pnpx turbo run build --affected --dry-run=json)

packages=$(echo "$result" | jq -r '.tasks[].directory' | grep '^packages/' | while read -r dir; do
  if [ "$(jq -r '.private' "$dir/package.json")" != "true" ]; then
    echo "./$dir"
  fi
done)

if [ -n "$packages" ]; then
  pnpx pkg-pr-new publish --pnpm $packages
fi
