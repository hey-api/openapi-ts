---
'@hey-api/openapi-ts': minor
---

feat(valibot): generate a single schema for requests

### Single Valibot schema per request

Previously, we generated a separate schema for each endpoint parameter and request body. In v0.76.0, a single request schema is generated for the whole endpoint. It may contain a request body, parameters, and headers.

```ts
const vData = v.object({
  body: v.optional(v.object({
    foo: v.optional(v.string()),
    bar: v.optional(v.union([v.number(), v.null()])),
  })),
  headers: v.optional(v.never()),
  path: v.object({
    baz: v.string(),
  }),
  query: v.optional(v.never()),
});
```

If you need to access individual fields, you can do so using the [`.entries`](https://valibot.dev/api/object/) API. For example, we can get the request body schema with `vData.entries.body`.
