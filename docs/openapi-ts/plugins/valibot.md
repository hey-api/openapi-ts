---
title: Valibot v1 Plugin
description: Generate Valibot v1 schemas from OpenAPI with the Valibot plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>Valibot<span class="sr-only"> v1</span></h1>
  <VersionLabel value="v1" />
</Heading>

### About

[Valibot](https://valibot.dev) is the open source schema library for TypeScript with bundle size, type safety and developer experience in mind.

The Valibot plugin for Hey API generates schemas from your OpenAPI spec, fully compatible with validators, transformers, and all core features.

## Features

- Valibot v1 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- Valibot schemas for requests, responses, and reusable definitions
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add `valibot` to your plugins and you'll be ready to generate Valibot artifacts. :tada:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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

::: code-group

```ts [example]
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

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'valibot',
      requests: true, // [!code ++]
    },
  ],
};
```

:::

::: tip
If you need to access individual fields, you can do so using the [`.entries`](https://valibot.dev/api/object/) API. For example, we can get the request body schema with `vData.entries.body`.
:::

You can customize the naming and casing pattern for `requests` schemas using the `.name` and `.case` options.

## Responses

A single Valibot schema is generated for all endpoint's responses. If the endpoint describes multiple responses, the generated schema is a union of all possible response shapes.

::: code-group

```ts [example]
const vResponse = v.union([
  v.object({
    foo: v.optional(v.string()),
  }),
  v.object({
    bar: v.optional(v.number()),
  }),
]);
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'valibot',
      responses: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `responses` schemas using the `.name` and `.case` options.

## Definitions

A Valibot schema is generated for every reusable definition from your input.

::: code-group

```ts [example]
const vFoo = v.pipe(v.number(), v.integer());

const vBar = v.object({
  bar: v.optional(v.array(v.pipe(v.number(), v.integer()))),
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'valibot',
      definitions: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `definitions` schemas using the `.name` and `.case` options.

## Metadata

It's often useful to associate a schema with some additional [metadata](https://valibot.dev/api/metadata/) for documentation, code generation, AI structured outputs, form validation, and other purposes. If this is your use case, you can set `metadata` to `true` to generate additional metadata about schemas.

::: code-group

```ts [example]
export const vFoo = v.pipe(
  v.string(),
  v.metadata({
    description: 'Additional metadata',
  }),
);
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'valibot',
      metadata: true, // [!code ++]
    },
  ],
};
```

:::

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/valibot/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
