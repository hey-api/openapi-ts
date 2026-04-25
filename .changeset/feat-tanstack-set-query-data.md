---
"@hey-api/openapi-ts": minor
---

**plugin(@tanstack/*-query)**: add `setQueryData` and `useSetQueryData` config options. `setQueryData` (all 6 plugins) generates a plain function wrapping `queryClient.setQueryData()` per query operation. `useSetQueryData` (`@tanstack/react-query` and `@tanstack/preact-query` only) generates a hook variant that calls `useQueryClient()` internally. Both are disabled by default.
