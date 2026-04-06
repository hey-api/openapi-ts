---
title: Developing
description: Learn how to contribute to Hey API.
---

# Developing

::: warning
This page is under construction. We appreciate your patience.
:::

## Working with Examples

The `examples` folder contains various integration examples that demonstrate how to use `@hey-api/openapi-ts` with different frameworks and libraries. These examples are kept in sync with the codebase through automated checks.

### Generating Example Code

When you make changes to the core packages that affect code generation, you need to regenerate the client code in all examples:

```bash
pnpm examples:generate
```

This command will:

- Find all examples with an `openapi-ts` script
- Run the OpenAPI code generator for each example
- Update the generated client code in each example

### Checking Example Code

Before committing changes, ensure that all generated example code is up-to-date:

```bash
pnpm examples:check
```

This command will:

- Regenerate all example code
- Check if any files were modified
- Exit with an error if generated code is out of sync

This check is also run automatically in CI to ensure examples stay in sync with the main codebase.

### Example Workflow

1. Make changes to core packages
2. Build the packages: `pnpm build --filter="@hey-api/**"`
3. Regenerate examples: `pnpm examples:generate`
4. Commit all changes including the updated generated code
5. The CI will verify that examples are in sync

::: tip
Think of generated example code as snapshot tests - they should always reflect the current state of the code generator.
:::

## Writing Changelogs

We use [Changesets](https://github.com/changesets/changesets) to manage releases and generate changelogs. When contributing changes, create a changeset to document your updates.

### Creating a Changeset

Run the following command to create a new changeset:

```bash
pnpm changeset
```

This will prompt you to:

1. Select the packages that were changed
2. Choose the semver bump type (major, minor, or patch)
3. Write a summary of your changes

### Changeset Format

Changesets use the following format:

```markdown
---
'@hey-api/openapi-ts': patch
---

**scope**: description of changes
```

**Scopes:**

- `cli`, `parser`, `output`, `config`, `input`, `internal`, `build`, `error` → Core section
- `plugin(name)` → Plugins section (e.g., `**plugin(zod)**:`, `**plugin(@hey-api/client-axios)**:`)
- Any other scope → Other section

**Breaking Changes:**

- Use `**BREAKING**:` prefix in the description to mark breaking changes
- For packages on v0.x (major version 0), minor bumps may include breaking changes. Use signal words like "removed", "renamed", or "changed signature" to indicate breaking changes.

### Examples

```markdown
# Bug fix

---

## "@hey-api/openapi-ts": patch

**parser**: fix explicit discriminator mapping
```

```markdown
# New feature

---

## "@hey-api/openapi-ts": minor

**plugin(zod)**: handle guid string format
```

```markdown
# Breaking change

---

## "@hey-api/openapi-ts": minor

**BREAKING**: removed deprecated `getClient()` function
```

```markdown
# Plugin change

---

## "@hey-api/openapi-ts": patch

**plugin(@hey-api/client-fetch)**: improve error handling
```
