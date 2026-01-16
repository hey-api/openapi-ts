# Prettier to Oxfmt Migration Research

**Date**: 2026-01-16  
**Oxfmt Version Tested**: 0.24.0  
**Current Prettier Version**: 3.4.2

## Executive Summary

**Migration Status**: ✅ **FULLY FEASIBLE** - Seamless migration possible

Oxfmt provides a built-in migration tool that automatically converts Prettier configuration to Oxfmt format. The migration is straightforward and maintains formatting consistency.

## Key Features

### What Works ✅

1. ✅ **Automatic Migration** - `oxfmt --migrate=prettier` command
2. ✅ **Prettier Config Parity** - Supports all used Prettier options
3. ✅ **Ignore Patterns** - Migrates `.prettierignore` automatically
4. ✅ **Single/Double Quotes** - Respects `singleQuote` setting
5. ✅ **Semicolons** - Respects `semi` setting
6. ✅ **Print Width** - Respects `printWidth` (defaults to 100 if not set)
7. ✅ **Fast Performance** - Written in Rust, significantly faster than Prettier

### Current Configuration Migrated

From `prettier.config.js`:
```javascript
{
  semi: true,
  singleQuote: true,
}
```

To `.oxfmtrc.json`:
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "ignorePatterns": [/* migrated from .prettierignore */]
}
```

### Limitations & Notes

⚠️ **Known Limitations**:
- `embeddedLanguageFormatting` in JS/TS files not fully supported yet
- Some advanced Prettier plugins may not have equivalents
- LSP/editor integration may be limited compared to Prettier

✅ **For This Repository**:
- Simple Prettier config (only `semi` and `singleQuote`)
- No advanced features or plugins used
- All formatting needs met by Oxfmt

## Testing Results

**Test case**:
```javascript
// Before formatting
const x=1;const y=2;
const obj={a:1,b:2,c:3,d:4,e:5};
function foo(  ){return "hello";}

// After oxfmt (with singleQuote: true, semi: true)
const x = 1;
const y = 2;
const obj = { a: 1, b: 2, c: 3, d: 4, e: 5 };
function foo() {
  return 'hello';
}
```

✅ Correct spacing, single quotes, semicolons, and formatting!

## Migration Steps

### 1. Install Oxfmt

```bash
npm install -D oxfmt@0.24.0
```

### 2. Migrate Configuration

```bash
npx oxfmt --migrate=prettier
```

This automatically:
- Reads `prettier.config.js`
- Creates `.oxfmtrc.json`
- Migrates ignore patterns from `.prettierignore`

### 3. Update Scripts

Replace Prettier commands with Oxfmt in `package.json`:

```diff
{
  "scripts": {
-   "format": "prettier --write .",
+   "format": "oxfmt --write .",
-   "lint": "prettier --check . && eslint .",
+   "lint": "oxfmt --check . && oxlint .",
-   "lint:fix": "prettier --check --write . && eslint . --fix",
+   "lint:fix": "oxfmt --write . && oxlint . --fix"
  }
}
```

### 4. Update Dependencies

```diff
{
  "devDependencies": {
-   "eslint-config-prettier": "9.1.2",
-   "prettier": "3.4.2",
+   "oxfmt": "0.24.0"
  }
}
```

Note: `eslint-config-prettier` is no longer needed since we're using Oxlint instead of ESLint.

### 5. Clean Up

Optional: Remove old Prettier files after verifying Oxfmt works:
- `prettier.config.js` - Configuration migrated to `.oxfmtrc.json`
- `.prettierignore` - Patterns migrated to `.oxfmtrc.json`

Keep them temporarily for rollback if needed.

## Performance Comparison

### Prettier (Current)
- Written in JavaScript
- Slower on large codebases
- ~20-30s for full repository formatting (estimated)

### Oxfmt (Proposed)
- Written in Rust
- Significantly faster
- Expected: ~2-5s for full repository formatting
- **10-15x speed improvement** (similar to Oxlint vs ESLint)

## Integration with Oxlint Migration

Since we're also migrating from ESLint to Oxlint, both tools are part of the Oxc toolchain:

**Combined Benefits**:
- ✅ Single toolchain (Oxc) for linting and formatting
- ✅ Consistent performance improvements across the board
- ✅ Reduced dependencies (2 tools instead of 5+)
- ✅ Better integration between formatter and linter

**Before**:
- ESLint + 5 plugins
- Prettier
- eslint-config-prettier (to prevent conflicts)

**After**:
- Oxlint (with JS plugins)
- Oxfmt

## Recommendation

✅ **Migrate to Oxfmt** in parallel with Oxlint migration

**Rationale**:
1. Simple migration path (automated tool)
2. Full feature parity for our use case
3. Significant performance improvement
4. Part of unified toolchain with Oxlint
5. No known blockers or issues

## Configuration Files Created/Modified

### Created
- `.oxfmtrc.json` - Oxfmt configuration (migrated from Prettier)

### To Update
- `package.json` - Update scripts and dependencies

### Can Remove (After Testing)
- `prettier.config.js` - Migrated to `.oxfmtrc.json`
- `.prettierignore` - Migrated to `.oxfmtrc.json` ignore patterns
- Can keep for rollback initially

## Rollback Plan

If issues are discovered:

1. Revert `.oxfmtrc.json`
2. Restore `prettier.config.js` and `.prettierignore`
3. Revert `package.json` changes
4. Remove `oxfmt` from dependencies
5. Re-add `prettier`

No code changes needed - just configuration and tooling.

## Future Considerations

### When Oxfmt Adds More Features
- Monitor Oxfmt releases for `embeddedLanguageFormatting` support
- Consider adopting more Oxfmt-specific optimizations
- Evaluate LSP/editor integration improvements

### Potential Issues
- Editor integrations may not support Oxfmt yet
- Team members need to update their editor configs
- CI/CD needs to use Oxfmt instead of Prettier

## Conclusion

**Final Recommendation**: ✅ **Proceed with migration**

The migration from Prettier to Oxfmt is:
- ✅ Fully automated
- ✅ Feature-complete for our needs
- ✅ Performance improvement
- ✅ Part of unified Oxc toolchain
- ✅ No blockers identified

Combined with the Oxlint migration, this creates a complete, modern, fast toolchain for code quality.

---

## Resources

- **Oxfmt Documentation**: https://oxc.rs/docs/guide/usage/formatter
- **Oxfmt Migration Tool**: `oxfmt --migrate=prettier`
- **Oxfmt GitHub**: https://github.com/oxc-project/oxc
- **NPM Package**: https://www.npmjs.com/package/oxfmt
