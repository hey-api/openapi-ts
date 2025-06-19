---
'@hey-api/openapi-ts': minor
---

feat(zod): generate a single schema for requests

### Single Zod schema per request

Previously, we generated a separate schema for each endpoint parameter and request body. In v0.74.0, a single request schema is generated for the whole endpoint. It may contain a request body, parameters, and headers.

```ts
const zData = z.object({
  body: z.object({
    foo: z.string().optional(),
    bar: z.union([z.number(), z.null()]).optional(),
  }).optional(),
  headers: z.never().optional(),
  path: z.object({
    baz: z.string()
  }),
  query: z.never().optional()
});
```

If you need to access individual fields, you can do so using the [`.shape`](https://zod.dev/api?id=shape) API. For example, we can get the request body schema with `zData.shape.body`.
