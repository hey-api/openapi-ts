# ESLint to Oxlint Migration Research

**Date**: 2025-12-19  
**Oxlint Version Tested**: 1.34.0  
**Current ESLint Version**: 9.39.1

## Executive Summary

**Migration Status**: ⚠️ **NOT RECOMMENDED** at this time

A complete migration from ESLint to Oxlint is **not currently feasible** for this repository due to critical missing features in Oxlint, particularly the inability to support custom JavaScript plugins and several actively-used linting rules.

## Current ESLint Configuration Analysis

### Active ESLint Rules

From `eslint.config.js`, the repository uses:

#### Core Rules

- **ESLint recommended rules** (via `@eslint/js`)
- **TypeScript ESLint recommended rules** (via `typescript-eslint`)

#### Custom Plugin

- `local-paths/enforce-local-paths` (from `./eslint-rules/local-paths.js`)
  - **Purpose**: Enforces import path boundaries within the monorepo
  - **Complexity**: ~230 lines of sophisticated logic
  - **Critical**: Prevents cross-boundary imports, enforces `~` prefix for certain imports
  - **Auto-fixable**: Yes

#### Third-Party Plugins

1. **eslint-plugin-simple-import-sort**

   - `simple-import-sort/imports`: error
   - `simple-import-sort/exports`: error

2. **eslint-plugin-sort-destructure-keys**

   - `sort-destructure-keys/sort-destructure-keys`: warn

3. **eslint-plugin-sort-keys-fix**

   - `sort-keys-fix/sort-keys-fix`: warn

4. **eslint-plugin-typescript-sort-keys**
   - `typescript-sort-keys/interface`: warn
   - `typescript-sort-keys/string-enum`: warn

#### Style Rules

- `arrow-body-style`: error
- `object-shorthand`: error

#### TypeScript Rules

- `@typescript-eslint/consistent-type-imports`: warn (with auto-fix)
- `@typescript-eslint/ban-ts-comment`: off
- `@typescript-eslint/no-explicit-any`: off
- `@typescript-eslint/no-non-null-assertion`: off
- Various other TypeScript rules (mostly disabled)

#### File-Specific Overrides

- `.cjs` files: `@typescript-eslint/no-require-imports` disabled

#### Ignored Paths

- `**/dist/`, `**/node_modules/`, `**/.gen/`, `**/__snapshots__/`
- Framework build outputs (`.next/`, `.nuxt/`, `.output/`, etc.)

## Oxlint Capabilities Assessment

### What Oxlint Supports

✅ **Available Rules** (that match current config):

- `arrow-body-style` (eslint, style category, fixable)
- `consistent-type-imports` (typescript category, fixable)
- `sort-imports` (eslint, style category, fixable)
- `sort-keys` (eslint, style category, fixable)
- Most TypeScript ESLint correctness rules

✅ **Features**:

- Built-in TypeScript support
- Fast performance (written in Rust)
- Auto-fix capabilities
- Multiple output formats
- Plugin system for built-in plugins (unicorn, typescript, oxc, react, etc.)

### What Oxlint Does NOT Support

❌ **Critical Missing Features**:

1. **Custom JavaScript Plugins**

   - Oxlint does not have an API for custom plugins written in JavaScript
   - All plugins must be built into Oxlint itself (written in Rust)
   - **Impact**: Cannot replicate `eslint-rules/local-paths.js`

2. **Missing Rules**:

   - `object-shorthand` - No equivalent found
   - Fine-grained destructure key sorting
   - TypeScript interface/enum key sorting
   - Advanced import sorting with the flexibility of `simple-import-sort`

3. **Plugin Ecosystem**:
   - Cannot use npm-installed ESLint plugins
   - Limited to built-in Oxlint plugins only

## Detailed Gap Analysis

### 1. Custom Local Paths Plugin

**Current**: `eslint-rules/local-paths.js`

- Enforces import conventions across the monorepo
- Distinguishes between plugin folders, openApi folders, and first-level folders
- Uses sophisticated path resolution and normalization
- Provides auto-fix by rewriting import paths

**Oxlint Status**: ❌ **BLOCKER**

- No mechanism to add custom rules
- Would require contributing to Oxlint's Rust codebase
- No JavaScript plugin API planned (by design - Oxlint focuses on speed)

**Workaround**: None available

### 2. Import Sorting

**Current**: `eslint-plugin-simple-import-sort`

- Automatically sorts imports and exports
- Opinionated but customizable grouping
- Widely used in the ecosystem

**Oxlint Status**: ⚠️ **PARTIAL**

- Has `sort-imports` rule but with different behavior
- May not match the current sorting style
- Less flexible than `simple-import-sort`

**Workaround**: Could potentially adapt to Oxlint's `sort-imports`, but would change code style

### 3. Object Shorthand

**Current**: `object-shorthand: error`

- Enforces `{ x }` instead of `{ x: x }`
- Common style rule

**Oxlint Status**: ❌ **MISSING**

- No equivalent rule found in v1.34.0
- May be added in future releases

**Workaround**: Could disable this rule, but would lose consistency

### 4. Sorting Plugins

**Current**: Multiple specialized sorting plugins

- `sort-destructure-keys`: Sorts destructured variables
- `sort-keys-fix`: Sorts object keys
- `typescript-sort-keys`: Sorts interface/enum keys

**Oxlint Status**: ⚠️ **PARTIAL**

- Has basic `sort-keys` rule
- No specialized TypeScript sorting
- No destructure key sorting

**Workaround**: Would need to disable these rules or accept incomplete sorting

## Migration Blockers Summary

| Feature                     | Priority     | Status                | Blocker? |
| --------------------------- | ------------ | --------------------- | -------- |
| Custom `local-paths` plugin | **CRITICAL** | ❌ Not possible       | **YES**  |
| `object-shorthand` rule     | High         | ❌ Missing            | **YES**  |
| Advanced import sorting     | Medium       | ⚠️ Different behavior | Partial  |
| TypeScript sorting          | Low          | ❌ Missing            | No       |
| Destructure sorting         | Low          | ❌ Missing            | No       |

## Recommendations

### Short-term: Continue with ESLint

**Recommended Action**: Keep the current ESLint setup

**Reasons**:

1. Custom plugin is critical for monorepo architecture
2. All required rules are working
3. ESLint 9 with flat config is already optimized
4. No performance issues reported

**Optimizations** (if needed):

- Enable ESLint cache: `eslint . --cache`
- Use `--max-warnings` in CI for performance
- Consider splitting lint jobs in CI if needed

### Medium-term: Monitor Oxlint Development

**Action**: Track Oxlint progress quarterly

**Watch for**:

- Custom plugin API announcement
- Addition of `object-shorthand` rule
- Improved sorting capabilities
- Community adoption in similar monorepos

**Timeline**: Re-evaluate in 6-12 months

### Long-term: Potential Hybrid Approach

**Only if performance becomes critical**:

1. Use Oxlint for basic correctness checks (fast)
2. Use ESLint for custom rules and sorting (slower, but less frequently)
3. Split lint jobs in CI pipeline

**Complexity**: High - requires managing two linters
**Benefit**: Questionable - ESLint is already fast enough for most cases

## Alternative Solutions

### If the goal is to improve linting performance:

1. **ESLint Optimizations**:

   ```json
   {
     "scripts": {
       "lint": "eslint . --cache --cache-location .eslintcache"
     }
   }
   ```

2. **Parallel Linting in CI**:

   - Split workspace packages across parallel jobs
   - Use Turbo's built-in task distribution

3. **Pre-commit Hooks** (already in use):
   - `lint-staged` only lints changed files
   - Already optimal for developer workflow

### If the goal is to modernize tooling:

1. **Biome** (alternative to both ESLint and Prettier):

   - More mature than Oxlint for custom rules
   - Has its own limitations
   - Would still face similar plugin portability issues

2. **ESLint v9+ Features**:
   - Already using flat config ✅
   - Performance improvements over v8
   - Continue leveraging ecosystem

## Implementation Path (If Proceeding Anyway)

**NOT RECOMMENDED**, but if you want to attempt a partial migration:

### Phase 1: Basic Oxlint Setup

1. Install Oxlint: `pnpm add -D oxlint`
2. Initialize config: `npx oxlint --init`
3. Run in parallel with ESLint initially

### Phase 2: Rule Mapping

1. Map TypeScript rules to Oxlint equivalents
2. Enable style category for `arrow-body-style`
3. Configure ignore patterns

### Phase 3: Custom Solutions

1. **Custom plugin**: Would need to be rewritten in Rust and contributed to Oxlint
2. **Sorting**: Accept Oxlint's built-in sorting or write separate tooling
3. **Missing rules**: Either skip or wait for Oxlint to add them

### Phase 4: Validation

1. Run both linters in parallel
2. Compare outputs
3. Fix discrepancies

**Estimated Effort**: 2-4 weeks
**Success Probability**: Low due to custom plugin blocker

## Conclusion

**Final Recommendation**: **Do not migrate to Oxlint at this time**

The repository has specific linting requirements that are critical to its monorepo architecture, particularly the custom `local-paths` plugin. Oxlint's design philosophy (performance through Rust, no JavaScript plugins) makes it fundamentally incompatible with these requirements.

**When to reconsider**:

- Oxlint announces a plugin API
- Performance becomes a critical bottleneck (it isn't currently)
- The custom rules are no longer needed
- Oxlint adds all missing rules (`object-shorthand`, advanced sorting)

**Current setup is optimal**: ESLint 9 with flat config is modern, performant, and meets all requirements.

---

## Resources

- Oxlint Documentation: https://oxc.rs/docs/guide/usage/linter.html
- Oxlint Rules: Run `npx oxlint --rules`
- Oxlint GitHub: https://github.com/oxc-project/oxc
- ESLint Flat Config: https://eslint.org/docs/latest/use/configure/configuration-files

## Questions?

If you disagree with this analysis or have new information about Oxlint capabilities, please update this document or create an issue for discussion.
