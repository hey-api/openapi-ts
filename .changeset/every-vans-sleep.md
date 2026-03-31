---
"@hey-api/openapi-ts": minor
"@hey-api/shared": minor
---

**internal**: remove `plugin.getSymbol()` function

### Removed `plugin.getSymbol()` function

This function has been removed. You can use `plugin.querySymbol()` instead. It accepts the same arguments and returns the same result.
