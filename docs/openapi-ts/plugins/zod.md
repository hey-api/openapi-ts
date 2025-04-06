---
title: Zod
description: Zod plugin for Hey API. Compatible with all our features.
---

# Zod

::: warning
This feature is in development! :tada: Try it out and provide feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues/876).
:::

### About

[Zod](https://zod.dev) is a TypeScript-first schema validation library with static type inference.

<!-- ### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-zod-example')(event)">
Launch demo
</button> -->

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- Zod schemas for requests, responses, and reusable components

## Installation

In your [configuration](/openapi-ts/get-started), add `zod` to your plugins and you'll be ready to generate Zod artifacts. :tada:

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    'zod', // [!code ++]
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
    'zod',
    {
      name: '@hey-api/sdk', // [!code ++]
      validator: true, // [!code ++]
    },
  ],
};
```

## Output

The Zod plugin will generate the following artifacts, depending on the input specification.

## Schemas

More information will be provided as we finalize the plugin.

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
