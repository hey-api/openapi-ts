---
title: Valibot
description: Valibot plugin for Hey API. Compatible with all our features.
---

# Valibot

::: warning
This feature is in development! :tada: Try it out and provide feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues/1474).
:::

### About

[Valibot](https://valibot.dev) is the open source schema library for TypeScript with bundle size, type safety and developer experience in mind.

<!-- ### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-valibot-example')(event)">
Launch demo
</button> -->

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- Valibot schemas for requests, responses, and reusable components

## Installation

In your [configuration](/openapi-ts/get-started), add `valibot` to your plugins and you'll be ready to generate Valibot artifacts. :tada:

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    'valibot', // [!code ++]
  ],
};
```

## SDKs

To automatically validate response data in your SDKs, set `sdk.validator` to `true`.

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
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

## Schemas

More information will be provided as we finalize the plugin.

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
