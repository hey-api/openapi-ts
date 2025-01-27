---
'@hey-api/openapi-ts': patch
---

fix: move sdk.throwOnError option to client.throwOnError

### Moved `sdk.throwOnError` option

This SDK configuration option has been moved to the client plugins where applicable. Not every client can be configured to throw on error, so it didn't make sense to expose the option when it didn't have any effect.

```js
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-fetch',
      throwOnError: true, // [!code ++]
    },
    {
      name: '@hey-api/sdk',
      throwOnError: true, // [!code --]
    },
  ],
};
```
