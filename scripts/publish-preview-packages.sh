#!/bin/bash

result=$(pnpx turbo run build --affected --dry-run=json)

packages=$(echo "$result" | jq -r '.tasks[].directory' | grep '^packages/' | sed 's|^|./|')

if [ -n "$packages" ]; then
  pnpx pkg-pr-new publish --pnpm $packages
fi
