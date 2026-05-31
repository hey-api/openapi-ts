---
"@hey-api/openapi-ts": patch
---

**plugin(@hey-api/client-axios)**: fix: use `Object.create()` to avoid prototype chain substitution. Reported by @programsurf, @daeungdaeung, @yoonsh, and @lubroai (GHSA-hhx9-57xq-r5rw)
