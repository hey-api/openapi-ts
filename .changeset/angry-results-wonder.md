---
"@hey-api/openapi-ts": minor
---

**BREAKING** **config**: merge duplicate plugin configurations

### Plugin duplicates behavior

If you specified the same plugin multiple times, only the last instance would be used. We eventually added a warning for this behavior, but that didn't treat the root issue. This release changes that by merging duplicate plugin configurations.
