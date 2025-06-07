---
'@hey-api/openapi-ts': minor
---

feat(sdk): add `classStructure` option supporting dot or slash `operationId` notation when generating class-based SDKs

### Added `sdk.classStructure` option

When generating class-based SDKs, we now try to infer the ideal structure using `operationId` keywords. If you'd like to preserve the previous behavior, set `classStructure` to `off`.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      classStructure: 'off',
      name: '@hey-api/sdk',
    },
  ],
};
```
