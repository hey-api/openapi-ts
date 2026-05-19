---
"@hey-api/openapi-ts": patch
---

**fix**: avoid invalid `.extend()` on `z.record()` when a discriminated union member is an empty object. The union now falls back to `z.union()` for these branches so the generated schema compiles.
