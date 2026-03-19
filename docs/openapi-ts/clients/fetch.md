---
title: Fetch API Client
description: Generate a type-safe Fetch API client from OpenAPI with the Fetch API client for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import { embedProject } from '../../embed'
</script>

# Fetch API

### About

The [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API) provides an interface for fetching resources (including across the network). It is a more powerful and flexible replacement for XMLHttpRequest.

The Fetch API client for Hey API generates a type-safe client from your OpenAPI spec, fully compatible with validators, transformers, and all core features.

### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-example')(event)">
Launch demo
</button>

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology
- support bundling inside the generated output

## Installation

In your [configuration](/openapi-ts/get-started), add `@hey-api/client-fetch` to your plugins and you'll be ready to generate client artifacts. :tada:

::: code-group

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'], // [!code ++]
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i hey-api/backend \
  -o src/client \
  -c @hey-api/client-fetch # [!code ++]
```

:::

::: tip

This step is optional because Fetch is the default client.

:::

## Configuration

The Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality to work with Hey API. If you're already familiar with Fetch, configuring your client will feel like working directly with Fetch API.

When we installed the client above, it created a [`client.gen.ts`](/openapi-ts/output#client) file. You will most likely want to configure the exported `client` instance. There are two ways to do that.

### `setConfig()`

This is the simpler approach. You can call the `setConfig()` method at the beginning of your application or anytime you need to update the client configuration. You can pass any Fetch API configuration option to `setConfig()`, and even your own [Fetch](#custom-instance) implementation.

```js
import { client } from 'client/client.gen';

client.setConfig({
  baseUrl: 'https://example.com',
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
      name: '@hey-api/client-fetch',
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
  baseUrl: 'https://example.com',
});
```

:::

With this approach, `client.gen.ts` will call `createClientConfig()` before initializing the `client` instance. If needed, you can still use `setConfig()` to update the client configuration later.

### `createClient()`

You can also create your own client instance. You can use it to manually send requests or point it to a different domain.

```js
import { createClient } from './client/client';

const myClient = createClient({
  baseUrl: 'https://example.com',
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
  baseUrl: 'https://example.com', // <-- override default configuration
});
```

## Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application.

They can be added with `use`, removed with `eject`, and updated wth `update`. The `use` and `update` methods will return the ID of the interceptor for use with `eject` and `update`. Fetch API does not have the interceptor functionality, so we implement our own.

### Example: Request interceptor

::: code-group

```js [use]
import { client } from 'client/client.gen';

async function myInterceptor(request) {
  // do something
  return request;
}

interceptorId = client.interceptors.request.use(myInterceptor);
```

```js [eject]
import { client } from 'client/client.gen';

// eject by ID
client.interceptors.request.eject(interceptorId);

// eject by reference
client.interceptors.request.eject(myInterceptor);
```

```js [update]
import { client } from 'client/client.gen';

async function myNewInterceptor(request) {
  // do something
  return request;
}

// update by ID
client.interceptors.request.update(interceptorId, myNewInterceptor);

// update by reference
client.interceptors.request.update(myInterceptor, myNewInterceptor);
```

:::

### Example: Response interceptor

::: code-group

```js [use]
import { client } from 'client/client.gen';

async function myInterceptor(response) {
  // do something
  return response;
}

interceptorId = client.interceptors.response.use(myInterceptor);
```

```js [eject]
import { client } from 'client/client.gen';

// eject by ID
client.interceptors.response.eject(interceptorId);

// eject by reference
client.interceptors.response.eject(myInterceptor);
```

```js [update]
import { client } from 'client/client.gen';

async function myNewInterceptor(response) {
  // do something
  return response;
}

// update by ID
client.interceptors.response.update(interceptorId, myNewInterceptor);

// update by reference
client.interceptors.response.update(myInterceptor, myNewInterceptor);
```

:::

::: tip
To eject, you must provide the ID or reference of the interceptor passed to `use()`, the ID is the value returned by `use()` and `update()`.
:::

## Auth

The SDKs include auth mechanisms for every endpoint. You will want to configure the `auth` field to pass the right token for each request. The `auth` field can be a string or a function returning a string representing the token. The returned value will be attached only to requests that require auth.

```js
import { client } from 'client/client.gen';

client.setConfig({
  auth: () => '<my_token>', // [!code ++]
  baseUrl: 'https://example.com',
});
```

If you're not using SDKs or generating auth, using interceptors is a common approach to configuring auth for each request.

```js
import { client } from 'client/client.gen';

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer <my_token>'); // [!code ++]
  return request;
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

## Custom Instance

You can provide a custom `fetch` instance. This is useful if you need to extend the default instance with extra functionality, or replace it altogether.

```js
import { client } from 'client/client.gen';

client.setConfig({
  fetch: () => {
    /* custom `fetch` method */
  },
});
```

You can use any of the approaches mentioned in [Configuration](#configuration), depending on how granular you want your custom instance to be.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/client-fetch/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
