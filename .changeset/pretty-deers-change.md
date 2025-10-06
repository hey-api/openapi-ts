---
'@hey-api/openapi-ts': minor
---

refactor(config): replace 'off' with null to disable options

### Updated `output` options

We made the `output` configuration more consistent by using `null` to represent disabled options. [This change](https://heyapi.dev/openapi-ts/migrating#updated-output-options) does not affect boolean options.
