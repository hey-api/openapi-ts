---
'@hey-api/openapi-ts': minor
---

**plugin(@pinia/colada)**: feat: generate `InfiniteQuery` factory helpers for paginated operations. Each factory accepts `(options, init)` where `init` is a typed `Pick` of `DefineInfiniteQueryOptions` carrying `initialPageParam`, `getNextPageParam`, `maxPages`, and `getPreviousPageParam`. Requires `@pinia/colada >= 1.2.0`.

The generated helpers now compile cleanly under `tsc --strict` for the full matrix of paginated operations:

- when `options` is logically optional (no required path/query/body params), it now uses a default value (`options: Options<TData> = {}`) rather than the optional marker (`options?:`), so the required `init` parameter no longer trips TS1016 (required parameter follows optional).
- the per-request `page` shape is now `Partial<Pick<Options<TData>, 'body' | 'path' | 'query'>>` — keyed off the operation's data type instead of the broad `QueryKey` shape — so the SDK call's `...params` spread is assignable to the operation signature even when `body`/`path` are `never`, while `Partial` allows the override literal to omit fields that are required on the operation but already filled in by `options` (TS2345 fixed).
- pagination params whose name traverses nested schemas (e.g. `foo.page` for a parent param `foo` with a `page` keyword on its inner schema) now emit a nested object literal `{ query: { foo: { page: pageParam } } }` instead of a literal dotted key `'foo.page'`, matching the actual operation data shape at runtime.
- the runtime narrowing for `pageParam` is now structural — `typeof pageParam === 'object' && pageParam !== null && ('body' in pageParam || 'path' in pageParam || 'query' in pageParam)` — so paginations with cursor types like `Date | null` no longer falsely route into the page-object branch and `null` no longer assigns to the `Pick`-shaped slot (TS2322 fixed). The `pageParam` value used to seed the wrap literal is cast to the pagination schema's emitted type so the union with the page-object form does not leak into the wrap.
