---
'@hey-api/openapi-ts': minor
---

feat: add typescript.identifierCase option

### Added `typescript.identifierCase` option

**This change affects only the experimental parser.** By default, the generated TypeScript interfaces will follow the PascalCase naming convention. In the previous versions, we tried to preserve the original name as much as possible. To keep the previous behavior, set `typescript.identifierCase` to `preserve`.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true,
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      identifierCase: 'preserve', // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```
