---
"@hey-api/openapi-ts": minor
---

**BREAKING** **plugin(@hey-api/client-ky)**: respect ky instance defaults

### Changed Ky client behavior

The Ky client was updated to be more intuitive. Some Ky options now need to be passed via the `kyOptions` field and you need to pass `undefined` to unset an option.
