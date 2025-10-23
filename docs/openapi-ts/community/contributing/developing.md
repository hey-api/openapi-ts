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
