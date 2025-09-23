---
title: Building
description: Learn how to contribute to Hey API.
---

# Building

::: warning
This page is under construction. We appreciate your patience.
:::

## Prerequisites

You should have a working knowledge of [git](https://git-scm.com), [node](https://nodejs.org/en), and [pnpm](https://pnpm.io).

## Guidelines

Your [pull request](https://help.github.com/articles/using-pull-requests) must:

- address a single issue or add a single item of functionality
- contain a clean history of small, incremental, logically separate commits, with no merge commits
- use [Conventional Commits](https://www.conventionalcommits.org/) format for commit messages
- be possible to merge automatically

## Commit Message Format

This project uses [Conventional Commits](https://www.conventionalcommits.org/) to standardize commit messages. The format is:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation only changes
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **perf**: A code change that improves performance
- **test**: Adding missing tests or correcting existing tests
- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to CI configuration files and scripts
- **chore**: Maintenance tasks, tooling, housekeeping
- **revert**: Reverts a previous commit

### Examples

```
feat: add support for OpenAPI 3.1 specification
fix: resolve issue with nullable schema generation
docs: update contributing guidelines with conventional commits
refactor: extract schema validation into separate module
```

Commit messages are automatically validated using commitlint when you make a commit.

## Start `@hey-api/openapi-ts`

Run `pnpm --filter @hey-api/openapi-ts dev`.
