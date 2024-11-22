---
'@hey-api/openapi-ts': minor
---

feat: add typescript.exportInlineEnums option

### Added `typescript.exportInlineEnums` option

By default, inline enums (enums not defined as reusable components in the input file) will be generated only as inlined union types. You can set `exportInlineEnums` to `true` to treat inline enums as reusable components. When `true`, the exported enums will follow the style defined in `enums`.

This is a breaking change since in the previous versions, inline enums were always treated as reusable components. To preserve your current output, set `exportInlineEnums` to `true`. This feature works only with the experimental parser.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true,
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      exportInlineEnums: true, // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```
