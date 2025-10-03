---
'@hey-api/openapi-ts': minor
---

refactor(config): replace 'off' with null to disable options

### Updated `output` options

We made the `output` configuration more consistent by using `null` to represent disabled options. This change does not affect boolean options.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    format: null,
    lint: null,
    path: 'src/client',
    tsConfigPath: null,
  },
};
```
