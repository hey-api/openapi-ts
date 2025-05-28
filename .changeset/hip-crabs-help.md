---
'@hey-api/openapi-ts': minor
---

feat: upgraded input filters

### Upgraded input filters

Input filters now avoid generating invalid output without requiring you to specify every missing schema as in the previous releases. As part of this release, we changed the way filters are configured and removed the support for regular expressions. Let us know if regular expressions are still useful for you and want to bring them back!

```js
export default {
  input: {
    // match only the schema named `foo` and `GET` operation for the `/api/v1/foo` path
    filters: {
      operations: {
        include: ['GET /api/v1/foo'], // [!code ++]
      },
      schemas: {
        include: ['foo'], // [!code ++]
      },
    },
    include: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code --]
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```
