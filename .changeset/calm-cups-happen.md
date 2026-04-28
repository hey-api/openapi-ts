---
'@hey-api/openapi-ts': patch
'@hey-api/shared': patch
---

Add new configuration toggles to reduce generated TypeScript artifacts and improve parser read/write controls.

For `@hey-api/openapi-ts` (`@hey-api/typescript` plugin):

- allow disabling request aliases with `requests: false`
- allow disabling response aliases with `responses: false`
- allow disabling error aliases with `errors: false`
- allow disabling `ClientOptions` with `clientOptions: false`
