---
"@hey-api/openapi-ts": patch
---

**fix**: preserve decimal-looking enum varnames as quoted string property keys instead of coercing to numeric literals, preventing runtime data loss (e.g. trailing zeros) and key collisions
