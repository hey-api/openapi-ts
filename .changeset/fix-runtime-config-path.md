---
"@hey-api/openapi-ts": minor
---

**BREAKING** **client**: resolve `runtimeConfigPath` relative to the output folder

### Changed `runtimeConfigPath` behavior

This was a known, long-standing issue confusing first-time users. Before, defining client `runtimeConfigPath` value would paste it verbatim to the generated output. This release changes the behavior to resolve relative to the output folder.

