---
'@hey-api/openapi-ts': minor
---

feat: Symbol API

### Symbol API

This release improves the Symbol API, which adds the capability to place symbols in arbitrary files. We preserved the previous output structure for all plugins except Angular.

You can preserve the previous Angular output by writing your own [placement function](https://heyapi.dev/openapi-ts/configuration/parser#hooks-symbols).

### Removed `output` plugin option

Due to the Symbol API release, this option has been removed from the Plugin API.
