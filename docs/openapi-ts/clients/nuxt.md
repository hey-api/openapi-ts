---
title: Nuxt v3 Client
description: Generate a type-safe Nuxt v3 client from OpenAPI with the Nuxt client for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>Nuxt<span class="sr-only"> v3</span></h1>
  <VersionLabel value="v3" />
</Heading>

::: warning
Nuxt client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[Nuxt](https://nuxt.com) is an open source framework that makes web development intuitive and powerful.

The Nuxt client for Hey API generates a type-safe client from your OpenAPI spec, fully compatible with validators, transformers, and all core features.

## Features

- Nuxt v3 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology
- support bundling inside the generated output

## Installation

Start by adding `@hey-api/nuxt` to your dependencies.

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

::: tip

If you add `@hey-api/nuxt` to your Nuxt modules, this step is not needed.

:::

## Configuration

The Nuxt client is built as a thin wrapper on top of Nuxt, extending its functionality to work with Hey API. If you're already familiar with Nuxt, configuring your client will feel like working directly with Nuxt.

When we installed the client above, it created a [`client.gen.ts`](/openapi-ts/output#client) file. You will most likely want to configure the exported `client` instance. There are two ways to do that.

### `setConfig()`

This is the simpler approach. You can call the `setConfig()` method at the beginning of your application or anytime you need to update the client configuration. You can pass any Nuxt configuration option to `setConfig()`, and even your own [`$fetch`](#custom-instance) implementation.

```js
import { client } from 'client/client.gen';

client.setConfig({
  baseURL: 'https://example.com',
});
```

The disadvantage of this approach is that your code may call the `client` instance before it's configured for the first time. Depending on your use case, you might need to use the second approach.

### Runtime API

Since `client.gen.ts` is a generated file, we can't directly modify it. Instead, we can tell our configuration to use a custom file implementing the Runtime API. We do that by specifying the `runtimeConfigPath` option.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-nuxt',
      runtimeConfigPath: './src/hey-api.ts', // [!code ++]
    },
  ],
};
```

In our custom file, we need to export a `createClientConfig()` method. This function is a simple wrapper allowing us to override configuration values.

::: code-group

```ts [hey-api.ts]
import type { CreateClientConfig } from './client/client.gen';

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
import { createClient } from './client/client';

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
import { client } from 'client/client.gen';

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
import { client } from 'client/client.gen';

client.setConfig({
  auth: () => '<my_token>', // [!code ++]
  baseURL: 'https://example.com',
});
```

If you're not using SDKs or generating auth, using interceptors is a common approach to configuring auth for each request.

```js
import { client } from 'client/client.gen';

client.setConfig({
  onRequest: ({ options }) => {
    options.headers.set('Authorization', 'Bearer <my_token>'); // [!code ++]
  },
});
```

## Server-Sent Events

When your OpenAPI spec defines endpoints with `text/event-stream` responses, the SDK generates SSE-enabled functions that return an async stream instead of a regular response.

::: warning
SSE endpoints always return `{ stream }` with an `AsyncGenerator`. The `composable` option (`useAsyncData`, `useFetch`, etc.) does not apply to SSE — it is designed for request-response patterns with caching. SSE streams are consumed client-side only.

Nuxt interceptors (`onRequest`, `onResponse`) are also not applied to SSE connections. The SSE client handles connections directly using the native Fetch API.
:::

### Consuming a stream

```js
import { watchStockPrices } from './client/sdk.gen';

const { stream } = await watchStockPrices();

for await (const event of stream) {
  console.log(event);
}
```

For more details on how to use the SSE-enabled functions, refer to the [SDK documentation](/openapi-ts/plugins/sdk#server-sent-events).

### Vue component example

With the `@hey-api/nuxt` module, SDK functions are auto-imported. Vue refs passed as parameters are automatically unwrapped.

```vue
<script setup lang="ts">
import { ref, onUnmounted } from 'vue';
// With @hey-api/nuxt, these imports are auto-generated:
import { watchSingleStock } from '#hey-api/sdk.gen';
import type { StockUpdate } from '#hey-api/types.gen';

const updates = ref<StockUpdate[]>([]);
const symbol = ref('AAPL');
let controller: AbortController | null = null;

onUnmounted(() => controller?.abort());

async function connect() {
  controller = new AbortController();

  const { stream } = await watchSingleStock({
    path: { symbol }, // Vue refs are unwrapped automatically
    signal: controller.signal,
  });

  for await (const event of stream) {
    updates.value.push(event);
  }
}
</script>

<template>
  <input v-model="symbol" />
  <button @click="connect">Connect</button>
  <ul>
    <li v-for="(update, i) in updates" :key="i">
      {{ update }}
    </li>
  </ul>
</template>
```

For more details on how to use the SSE-enabled functions, refer to the [SDK documentation](/openapi-ts/plugins/sdk#server-sent-events).

### Custom composable

For reusable SSE logic, extract a composable.

```ts
import { onUnmounted, ref } from 'vue';
import { watchStockPrices } from './client/sdk.gen';
import type { StockUpdate } from './client/types.gen';

export function useStockStream() {
  const updates = ref<StockUpdate[]>([]);
  const status = ref<'connected' | 'disconnected' | 'error'>('disconnected');
  let controller: AbortController | null = null;

  async function connect() {
    controller = new AbortController();
    status.value = 'connected';
    updates.value = [];

    try {
      const { stream } = await watchStockPrices({
        signal: controller.signal,
      });

      for await (const event of stream) {
        updates.value.push(event);
      }
    } catch {
      if (!controller?.signal.aborted) {
        status.value = 'error';
        return;
      }
    }
    status.value = 'disconnected';
  }

  function disconnect() {
    controller?.abort();
    controller = null;
    status.value = 'disconnected';
  }

  onUnmounted(() => disconnect());

  return { connect, disconnect, status, updates };
}
```

```vue
<script setup lang="ts">
import { useStockStream } from '~/composables/useStockStream';

const { updates, status, connect, disconnect } = useStockStream();
</script>
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

## Custom Instance

You can provide a custom `$fetch` instance. This is useful if you need to extend the default instance with extra functionality, or replace it altogether.

```js
import { client } from 'client/client.gen';

client.setConfig({
  $fetch: () => {
    /* custom `$fetch` method */
  },
});
```

You can use any of the approaches mentioned in [Configuration](#configuration), depending on how granular you want your custom instance to be.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/client-nuxt/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
