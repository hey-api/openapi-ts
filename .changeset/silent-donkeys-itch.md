---
'@hey-api/openapi-ts': minor
---

fix(typescript): removed `typescript+namespace` enums mode

### Removed `typescript+namespace` enums mode

Due to a simpler TypeScript plugin implementation, the `typescript+namespace` enums mode is no longer necessary. This mode was used in the past to group inline enums under the same namespace. With the latest changes, this behavior is no longer supported. You can either choose to ignore inline enums (default), or use the `enums` transform (added in v0.78.0) to convert them into reusable components which will get exported as usual.
