---
"@hey-api/openapi-ts": patch
---

**plugin(@hey-api/client-fetch)**: narrow `headers` to `Headers` in `ResolvedRequestOptions` so request interceptors can use `.set()`, `.get()`, etc. without casting
