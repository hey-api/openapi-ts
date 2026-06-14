---
"@hey-api/openapi-ts": minor
---

**BREAKING** **plugin**: remove `.external()` method

### Removed `plugin.external()` function

This function was used to reference external symbols. All plugins now use the Imports API, which allows you to reference external symbols in a type-safe way through `plugin.imports`.
