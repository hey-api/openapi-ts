---
'@hey-api/openapi-ts': minor
---

feat: support read-only and write-only properties

### Read-only and write-only fields

Starting with v0.66.0, `@hey-api/typescript` will generate separate types for payloads and responses if it detects any read-only or write-only fields. To preserve the previous behavior and generate a single type regardless, set `readOnlyWriteOnlyBehavior` to `off`.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/typescript',
      readOnlyWriteOnlyBehavior: 'off', // [!code ++]
    },
  ],
};
```
