---
'@hey-api/client-fetch': minor
---

**BREAKING**: return raw response body (of type `ReadableStream`) when `Content-Type` response header is not provided and `parseAs` is set to `auto`
