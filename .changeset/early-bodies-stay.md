---
"@hey-api/openapi-ts": patch
"@hey-api/custom-client": patch
---

**client**: send an explicitly-provided empty object request body instead of dropping it

When an operation was called with an empty object body (for example when every body field is optional and none were supplied), `buildClientParams` treated the empty object as an unused slot and stripped it. The request was then sent with no body and no `Content-Type` header, which servers requiring `application/json` reject. An explicitly-provided body — including an empty object — is now preserved and sent as-is, while requests genuinely without a body continue to send none.
