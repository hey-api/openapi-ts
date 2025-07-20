#!/usr/bin/env bash

REPO="hey-api/openapi-ts"
PER_PAGE=100
PAGE=1
USERS=()

TMP_LOGINS="tmp_logins.txt"
TMP_USERS="tmp_users.txt"

CACHE_DIR=".cache/github-users"
mkdir -p "$CACHE_DIR"

AUTH_HEADER=()
if [[ -n "${GITHUB_TOKEN:-}" ]]; then
  AUTH_HEADER=(-H "Authorization: token $GITHUB_TOKEN")
fi

EXCLUDED_FILE="./docs/.contributorsignore"
SINCE_FILE="./docs/.contributorssince"

# disabled for now, we'd need to append to the list instead of write
# if [[ -f "$SINCE_FILE" ]]; then
#   SINCE=$(cat "$SINCE_FILE")
# else
#   SINCE="2024-01-27T00:00:00Z"
# fi
SINCE="2024-01-27T00:00:00Z"

MAX_COMMIT_EPOCH=0

> "$TMP_USERS"

while :; do
  TMP_JSON=$(mktemp)
  HTTP_STATUS=$(curl -s -w "%{http_code}" -o "$TMP_JSON" \
    "${AUTH_HEADER[@]}" \
    "https://api.github.com/repos/$REPO/commits?sha=main&since=$SINCE&per_page=$PER_PAGE&page=$PAGE")

  if [ "$HTTP_STATUS" != "200" ]; then
    echo "GitHub API error: $HTTP_STATUS"
    cat "$TMP_JSON"
    rm "$TMP_JSON"
    break
  fi

  if ! jq empty "$TMP_JSON" >/dev/null 2>&1; then
    echo "Invalid JSON, stopping."
    cat "$TMP_JSON" > debug_response.json
    rm "$TMP_JSON"
    break
  fi

  COUNT=$(jq 'length' "$TMP_JSON")
  if [ "$COUNT" -eq 0 ]; then
    rm "$TMP_JSON"
    break
  fi

  # Track max commit date epoch for the whole run
  LATEST_COMMIT_DATE=$(jq -r '.[].commit.committer.date' "$TMP_JSON" | sort -r | head -n1)
  if [[ -n "$LATEST_COMMIT_DATE" ]]; then
    EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$LATEST_COMMIT_DATE" "+%s")
    if [ "$EPOCH" -gt "$MAX_COMMIT_EPOCH" ]; then
      MAX_COMMIT_EPOCH=$EPOCH
    fi
  fi

  jq -r '.[].author | select(.login != null) | .login' "$TMP_JSON" | sort -u > "$TMP_LOGINS"

  while read -r login; do
    if ! grep -Fxq "$login" "$EXCLUDED_FILE"; then
      if ! printf '%s\n' "${USERS[@]}" | grep -qx "$login"; then
        USERS+=("$login")

        CACHE_FILE="$CACHE_DIR/$login.json"
        if [ -f "$CACHE_FILE" ]; then
          USER_JSON=$(<"$CACHE_FILE")
        else
          echo "Fetching user $login"
          USER_JSON=$(curl -s "${AUTH_HEADER[@]}" "https://api.github.com/users/$login")
          echo "$USER_JSON" > "$CACHE_FILE"
        fi

        SANITIZED_JSON=$(echo "$USER_JSON" | tr -d '\000-\037')
        NAME=$(jq -r '.name // empty' <<< "$SANITIZED_JSON")
        echo "$login|$NAME" >> "$TMP_USERS"
      fi
    fi
  done < "$TMP_LOGINS"

  rm "$TMP_JSON" "$TMP_LOGINS"
  PAGE=$((PAGE + 1))
done

# Update SINCE_FILE once after all pages
if [ "$MAX_COMMIT_EPOCH" -gt 0 ]; then
  BUFFER_DAYS=90
  BUFFER_SECONDS=$((BUFFER_DAYS * 86400))
  BUFFERED_EPOCH=$((MAX_COMMIT_EPOCH - BUFFER_SECONDS))
  BUFFERED_DATE=$(date -u -r "$BUFFERED_EPOCH" "+%Y-%m-%dT%H:%M:%SZ")
  echo "$BUFFERED_DATE" > "$SINCE_FILE"
  echo "Updated SINCE to $BUFFERED_DATE"
fi

NAMES_SORTED=$(awk -F'|' '$2 != ""' "$TMP_USERS" | sort -t'|' -k2,2)
NO_NAMES_SORTED=$(awk -F'|' '$2 == ""' "$TMP_USERS" | sort -t'|' -k1,1)

{
  echo "$NAMES_SORTED"
  echo "$NO_NAMES_SORTED"
} | while IFS='|' read -r login name; do
  if [ -n "$name" ]; then
    echo "- [$name](https://github.com/$login)"
  else
    echo "- [$login](https://github.com/$login)"
  fi
done > ./docs/partials/contributors-list.md

if [[ -f "$TMP_USERS" ]]; then
  rm "$TMP_USERS"
fi

echo "Done. Total contributors: ${#USERS[@]}"
