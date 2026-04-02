---
"@hey-api/openapi-ts": minor
---

**plugin(zod)**: remove request data schema

### Validator request schemas

Zod plugin no longer exports composite request `Data` schemas. Instead, each layer is exported as a separate schema. If you're using validators with SDKs, you can preserve the composite schema with `shouldExtract`:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'sdk',
      validator: 'zod',
    },
    {
      name: 'zod',
      requests: {
        shouldExtract: true,
      },
    },
  ],
};
```
