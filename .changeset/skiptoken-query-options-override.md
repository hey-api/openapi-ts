---
"@hey-api/openapi-ts": minor
---

**plugin(@tanstack/react-query, @tanstack/preact-query)**: add `skipToken` support and `queryOptions` override to generated `useQuery` hooks; enable `useQuery` generation by default.

- Generated `queryOptions` and `infiniteQueryOptions` factories now accept `Options<T> | typeof skipToken`, following TanStack Query's idiomatic pattern for conditionally disabling queries.
- Generated `useQuery` hooks now accept an optional `queryOptions` property (typed as `Partial<Omit<ReturnType<typeof ...Options>, 'queryKey' | 'queryFn'>>`) that is spread over the computed options, allowing callers to override `staleTime`, `gcTime`, `enabled`, etc. without losing type safety.
- The `useQuery` config flag now defaults to `true` for `@tanstack/react-query` and `@tanstack/preact-query`. Existing users who do not want generated `useQuery` hooks must explicitly set `useQuery: false`.
