---
'@hey-api/openapi-ts': minor
'@hey-api/docs': minor
---

feat: add watch mode

## Watch Mode

::: warning
Watch mode currently supports only remote files via URL.
:::

If your schema changes frequently, you may want to automatically regenerate the output during development. To watch your input file for changes, enable `watch` mode in your configuration or pass the `--watch` flag to the CLI.

### Config

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  watch: true, // [!code ++]
};
```

### CLI

```sh
npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client -c @hey-api/client-fetch -w
```
