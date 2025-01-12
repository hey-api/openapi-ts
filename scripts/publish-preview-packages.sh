#!/bin/bash

if [ -z "$1" ]; then
  echo "Error: Base branch not specified. Usage: publish-previews.sh <base-branch>"
  exit 1
fi

BASE_BRANCH=$1

# ensure we have the latest changes from the remote
git fetch origin

if ! git show-ref --verify --quiet refs/remotes/origin/"$BASE_BRANCH"; then
  echo "Error: Base branch '$BASE_BRANCH' not found in the remote repository."
  exit 1
fi

echo "Detecting changed packages compared to $BASE_BRANCH..."
CHANGED_PACKAGES=$(git diff --name-only origin/"$BASE_BRANCH"...HEAD | grep '^packages/' | cut -d '/' -f 2 | sort -u)

if [ -z "$CHANGED_PACKAGES" ]; then
  echo "No changed packages detected."
  exit 0
fi

PACKAGE_PATHS=$(echo "$CHANGED_PACKAGES" | awk '{printf "./packages/%s ", $1}' | sed 's/ $//')

echo "Publishing changed packages: $PACKAGE_PATHS"
pnpx pkg-pr-new publish --pnpm $PACKAGE_PATHS
