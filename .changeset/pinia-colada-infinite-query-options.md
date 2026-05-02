---
'@hey-api/openapi-ts': minor
---

**plugin(@pinia/colada)**: feat: generate `InfiniteQuery` factory helpers for paginated operations. Each factory accepts `(options, init)` where `init` is a typed `Pick` of `DefineInfiniteQueryOptions` carrying `initialPageParam`, `getNextPageParam`, `maxPages`, and `getPreviousPageParam`. Requires `@pinia/colada >= 1.2.0`.
