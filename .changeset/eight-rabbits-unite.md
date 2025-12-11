---
'@hey-api/openapi-ts': minor
---

**output**: add `preferExportAll` option

### Prefer named exports

This release changes the default for `index.ts` to prefer named exports. Named exports may lead to better IDE and bundler performance compared to asterisk (`*`) as your tooling doesn't have to inspect the underlying module to discover exports.

While this change is merely cosmetic, you can set `output.preferExportAll` to `true` if you prefer to use the asterisk.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    path: 'src/client',
    preferExportAll: true,
  },
};
```
