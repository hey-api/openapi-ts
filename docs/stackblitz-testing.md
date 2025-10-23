# StackBlitz Sync Script Testing

This document describes how to test the StackBlitz sync functionality.

## Testing the Update Script

The `scripts/update-examples-npm-versions.sh` script can be tested in different ways:

### 1. Dry Run Test (No npm wait)

To test the script logic without waiting for npm, you can mock the npm version check:

```bash
# Create a test version of the script
cat scripts/update-examples-npm-versions.sh | \
  sed 's/get_npm_version "@hey-api\/openapi-ts" 30/echo "0.55.0"/' | \
  sed 's/get_npm_version "@hey-api\/nuxt" 5/echo "0.2.0"/' > /tmp/test-update.sh

# Run the test
chmod +x /tmp/test-update.sh
bash /tmp/test-update.sh

# Check the results
git diff examples/*/package.json

# Revert changes
git restore examples/*/package.json
```

### 2. Manual Execution

After a release, you can manually run the script to test it:

```bash
pnpm examples:update-npm-versions
```

This will wait for the latest version to be available on npm and update all examples.

### 3. Workflow Testing

The workflow can be tested by:

1. Creating a changeset for a minor version bump
2. Merging the release PR when created
3. Checking that the workflow:
   - Waits for npm package availability
   - Updates example package.json files
   - Commits changes back to main

## Verifying StackBlitz URLs

After the script runs, verify that StackBlitz URLs work:

1. Open any example URL: `https://stackblitz.com/github/hey-api/openapi-ts/tree/main/examples/openapi-ts-fetch`
2. Verify that StackBlitz loads the example correctly
3. Check that dependencies install without errors
4. Confirm the generated code works

## Common Issues

### Script fails to find package on npm

- The script retries for 5 minutes (30 attempts × 10 seconds)
- If it still fails, check npm status and package publish logs
- Verify NPM_TOKEN is valid in GitHub secrets

### Examples don't update after release

- Check workflow logs for the "Update examples for StackBlitz" step
- Verify `steps.changesets.outputs.published == 'true'`
- Check git logs to see if commit was made

### StackBlitz fails to load example

- Verify the example's package.json has correct npm versions (not workspace:\*)
- Check that all dependencies are available on npm
- Ensure the example has all required files (index.html, vite.config.ts, etc.)

## Manual Rollback

If something goes wrong, you can manually revert the examples:

```bash
# Find the commit before the update
git log --oneline examples/ | head -5

# Revert to previous state
git checkout <commit-hash> -- examples/

# Commit the rollback
git add examples/
git commit -m "Revert examples to workspace dependencies"
git push
```
