---
'@hey-api/openapi-ts': minor
---

fix: require sdk.transformer to use generated transformers

### Added `sdk.transformer` option

When generating SDKs, you now have to specify `transformer` in order to modify response data. By default, adding `@hey-api/transformers` to your plugins will only produce additional output. To preserve the previous functionality, set `sdk.transformer` to `true`.

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    {
      name: '@hey-api/sdk',
      transformer: true, // [!code ++]
    },
  ],
};
```
