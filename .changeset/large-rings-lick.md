---
'@hey-api/openapi-ts': minor
---

**output**: use TypeScript DSL

### Removed `compiler` and `tsc` exports

This release removes the `compiler` utility functions. Instead, it introduces a new TypeScript DSL exposed under the `$` symbol. All plugins now use this interface, so you may notice slight changes in the generated output.
