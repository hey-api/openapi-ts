---
'@hey-api/openapi-ts': minor
---

feat: remove `@hey-api/schemas` from default plugins

### Updated default `plugins`

`@hey-api/schemas` has been removed from the default plugins. To continue using it, add it to your plugins array.

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true,
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/schemas', // [!code ++]
  ],
};
```
