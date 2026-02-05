---
"@hey-api/openapi-ts": minor
---

**BREAKING:** **symbol**: replace `exportFrom` array with `getExportFromFilePath()` function

### Updated Symbol interface

The `exportFrom` property has been replaced with the `getExportFromFilePath()` function. This allows you to dynamically determine export paths based on symbol properties. This is a low-level feature, so you're most likely unaffected.
