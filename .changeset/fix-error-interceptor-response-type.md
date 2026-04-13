---
"@hey-api/openapi-ts": patch
---

**plugin(@hey-api/client-fetch)**: type `response` as `Response | undefined` in error interceptors and error results, since `response` is `undefined` when the error originates from a fetch exception (e.g. network failure, AbortError)
