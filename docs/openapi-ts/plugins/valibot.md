---
title: Valibot
description: Valibot plugin for Hey API. Compatible with all our features.
---

<!-- <script setup lang="ts">
import { embedProject } from '../../embed'
</script> -->

<Heading>
  <h1>Valibot</h1>
  <VersionLabel value="v1" />
</Heading>

### About

[Valibot](https://valibot.dev) is the open source schema library for TypeScript with bundle size, type safety and developer experience in mind.

<!-- ### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-valibot-example')(event)">
Launch demo
</button> -->

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- Valibot schemas for requests, responses, and reusable definitions

## Installation

In your [configuration](/openapi-ts/get-started), add `valibot` to your plugins and you'll be ready to generate Valibot artifacts. :tada:

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    'valibot', // [!code ++]
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
    'valibot',
    {
      name: '@hey-api/sdk', // [!code ++]
      validator: true, // [!code ++]
    },
  ],
};
```

Learn more about data validators in your SDKs on the [SDKs](/openapi-ts/output/sdk#validators) page.

## Output

The Valibot plugin will generate the following artifacts, depending on the input specification.

## Requests

A single request schema is generated for each endpoint. It may contain a request body, parameters, and headers.

```ts
const vData = v.object({
  body: v.optional(
    v.object({
      foo: v.optional(v.string()),
      bar: v.optional(v.union([v.number(), v.null()])),
    }),
  ),
  path: v.object({
    baz: v.string(),
  }),
  query: v.optional(v.never()),
});
```

::: tip
If you need to access individual fields, you can do so using the [`.entries`](https://valibot.dev/api/object/) API. For example, we can get the request body schema with `vData.entries.body`.
:::

You can customize the naming and casing pattern for `requests` schemas using the `.name` and `.case` options.

## Responses

A single Valibot schema is generated for all endpoint's responses. If the endpoint describes multiple responses, the generated schema is a union of all possible response shapes.

```ts
const vResponse = v.union([
  v.object({
    foo: v.optional(v.string()),
  }),
  v.object({
    bar: v.optional(v.number()),
  }),
]);
```

You can customize the naming and casing pattern for `responses` schemas using the `.name` and `.case` options.

## Definitions

A Valibot schema is generated for every reusable definition from your input.

```ts
const vFoo = v.pipe(v.number(), v.integer());

const vBar = v.object({
  bar: v.optional(v.array(v.pipe(v.number(), v.integer()))),
});
```

You can customize the naming and casing pattern for `definitions` schemas using the `.name` and `.case` options.

## Metadata

It's often useful to associate a schema with some additional [metadata](https://valibot.dev/api/metadata/) for documentation, code generation, AI structured outputs, form validation, and other purposes. If this is your use case, you can set `metadata` to `true` to generate additional metadata about schemas.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      metadata: true, // [!code ++]
      name: 'valibot',
    },
  ],
};
```

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/valibot/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
