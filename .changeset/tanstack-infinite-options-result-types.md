---
"@hey-api/openapi-ts": patch
---

**fix(tanstack-query)**: correct result types for generated infinite query options

The generated `*InfiniteOptions()` helpers intentionally omit `initialPageParam` and `getNextPageParam` (consumers supply them), so the `infiniteQueryOptions()` call doesn't match any overload and the error is suppressed with `@ts-ignore`. TypeScript then resolves the call against the first (defined-initial-data) overload, and the inferred return type carries a phantom required `initialData`. Spreading the result into `useInfiniteQuery()` therefore selects the defined-initial-data overload and mistypes the result: `data` is never `undefined` and `isPending` narrows to `false`, even though both are inaccurate at runtime during the first fetch.

The generated functions now strip `initialData` from the inferred type (`Omit<typeof opts, 'initialData'>`, a runtime no-op), so `useInfiniteQuery()` consumers get honest result types.
