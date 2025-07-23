---
'@hey-api/openapi-ts': minor
---

feat(zod): add support for Zod 4 and Zod Mini

### Added Zod 4 and Zod Mini

This release adds support for Zod 4 and Zod Mini. By default, the `zod` plugin will generate output for Zod 4. If you want to preserve the previous output for Zod 3 or use Zod Mini, set `compatibilityVersion` to `3` or `mini`.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      compatibilityVersion: 3,
    },
  ],
};
```

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      compatibilityVersion: 'mini',
    },
  ],
};
```
