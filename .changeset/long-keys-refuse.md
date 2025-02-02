---
'@hey-api/openapi-ts': minor
---

feat: added `client.baseUrl` option

### Added `client.baseUrl` option

You can use this option to configure the default base URL for the generated client. By default, we will attempt to resolve the first defined server or infer the base URL from the input path. If you'd like to preserve the previous behavior, set `baseUrl` to `false`.

```js
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [{
    baseUrl: false, // [!code ++]
    name: '@hey-api/client-fetch',
  }],
};
```
