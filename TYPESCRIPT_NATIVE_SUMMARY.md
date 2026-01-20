# TypeScript Native Preview Migration - Summary

## What Was Done

This PR prepares the Hey API OpenAPI TypeScript codebase for TypeScript Native preview (v7.0.0-dev) migration.

### Changes Made

1. **Added TypeScript Native preview** as an optional dependency (`@typescript/native-preview@7.0.0-dev.20260105.1`)
2. **Updated tsconfig.base.json** in `packages/openapi-ts/` to be compatible with both TypeScript 5.9.3 and TypeScript Native:
   - Removed `baseUrl: "./"` (removed in TypeScript Native)
   - Added `"*": ["./*"]` to paths (recommended replacement)
   - Updated `"~/*"` to use explicit `"./src/*"` path
3. **Created comprehensive documentation** in `docs/typescript-native-migration.md`

### Verification Results ✅

- ✅ All packages build successfully with TypeScript 5.9.3
- ✅ Type checking works with TypeScript Native 7.0.0-dev
- ✅ All 796 tests pass
- ✅ Configuration is backward compatible

## Can We Migrate Today?

**Answer**: ⚠️ **Not Recommended for Production**

While the codebase is now compatible with TypeScript Native, a full migration is **not recommended yet** because:

1. TypeScript Native is still in **preview** (v7.0.0-dev)
2. Some features are marked "in progress":
   - Declaration emit (most features work, some edge cases pending)
   - JS output for non-esnext targets (may have gaps)
3. The project is a production tool used by Vercel, OpenCode, and PayPal - stability is critical

## What This PR Enables

### Immediate Benefits

1. **Future-proof configuration**: The tsconfig is now compatible with both versions
2. **Easy testing**: Can test with TypeScript Native using `npx tsgo` instead of `npx tsc`
3. **No breaking changes**: Everything works exactly as before with TypeScript 5.9.3

### How to Test TypeScript Native

```bash
# Install dependencies (includes TypeScript Native as optional)
pnpm install

# Use tsgo instead of tsc
npx tsgo --version  # 7.0.0-dev.20260105.1
npx tsgo --noEmit   # Type check with TypeScript Native

# Regular TypeScript still works
npx tsc --version   # 5.9.3
npx tsc --noEmit    # Type check with TypeScript 5.9.3
```

## Recommendations

### Short Term (Now)

- ✅ Merge this PR to make the codebase compatible
- ⏳ Monitor TypeScript Native releases for stability improvements
- ⏳ Optionally add CI job to test builds with TypeScript Native

### Medium Term (1-2 months)

- ⏳ Re-evaluate migration when TypeScript Native reaches beta/RC
- ⏳ Run performance benchmarks to quantify improvements
- ⏳ Test with real-world OpenAPI specifications

### Long Term (When Stable)

- ⏳ Switch to TypeScript Native as primary compiler
- ⏳ Remove TypeScript 5.x dependency
- ⏳ Update documentation and CI/CD

## Performance Expectations

TypeScript Native is written in Go and promises:

- ⚡ **Faster compilation** (native code vs. Node.js)
- 💾 **Lower memory usage** (Go's efficient memory management)
- 🔄 **Better watch mode** (faster incremental compilation)

Actual benchmarks will be needed to confirm performance gains for this specific project.

## Documentation

See `docs/typescript-native-migration.md` for:

- Detailed findings and test results
- Complete migration path options
- Known limitations and breaking changes
- Testing checklist

## References

- [TypeScript Native Announcement](https://devblogs.microsoft.com/typescript/typescript-native-port/)
- [TypeScript Native Repository](https://github.com/microsoft/typescript-go)
- [npm Package](https://www.npmjs.com/package/@typescript/native-preview)

---

**Status**: Ready for review ✅  
**Breaking Changes**: None  
**Risk Level**: Low (backward compatible changes only)
