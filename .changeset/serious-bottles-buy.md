---
'@hey-api/openapi-ts': minor
---

feat: respect `moduleResolution` value in `tsconfig.json`

### Respecting `moduleResolution` value in `tsconfig.json`

This release introduces functionality related to your `tsconfig.json` file. The initial feature properly respects the value of your `moduleResolution` field. If you're using `nodenext`, the relative module paths in your output will be appended with `.js`. To preserve the previous behavior where we never appended `.js` to relative module paths, set `output.tsConfigPath` to `off`.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    path: 'src/client',
    tsConfigPath: 'off',
  },
};
```
