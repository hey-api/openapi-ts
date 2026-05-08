---
'@hey-api/openapi-ts': minor
---

feat(@tanstack/*-query): add `responseStyle: 'fields'` option that returns `{ data, request, response }` from generated query/mutation helpers and throws `{ error, request, response }` on failure, enabling access to HTTP status codes, headers, and request metadata.
