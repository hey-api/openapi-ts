---
"@hey-api/shared": minor
---

**BREAKING** **plugin**: remove `registerSymbol()` function

### Removed `plugin.registerSymbol()` function

This function was an alias for `plugin.symbol()` accepting a single argument. It has been removed in favor of `plugin.symbol()` which can now also accept a single argument.
