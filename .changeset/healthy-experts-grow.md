---
'@hey-api/openapi-ts': patch
---

fix(config): add `output.fileName` option

## File Name

You can customize the naming and casing pattern for files using the `fileName` option.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    fileName: '{{name}}',
    path: 'src/client',
  },
};
```

By default, we append every file name with a `.gen` suffix to highlight it's automatically generated. You can customize or disable this suffix using the `fileName.suffix` option.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    fileName: {
      suffix: '.gen',
    },
    path: 'src/client',
  },
};
```
