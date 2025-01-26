---
'@hey-api/openapi-ts': minor
---

feat: move clients to plugins

### Client plugins

Clients are now plugins generating their own `client.gen.ts` file. There's no migration needed if you're using CLI. If you're using the configuration file, move `client` options to `plugins`.

```js
export default {
  client: '@hey-api/client-fetch', // [!code --]
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'], // [!code ++]
};
```
