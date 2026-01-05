# TypeScript Native Preview Migration

## Overview

This document outlines the findings and requirements for migrating the Hey API OpenAPI TypeScript project to TypeScript Native preview (v7.0.0-dev).

## Current Status

- **Current TypeScript Version**: 5.9.3
- **TypeScript Native Preview Version**: 7.0.0-dev.20260105.1 (installed as optional dependency)
- **Installation Status**: ✅ Successfully installed
- **Package Name**: `@typescript/native-preview`

## Key Findings

### 1. Installation

TypeScript Native preview is available on npm as `@typescript/native-preview`. It's a preview build of the native TypeScript compiler port written in Go.

```bash
npm install @typescript/native-preview
npx tsgo --help  # Use tsgo instead of tsc
```

The package includes platform-specific binaries:

- `@typescript/native-preview-linux-x64`
- `@typescript/native-preview-linux-arm64`
- `@typescript/native-preview-darwin-x64`
- `@typescript/native-preview-darwin-arm64`
- `@typescript/native-preview-win32-x64`
- `@typescript/native-preview-win32-arm64`

### 2. Breaking Changes

#### Removed: `baseUrl` Compiler Option

TypeScript Native has removed the `baseUrl` compiler option. The error message indicates:

```
error TS5102: Option 'baseUrl' has been removed. Please remove it from your configuration.
  Use '"paths": {"*": ["./*"]}' instead.
```

**Impact**: Only affects `packages/openapi-ts/tsconfig.base.json`

**Migration Required**:

```diff
{
  "compilerOptions": {
-   "baseUrl": "./",
    "paths": {
+     "*": ["./*"],
      "~/*": ["src/*"]
    }
  }
}
```

### 3. Testing Results

#### Test 1: Type Checking with Modified Config

- **Status**: ✅ PASSED
- **Duration**: ~120 seconds
- **Result**: No errors when `baseUrl` is removed and `"*": ["./*"]` is added to paths

#### Test 2: Current Build Process

- **Status**: ✅ PASSED
- **Command**: `pnpm build --filter="@hey-api/**"`
- **Duration**: ~50 seconds
- **Result**: All 6 packages built successfully with TypeScript 5.9.3

### 4. Compatibility Status

Based on the [TypeScript Native README](https://github.com/microsoft/typescript-go):

| Feature                         | Status         | Notes                                                        |
| ------------------------------- | -------------- | ------------------------------------------------------------ |
| Program creation                | ✅ done        | Same files and module resolution as TS 5.9                   |
| Parsing/scanning                | ✅ done        | Exact same syntax errors as TS 5.9                           |
| Type resolution                 | ✅ done        | Same types as TS 5.9                                         |
| Type checking                   | ✅ done        | Same errors, locations, and messages as TS 5.9               |
| JSX                             | ✅ done        | -                                                            |
| Declaration emit                | ⚠️ in progress | Most common features in place, some edge cases unhandled     |
| Emit (JS output)                | ⚠️ in progress | `target: esnext` well-supported, other targets may have gaps |
| Build mode / project references | ✅ done        | -                                                            |
| Incremental build               | ✅ done        | -                                                            |
| Language service (LSP)          | ⚠️ in progress | Most functionality working                                   |

**Note**: The project uses `target: ES2022`, which should be well-supported.

### 5. Known Limitations

From the TypeScript Native CHANGES.md:

1. **Scanner**: Node positions use UTF8 offsets (not UTF16). Positions in files with non-ASCII characters will differ.
2. **JSDoc**: Several JSDoc features have changed or been removed
3. **CommonJS**: Some CommonJS-specific features have changed

These limitations are unlikely to affect this project significantly as it primarily generates TypeScript/ESM code.

## Migration Blockers

### Critical Blocker: `baseUrl` Configuration

**Issue**: The `baseUrl` compiler option has been removed from TypeScript Native.

**Affected Files**:

- `packages/openapi-ts/tsconfig.base.json`

**Resolution**: Update the single affected file to use the recommended `paths` configuration instead.

**Risk Assessment**: ⚠️ LOW

- Only one file affected
- Simple configuration change
- Tests confirm it works
- No code changes required

## Migration Path

### Option 1: Full Migration (Recommended for Testing)

1. Update `packages/openapi-ts/tsconfig.base.json`:

   - Remove `baseUrl: "./"`
   - Add `"*": ["./*"]` to paths mapping

2. Update package.json scripts to use `tsgo` instead of `tsc` (optional for testing)

3. Run full test suite:

   ```bash
   pnpm build --filter="@hey-api/**"
   pnpm typecheck
   pnpm test
   pnpm lint
   ```

4. Monitor for issues in:
   - Type checking correctness
   - Build output
   - Test results

### Option 2: Side-by-Side Testing (Conservative)

Keep TypeScript 5.9.3 as primary, use TypeScript Native for testing:

1. Make the `baseUrl` configuration change
2. Add npm scripts for testing with tsgo:
   ```json
   {
     "scripts": {
       "typecheck:native": "tsgo --noEmit"
     }
   }
   ```
3. Run both compilers in CI to compare results

### Option 3: Wait for Stability

**Recommendation**: Wait until TypeScript Native reaches feature parity.

**Blockers to watch**:

- Declaration emit completion
- JS output for ES2022 target
- Language service stability

## Recommendations

### Short Term (Now)

1. ✅ **DONE**: Install `@typescript/native-preview` as optional dependency
2. ✅ **VERIFIED**: Test basic compilation with modified config
3. ⏳ **IN PROGRESS**: Document findings

### Medium Term (1-2 months)

1. Update `tsconfig.base.json` to remove `baseUrl` (compatible with both TS 5.9.3 and TS Native)
2. Add CI job to test builds with TypeScript Native
3. Monitor TypeScript Native release notes for updates

### Long Term (When Stable)

1. Switch to TypeScript Native as primary compiler
2. Remove TypeScript 5.x dependency
3. Update documentation

## Testing Checklist

Before fully migrating, verify:

- [ ] All packages build successfully with tsgo
- [ ] Type checking produces same/equivalent errors
- [ ] Generated declaration files are correct
- [ ] Generated JavaScript output is equivalent
- [ ] All tests pass
- [ ] Examples continue to work
- [ ] Language service integration works in VS Code
- [ ] Build performance is acceptable

## Performance Expectations

Based on the TypeScript Native blog post and community feedback:

- **Faster compilation**: Native code should be significantly faster than Node.js-based TypeScript
- **Lower memory usage**: Go's memory management is more efficient
- **Better watch mode**: Incremental compilation should be faster

**Note**: Actual benchmarks needed to confirm for this specific project.

## Conclusion

### Can We Migrate Today?

**Answer**: ⚠️ **PARTIALLY - WITH CAUTION**

- ✅ Basic type checking works
- ✅ Only one configuration change needed
- ⚠️ Declaration emit is still "in progress"
- ⚠️ JS output for non-esnext targets has gaps
- ⚠️ This is still a preview build

### Recommendation

**Keep TypeScript 5.9.3 as primary** for now, but:

1. Make the `baseUrl` → `paths` config change (it's compatible with both versions)
2. Add optional testing with TypeScript Native in CI
3. Monitor the project for stability improvements
4. Re-evaluate in 1-2 months

The main blocker is that TypeScript Native is still in preview with some features marked "in progress". For a production tool like `@hey-api/openapi-ts`, stability is critical. However, preparing for the migration by making compatible configuration changes now is a good strategy.

## References

- [TypeScript Native Announcement](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [TypeScript Native Repository](https://github.com/microsoft/typescript-go)
- [TypeScript Native npm Package](https://www.npmjs.com/package/@typescript/native-preview)
- [TypeScript Native CHANGES.md](https://raw.githubusercontent.com/microsoft/typescript-go/refs/heads/main/CHANGES.md)

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-05  
**Status**: Initial Assessment Complete
