---
"@hey-api/openapi-ts": patch
---

Fix `@hey-api/client-next` request interceptors so URL mutations are reflected in the final request URL.

Previously, the client built the URL before request interceptors ran, so interceptor changes to `baseUrl`, `url`, `path`, or `query` were ignored by the fetch call.
