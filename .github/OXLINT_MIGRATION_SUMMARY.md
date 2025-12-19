# Oxlint Migration - Executive Summary

> **TL;DR**: Migration from ESLint to Oxlint is **not feasible** at this time. Keep ESLint.

## Quick Decision Matrix

| Requirement                  | ESLint | Oxlint | Status |
| ---------------------------- | ------ | ------ | ------ |
| Custom plugin support        | ✅     | ❌     | BLOCK  |
| `object-shorthand` rule      | ✅     | ❌     | BLOCK  |
| Advanced import sorting      | ✅     | ⚠️     | BLOCK  |
| TypeScript interface sorting | ✅     | ❌     | Minor  |
| Destructure key sorting      | ✅     | ❌     | Minor  |
| `arrow-body-style`           | ✅     | ✅     | ✅     |
| `consistent-type-imports`    | ✅     | ✅     | ✅     |
| Performance                  | Good   | Better | -      |
| **Overall Compatibility**    | ✅     | ❌     | **NO** |

## Critical Blockers

### 1. Custom Local Paths Plugin

**Problem**: The repository uses a custom ESLint plugin (`eslint-rules/local-paths.js`, ~230 lines) that enforces monorepo import conventions. This plugin:

- Ensures proper use of `~` prefix for cross-boundary imports
- Prevents incorrect relative imports across package boundaries
- Provides auto-fix capabilities

**Oxlint Status**: ❌ Cannot replicate. Oxlint does not support custom JavaScript plugins and has no extension API.

### 2. Missing Style Rules

**Problem**: `object-shorthand: error` is actively enforced

**Oxlint Status**: ❌ Rule not available in v1.34.0

### 3. Sorting Limitations

**Problem**: Repository uses specialized sorting plugins

**Oxlint Status**: ⚠️ Has basic sorting, but missing:

- `eslint-plugin-simple-import-sort` equivalent
- `eslint-plugin-typescript-sort-keys` (interface/enum sorting)
- `eslint-plugin-sort-destructure-keys`

## Recommendation

**Keep ESLint**. The current setup is:

- ✅ Modern (ESLint v9 with flat config)
- ✅ Well-optimized
- ✅ Fully functional
- ✅ Meets all requirements
- ✅ No reported performance issues

## When to Reconsider

Re-evaluate migration when:

1. Oxlint announces a plugin API or extension mechanism
2. Oxlint adds `object-shorthand` and advanced sorting rules
3. Performance becomes a critical bottleneck (it isn't currently)
4. The custom `local-paths` plugin is no longer needed

**Timeline**: Review in 6-12 months

## Full Documentation

See [OXLINT_MIGRATION_RESEARCH.md](../OXLINT_MIGRATION_RESEARCH.md) for detailed analysis.

## Questions?

Contact: @mrlubos or open an issue
