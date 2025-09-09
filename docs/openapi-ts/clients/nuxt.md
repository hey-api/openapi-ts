---
title: Nuxt Client
description: Generate a type-safe Nuxt client from OpenAPI with the Nuxt client for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>Nuxt</h1>
</Heading>

::: warning
Nuxt client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[Nuxt](https://nuxt.com) is an open source framework that makes web development intuitive and powerful.

The Nuxt client for Hey API generates a type-safe client from your OpenAPI spec, fully compatible with validators, transformers, and all core features.

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology
- support bundling inside the generated output

## Installation

### Automatic installation

Start by installing the `@hey-api/nuxt` Nuxt module.

::: code-group

```sh [npm]
npx nuxi module add @hey-api/nuxt
```

```sh [pnpm]
pnpx nuxi module add @hey-api/nuxt
```

```sh [yarn]
yarn dlx nuxi module @hey-api/nuxt
```

```sh [bun]
bunx nuxi module add @hey-api/nuxt
```

:::

### Manual installation

Add `@hey-api/nuxt` to your dependencies.

::: code-group

```sh [npm]
npm install @hey-api/nuxt
```

```sh [pnpm]
pnpm add @hey-api/nuxt
```

```sh [yarn]
yarn add @hey-api/nuxt
```

```sh [bun]
bun add @hey-api/nuxt
```

:::

Then, add it to the `modules` in your `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: [
    '@hey-api/nuxt', // [!code ++]
  ],
});
```

## Getting started

Set an [input](/openapi-ts/configuration/input) within `nuxt.config.ts`, then start the Nuxt dev server.

```ts
export default defineNuxtConfig({
  heyApi: {
    config: {
      input: './path/to/openapi.json', // [!code ++]
    },
  },
});
```

The generated client can be accessed from `#hey-api/`.

```ts
import { client } from '#hey-api/client.gen';
```

::: tip

The `@hey-api/client-nuxt` plugin is automatically added.

:::

### Options

### `alias`

Configure an [alias](https://nuxt.com/docs/api/nuxt-config#alias) to access the Hey API client.

Defaults to `#hey-api`

### `autoImports`

Adds the generated SDK items to auto imports. Defaults to `true`.

#### `config`

Configuration to pass to `@hey-api/openapi-ts`.

- [input](/openapi-ts/configuration/input)
- [output](/openapi-ts/configuration/output)
  - Defaults to `.nuxt/client`
- [parser](/openapi-ts/configuration/parser)
- [plugins](/openapi-ts/transformers)

## Configuration

When we configured the Nuxt module above, it created a [`client.gen.ts`](/openapi-ts/output#client) file. You will most likely want to configure the exported `client` instance. There are two ways to do that.

The Nuxt client is built as a thin wrapper on top of Nuxt, extending its functionality to work with Hey API. If you're already familiar with Nuxt, configuring your client will feel like working directly with Nuxt.

### `setConfig()`

This is the simpler approach. You can call the `setConfig()` method at the beginning of your application or anytime you need to update the client configuration. You can pass any Nuxt configuration option to `setConfig()`, and even your own [`$fetch`](#custom-fetch) implementation.

::: code-group

```vue [app.vue]
<script setup lang="ts">
import { client } from '#hey-api/client.gen';

await callOnce(async () => {
  client.setConfig({
    baseURL: 'https://example.com',
  });
});
</script>
```

:::

The disadvantage of this approach is that your code may call the `client` instance before it's configured for the first time. Depending on your use case, you might need to use the second approach.

### Runtime API

Since `client.gen.ts` is a generated file, we can't directly modify it. Instead, we can tell our configuration to use a custom file implementing the Runtime API. We do that by specifying the `runtimeConfigPath` option.

::: code-group

```ts [nuxt]
export default defineNuxtConfig({
  heyApi: {
    config: {
      input: 'hey-api/backend', // sign up at app.heyapi.dev
      plugins: [
        {
          name: '@hey-api/client-nuxt',
          runtimeConfigPath: './shared/lib/hey-api.ts', // [!code ++]
        },
      ],
    },
  },
});
```

```js [standalone]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-nuxt',
      runtimeConfigPath: './shared/lib/hey-api.ts', // [!code ++]
    },
  ],
};
```

:::

In our custom file, we need to export a `createClientConfig()` method. This function is a simple wrapper allowing us to override configuration values.

::: code-group

```ts [hey-api.ts]
import type { CreateClientConfig } from '#hey-api/client.gen';

export const createClientConfig: CreateClientConfig = (config) => ({
  ...config,
  baseURL: 'https://example.com',
});
```

:::

With this approach, `client.gen.ts` will call `createClientConfig()` before initializing the `client` instance. If needed, you can still use `setConfig()` to update the client configuration later.

### `createClient()`

You can also create your own client instance. You can use it to manually send requests or point it to a different domain.

```js
import { createClient } from '#hey-api/client';

const myClient = createClient({
  baseURL: 'https://example.com',
});
```

You can also pass this instance to any SDK function through the `client` option. This will override the default instance from `client.gen.ts`.

```js
const response = await getFoo({
  client: myClient,
});
```

### SDKs

Alternatively, you can pass the client configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```js
const response = await getFoo({
  baseURL: 'https://example.com', // <-- override default configuration
});
```

## Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. Nuxt provides interceptors through ofetch, please refer to their documentation on [$fetch](https://nuxt.com/docs/api/utils/dollarfetch).

You can pass any Nuxt/ofetch arguments to the client instance.

::: tip
If you omit `composable`, `$fetch` is used by default.
:::

```js
import { client } from '#hey-api/client.gen';

const result = await client.get({
  composable: '$fetch',
  onRequest: (context) => {
    // do something
  },
  url: '/foo',
});
```

## Auth

The SDKs include auth mechanisms for every endpoint. You will want to configure the `auth` field to pass the right token for each request. The `auth` field can be a string or a function returning a string representing the token. The returned value will be attached only to requests that require auth.

```js
import { client } from '#hey-api/client.gen';

client.setConfig({
  auth: () => '<my_token>', // [!code ++]
  baseURL: 'https://example.com',
});
```

If you're not using SDKs or generating auth, using interceptors is a common approach to configuring auth for each request.

```js
import { client } from '#hey-api/client.gen';

client.setConfig({
  onRequest: ({ options }) => {
    options.headers.set('Authorization', 'Bearer <my_token>'); // [!code ++]
  },
});
```

## Build URL

If you need to access the compiled URL, you can use the `buildUrl()` method. It's loosely typed by default to accept almost any value; in practice, you will want to pass a type hint.

```ts
type FooData = {
  path: {
    fooId: number;
  };
  query?: {
    bar?: string;
  };
  url: '/foo/{fooId}';
};

const url = client.buildUrl<FooData>({
  path: {
    fooId: 1,
  },
  query: {
    bar: 'baz',
  },
  url: '/foo/{fooId}',
});
console.log(url); // prints '/foo/1?bar=baz'
```

## Custom `$fetch`

You can implement your own `$fetch` method. This is useful if you need to extend the default `$fetch` method with extra functionality, or replace it altogether.

```js
import { client } from '#hey-api/client.gen';

client.setConfig({
  $fetch: () => {
    /* custom `$fetch` method */
  },
});
```

You can use any of the approaches mentioned in [Configuration](#configuration), depending on how granular you want your custom method to be.

## Standalone usage

You can generate the Hey API Nuxt client via the CLI instead of the Nuxt module.

In your [configuration](/openapi-ts/get-started), add `@hey-api/client-nuxt` to your plugins and you'll be ready to generate client artifacts. :tada:

::: code-group

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: ['@hey-api/client-nuxt'], // [!code ++]
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i hey-api/backend \
  -o src/client \
  -c @hey-api/client-nuxt # [!code ++]
```

:::

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/client-nuxt/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
