#!/usr/bin/env bash

PACKAGE_NAME="${1:?Usage: $0 <package-dir-name> <mirror-dir>}"
MIRROR_DIR="${2:?Usage: $0 <package-dir-name> <mirror-dir>}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PACKAGE_DIR="$REPO_ROOT/packages/$PACKAGE_NAME"

if [ ! -d "$PACKAGE_DIR" ]; then
  echo "Error: package directory not found: $PACKAGE_DIR" >&2
  exit 1
fi

if [ ! -d "$MIRROR_DIR/.git" ]; then
  echo "Error: mirror directory is not a git repo: $MIRROR_DIR" >&2
  exit 1
fi

NPM_NAME=$(jq -r '.name' "$PACKAGE_DIR/package.json" 2>/dev/null || echo "@hey-api/$PACKAGE_NAME")

find "$MIRROR_DIR" -mindepth 1 -maxdepth 1 \
  -not -name '.git' \
  -exec rm -rf {} +

cp -a "$PACKAGE_DIR/." "$MIRROR_DIR/"

if [ -f "$MIRROR_DIR/README.md" ]; then
  {
    printf '> [!NOTE]\n'
    printf '> Read-only mirror of [`%s`](https://npmjs.com/package/%s)' "$NPM_NAME" "$NPM_NAME"
    printf ' from the [hey-api](https://github.com/hey-api/hey-api) monorepo.'
    printf ' Issues, pull requests, and contributions go to the'
    printf ' [main repository](https://github.com/hey-api/hey-api).\n\n'
    cat "$MIRROR_DIR/README.md"
  } > "$MIRROR_DIR/README.tmp"
  mv "$MIRROR_DIR/README.tmp" "$MIRROR_DIR/README.md"
fi

mkdir -p "$MIRROR_DIR/.github"
cp "$REPO_ROOT/.github/FUNDING.yml" "$MIRROR_DIR/.github/FUNDING.yml" 2>/dev/null || true

echo "✓ Synced packages/$PACKAGE_NAME → $MIRROR_DIR ($NPM_NAME)"
