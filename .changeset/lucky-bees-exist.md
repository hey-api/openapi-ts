---
'@hey-api/openapi-ts': minor
---

feat(parser): replace `plugin.subscribe()` with `plugin.forEach()`

### Added `plugin.forEach()` method

This method replaces the `.subscribe()` method. Additionally, `.forEach()` is executed immediately, which means we don't need the `before` and `after` events – simply move your code before and after the `.forEach()` block.

```ts
plugin.forEach('operation', 'schema', (event) => {
  // do something with event
});
```
