---
title: Transformers
description: Learn about transforming data with @hey-api/openapi-ts.
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

## Installation

In your [configuration](/openapi-ts/get-started), add `@hey-api/transformers` to your plugins and you'll be ready to generate transformers. :tada:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@hey-api/transformers', // [!code ++]
  ],
};
```

## SDKs

To automatically transform response data in your SDKs, set `sdk.transformer` to `true`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@hey-api/transformers',
    {
      name: '@hey-api/sdk', // [!code ++]
      transformer: true, // [!code ++]
    },
  ],
};
```

## Dates

To convert date strings into `Date` objects, use the `dates` configuration option.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      dates: true, // [!code ++]
      name: '@hey-api/transformers',
    },
  ],
};
```

This will generate types that use `Date` instead of `string` and appropriate transformers. Note that third-party date packages are not supported at the moment.

## BigInt

The `@hey-api/transformers` plugin will natively type all BigInts as `bigint` instead of `number`, which can affect arithmetic operations if your application previously used `number`. To force BigInts to be numbers, use the `bigint` configuration option.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      bigint: true, // [!code ++]
      name: '@hey-api/transformers',
    },
  ],
};
```

## Example

A generated response transformer might look something like this. Please note the example has been edited for brevity.

::: code-group

```ts [transformers.gen.ts]
import type { GetFooResponse } from './types.gen';

const quxSchemaResponseTransformer = (data: any) => {
  if (data.baz) {
    data.baz = new Date(data.baz);
  }
  return data;
};

const bazSchemaResponseTransformer = (data: any) => {
  data = quxSchemaResponseTransformer(data);
  data.bar = new Date(data.bar);
  return data;
};

export const getFooResponseTransformer = async (
  data: any,
): Promise<GetFooResponse> => {
  data = bazSchemaResponseTransformer(data);
  return data;
};
```

```ts [types.gen.ts]
export type Baz = Qux & {
  id: 'Baz';
} & {
  foo: number;
  bar: Date;
  baz: 'foo' | 'bar' | 'baz';
  qux: number;
};

export type Qux = {
  foo: number;
  bar: number;
  baz?: Date;
  id: string;
};

export type GetFooResponse = Baz;
```

:::

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/transformers/types.d.ts) interface.

<!--@include: ../partials/sponsors.md-->
