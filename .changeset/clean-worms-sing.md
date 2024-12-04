---
'@hey-api/openapi-ts': minor
---

feat: add `logs.level` option

### Added `logs.level` option

You can now configure different log levels. As part of this feature, we had to introduce a breaking change by moving the `debug` option to `logs.level`. This will affect you if you're calling `@hey-api/openapi-ts` from Node.js (not CLI) or using the configuration file.

```js
export default {
  client: '@hey-api/client-fetch',
  debug: true, // [!code --]
  input: 'path/to/openapi.json',
  logs: {
    level: 'debug', // [!code ++]
  },
  output: 'src/client',
};
```
