---
"@hey-api/openapi-ts": patch
---

Fix axios client generation so `beforeRequest` typing is stable across `strictFunctionTypes` settings, preventing config-dependent `TS2578` (`Unused '@ts-expect-error' directive`) in generated clients.
