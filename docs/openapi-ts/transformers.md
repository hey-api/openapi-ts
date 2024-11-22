---
title: Transformers
description: Learn about transforming payloads with @hey-api/openapi-ts.
---

# Transformers

JSON is the most commonly used data format in REST APIs. However, it does not map well to complex data types. For example, both regular strings and date strings become simple strings in JSON.

One approach to this problem is using a [JSON superset](https://github.com/blitz-js/superjson). For most people, switching formats is not feasible. That's why we provide the `@hey-api/transformers` plugin.

::: warning
Transformers currently handle only the most common use cases. If your data isn't being transformed as expected, we encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

## Considerations

Before deciding whether transformers are right for you, let's explain how they work. Transformers generate a runtime file, therefore they impact the bundle size. We generate a single transformer per operation response for the most efficient result, just like a human engineer would.

### Limitations

Transformers handle only the most common scenarios. Some of the known limitations are:

- union types are not transformed (e.g. if you have multiple possible response shapes)
- only types defined through `$ref` are transformed
- error responses are not transformed

If your data isn't being transformed as expected, we encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).

## Dates

To convert date strings into `Date` objects, use the `dates` configuration option.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    // ...default plugins
    {
      dates: true, // [!code ++]
      name: '@hey-api/transformers',
    },
  ],
};
```

This will generate types that use `Date` instead of `string` and appropriate transformers. Note that third-party date packages are not supported at the moment.

## Example

A generated response transformer might look something like this. Please note the example has been edited for brevity.

```ts
export type MyResponse = {
  foo: string;
  bar: string;
  baz?: Date;
};

export const myResponseTransformer = async (data: any): Promise<MyResponse> => {
  if (data.baz) {
    data.baz = new Date(data.baz);
  }
  return data;
};

export const myResponse = () =>
  client.get<MyResponse>({
    responseTransformer: myResponseTransformer,
    url: '/foo',
  });
```

<!--@include: ../sponsorship.md-->
