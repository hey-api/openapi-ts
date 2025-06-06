---
'@hey-api/openapi-ts': patch
---

fix(parser): skip schema if it's an array or tuple and its items don't have any matching readable or writable scopes
