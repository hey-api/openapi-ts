---
'@hey-api/openapi-ts': minor
---

feat(parser): add Hooks API

### Added Hooks API

This release adds the [Hooks API](https://heyapi.dev/openapi-ts/configuration/parser#hooks), giving you granular control over which operations generate queries and mutations. As a result, we tightened the previous behavior and POST operations no longer generate queries by default. To preserve the old behavior, add a custom matcher.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    hooks: {
      operations: {
        isQuery: (op) => (op.method === 'post' ? true : undefined),
      },
    },
  },
};
```
