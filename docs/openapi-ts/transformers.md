---
title: Transformers
description: Learn about transforming payloads with @hey-api/openapi-ts.
---

# Transformers

JSON is the most commonly used data format in REST APIs. However, it does not map well to OpenAPI data types. For example, both regular strings and date strings become simple strings in JSON.

One approach to this problem is using a [JSON superset](https://github.com/blitz-js/superjson). For most people, switching formats is not feasible. That's why `@hey-api/openapi-ts` offers data transformers.

::: warning
Transformers currently handle only the most common use cases. If your data isn't being transformed as expected, we encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

## Considerations

Before deciding whether transformers are right for you, we need to explain how they work. Transformers are generated on the [service layer](/openapi-ts/output#api-services), therefore they impact the bundle size. We generate a single transformer per operation for the most efficient result, just like a human engineer would. If you're already using services, chances are that you'll want to use transformers, too.

### Limitations

Transformers currently handle the most common use cases. Some of the known limitations are:

- union types are not transformed (e.g. if you have multiple success responses)
- only types defined through `$ref` are transformed
- error responses are not transformed

If your data isn't being transformed as expected, we encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).

## Dates

To automatically convert date strings into `Date` objects, you can use the `types.dates` configuration option.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  types: {
    dates: 'types+transform', // [!code ++]
  },
};
```

This will generate types that use `Date` instead of `string` and appropriate response transformers. Note that 3rd party date packages are not supported at the moment.

## Example

A generated response transformer might look something like this. Please note the example has been edited for brevity.

```ts
export type ModelWithPattern = {
  foo: string;
  bar: string;
  baz?: Date;
};

export const responseTransformer = (data) => {
  if (data?.baz) {
    data.baz = new Date(data.baz);
  }
  return data;
};

export const foo = () =>
  request(OpenAPI, {
    method: 'POST',
    responseTransformer,
    url: '/foo',
  });
```

<!--@include: ../sponsorship.md-->
