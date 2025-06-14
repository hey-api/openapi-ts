---
title: Valibot
description: Valibot plugin for Hey API. Compatible with all our features.
---

<!-- <script setup>
import { embedProject } from '../../embed'
</script> -->

# Valibot

::: warning
Valibot plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues/1474).
:::

### About

[Valibot](https://valibot.dev) is the open source schema library for TypeScript with bundle size, type safety and developer experience in mind.

<!-- ### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-valibot-example')(event)">
Launch demo
</button> -->

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- Valibot schemas for request payloads, parameters, and responses

## Installation

In your [configuration](/openapi-ts/get-started), add `valibot` to your plugins and you'll be ready to generate Valibot artifacts. :tada:

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    'valibot', // [!code ++]
  ],
};
```

### SDKs

To automatically validate response data in your SDKs, set `sdk.validator` to `true`.

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    'valibot',
    {
      name: '@hey-api/sdk', // [!code ++]
      validator: true, // [!code ++]
    },
  ],
};
```

## Output

The Valibot plugin will generate the following artifacts, depending on the input specification.

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

## Request Bodies

If an endpoint describes a request body, we will generate a Valibot schema representing its shape.

```ts
const vData = v.object({
  foo: v.optional(v.string()),
  bar: v.optional(v.union([v.number(), v.null()])),
});
```

## Parameters

A separate Valibot schema is generated for every request parameter.

```ts
const vParameterFoo = v.pipe(v.number(), v.integer());

const vParameterBar = v.string();
```

## Schemas

A separate Valibot schema is generated for every reusable schema.

```ts
const vFoo = v.pipe(v.number(), v.integer());

const vBar = v.object({
  bar: v.optional(v.union([v.array(v.unknown()), v.null()])),
});
```

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
