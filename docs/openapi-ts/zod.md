---
title: Zod
description: Zod plugin for Hey API. Compatible with all our features.
---

# Zod

::: warning
Zod plugin is in development. You can follow the updates and provide feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues/876).
:::

[Zod](https://zod.dev/) is a TypeScript-first schema validation library with static type inference.

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-zod-example')(event)">
Live demo
</button>

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- Zod schemas for requests, responses, and reusable components

## Installation

::: warning
Zod plugin works only with the [experimental parser](/openapi-ts/configuration#parser) which is currently an opt-in feature.
:::

Ensure you have already [configured](/openapi-ts/get-started) `@hey-api/openapi-ts`. Update your configuration to use the Zod plugin.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true, // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    // ...other plugins
    'zod', // [!code ++]
  ],
};
```

You can now generate Zod artifacts. 🎉

## Output

The Zod plugin will generate the following artifacts, depending on the input specification.

## Schemas

More information will be provided as we finalize the plugin.

<!--@include: ../examples.md-->
<!--@include: ../sponsorship.md-->
