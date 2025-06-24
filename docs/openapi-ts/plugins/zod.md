---
title: Zod
description: Zod plugin for Hey API. Compatible with all our features.
---

<!-- <script setup>
import { embedProject } from '../../embed'
</script> -->

# Zod

::: warning
Zod plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues/876).
:::

### About

[Zod](https://zod.dev) is a TypeScript-first schema validation library with static type inference.

<!-- ### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-zod-example')(event)">
Launch demo
</button> -->

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- Zod schemas for requests, responses, and reusable definitions

## Installation

In your [configuration](/openapi-ts/get-started), add `zod` to your plugins and you'll be ready to generate Zod artifacts. :tada:

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    'zod', // [!code ++]
  ],
};
```

### SDKs

To add data validators to your SDKs, set `sdk.validator` to `true`.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    'zod',
    {
      name: '@hey-api/sdk', // [!code ++]
      validator: true, // [!code ++]
    },
  ],
};
```

Learn more about data validators in your SDKs on the [SDKs](/openapi-ts/output/sdk#validators) page.

## Output

The Zod plugin will generate the following artifacts, depending on the input specification.

## Requests

A single request schema is generated for each endpoint. It may contain a request body, parameters, and headers.

```ts
const zData = z.object({
  body: z
    .object({
      foo: z.string().optional(),
      bar: z.union([z.number(), z.null()]).optional(),
    })
    .optional(),
  path: z.object({
    baz: z.string(),
  }),
  query: z.never().optional(),
});
```

::: tip
If you need to access individual fields, you can do so using the [`.shape`](https://zod.dev/api?id=shape) API. For example, we can get the request body schema with `zData.shape.body`.
:::

You can customize the naming and casing pattern for requests using the `requests.name` and `requests.case` options.

## Responses

A single Zod schema is generated for all endpoint's responses. If the endpoint describes multiple responses, the generated schema is a union of all possible response shapes.

```ts
const zResponse = z.union([
  z.object({
    foo: z.string().optional(),
  }),
  z.object({
    bar: z.number().optional(),
  }),
]);
```

You can customize the naming and casing pattern for responses using the `responses.name` and `responses.case` options.

## Definitions

A Zod schema is generated for every reusable definition from your input.

```ts
const zFoo = z.number().int();

const zBar = z.object({
  bar: z.array(z.number().int()).optional(),
});
```

You can customize the naming and casing pattern for definitions using the `definitions.name` and `definitions.case` options.

## Metadata

It's often useful to associate a schema with some additional [metadata](https://zod.dev/metadata) for documentation, code generation, AI structured outputs, form validation, and other purposes. If this is your use case, you can set `metadata` to `true` to generate additional metadata about schemas.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      metadata: true, // [!code ++]
      name: 'zod',
    },
  ],
};
```

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
