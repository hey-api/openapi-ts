---
'@hey-api/openapi-ts': minor
---

feat(sdk): update `validator` option

### Updated `sdk.validator` option

Clients can now validate both request and response data. As a result, passing a boolean or string to `validator` will control both of these options. To preserve the previous behavior, set `validator.request` to `false` and `validator.response` to your previous configuration.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/sdk',
      validator: {
        request: false,
        response: true,
      },
    },
  ],
};
```
