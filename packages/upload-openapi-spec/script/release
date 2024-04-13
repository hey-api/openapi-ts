#!/bin/bash

# About:
#
# This is a helper script to tag and push a new release. GitHub Actions use
# release tags to allow users to select a specific version of the action to use.
#
# See: https://github.com/actions/typescript-action#publishing-a-new-release
#
# This script will do the following:
#
# 1. Get the latest release tag
# 2. Prompt the user for a new release tag
# 3. Tag the new release
# 4. Push the new tag to the remote
#
# Usage:
#
# script/release

# Terminal colors
OFF='\033[0m'
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'

# Get the latest release tag
latest_tag=$(git describe --tags "$(git rev-list --tags --max-count=1)")

if [[ -z "$latest_tag" ]]; then
	# There are no existing release tags
	echo -e "No tags found (yet) - Continue to create and push your first tag"
	latest_tag="[unknown]"
fi

# Display the latest release tag
echo -e "The latest release tag is: ${BLUE}${latest_tag}${OFF}"

# Prompt the user for the new release tag
read -r -p 'Enter a new release tag (vX.X.X format): ' new_tag

# Validate the new release tag
tag_regex='v[0-9]+\.[0-9]+\.[0-9]+$'
if echo "$new_tag" | grep -q -E "$tag_regex"; then
	echo -e "Tag: ${BLUE}$new_tag${OFF} is valid"
else
	# Release tag is not `vX.X.X` format
	echo -e "Tag: ${BLUE}$new_tag${OFF} is ${RED}not valid${OFF} (must be in vX.X.X format)"
	exit 1
fi

# Tag the new release
git tag -a "$new_tag" -m "$new_tag Release"
echo -e "${GREEN}Tagged: $new_tag${OFF}"

# Push the new tag to the remote
git push --tags
echo -e "${GREEN}Release tag pushed to remote${OFF}"
echo -e "${GREEN}Done!${OFF}"
