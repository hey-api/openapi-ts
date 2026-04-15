---
title: Vite Plugin
description: Integrate @hey-api/openapi-ts into your Vite 5, 6, 7, or 8 build pipeline with the official Vite plugin.
---

# Vite

### About

[Vite](https://vite.dev) is a blazing fast frontend build tool powering the next generation of web applications.

The Vite plugin integrates `@hey-api/openapi-ts` into the Vite build pipeline, running automatically whenever Vite resolves its configuration – no separate script or manual step required.

## Features

- runs automatically as part of your Vite build
- reads your existing [configuration](/openapi-ts/get-started) (or accepts inline config)
- supports Vite 5, 6, 7, and 8

## Installation

You can download `@hey-api/vite-plugin` from npm using your favorite package manager.

::: code-group

```sh [npm]
npm add @hey-api/vite-plugin -D -E
```

```sh [pnpm]
pnpm add @hey-api/vite-plugin -D -E
```

```sh [yarn]
yarn add @hey-api/vite-plugin -D -E
```

```sh [bun]
bun add @hey-api/vite-plugin -D -E
```

:::

## Usage

Add the plugin to your `vite.config.ts`:

::: code-group

```ts [vite.config.ts]
import { heyApiPlugin } from '@hey-api/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [heyApiPlugin()],
});
```

:::

The plugin will automatically pick up your [configuration](/openapi-ts/configuration) file. You can also pass options inline using the `config` option:

::: code-group

```js [vite.config.ts]
import { heyApiPlugin } from '@hey-api/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    heyApiPlugin({
      config: {
        input: 'hey-api/backend', // sign up at app.heyapi.dev
        output: 'src/client',
      },
    }),
  ],
});
```

:::

## Vite Options

You can pass Vite Plugin API options using the `vite` option. For example, to run the plugin only during development:

::: code-group

```js [vite.config.ts]
import { heyApiPlugin } from '@hey-api/vite-plugin';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    heyApiPlugin({
      config: {
        input: 'hey-api/backend', // sign up at app.heyapi.dev
        output: 'src/client',
      },
      vite: {
        apply: 'serve',
      },
    }),
  ],
});
```

:::

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
