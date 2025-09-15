---
title: ofetch Client
description: Generate a type-safe ofetch client from OpenAPI with the ofetch client for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import { embedProject } from '../../embed'
</script>

# ofetch

### About

[ofetch](https://github.com/unjs/ofetch) is a lightweight wrapper around the Fetch API that adds useful defaults and features such as automatic response parsing, request/response hooks, and Node.js support.

The ofetch client for Hey API generates a type-safe client from your OpenAPI spec, fully compatible with validators, transformers, and all core features.

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe response data and errors
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology
- support bundling inside the generated output

## Installation

In your [configuration](/openapi-ts/get-started), add `@hey-api/client-ofetch` to your plugins and you'll be ready to generate client artifacts. :tada:

::: code-group

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: ['@hey-api/client-ofetch'], // [!code ++]
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i hey-api/backend \
  -o src/client \
  -c @hey-api/client-ofetch # [!code ++]
```

:::

## Configuration

The ofetch client is built as a thin wrapper on top of ofetch, extending its functionality to work with Hey API. If you're already familiar with ofetch, configuring your client will feel like working directly with ofetch.

When we installed the client above, it created a [`client.gen.ts`](/openapi-ts/output#client) file. You will most likely want to configure the exported `client` instance. There are two ways to do that.

### `setConfig()`

This is the simpler approach. You can call the `setConfig()` method at the beginning of your application or anytime you need to update the client configuration. You can pass any ofetch configuration option to `setConfig()` (including ofetch hooks), and even your own [ofetch](#custom-ofetch) instance.

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
      name: '@hey-api/client-ofetch',
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

The ofetch client supports two complementary options:

- Built-in interceptors exposed via `client.interceptors` (request/response/error) — same API across Hey API clients.
- Native ofetch hooks passed through config: `onRequest`, `onRequestError`, `onResponse`, `onResponseError`.

Below is an example request interceptor using the built-in API.

::: code-group

```js [use]
import { client } from 'client/client.gen';
// Supports async functions
async function myInterceptor(request) {
  // do something
  return request;
}
interceptorId = client.interceptors.request.use(myInterceptor);
```

```js [eject]
import { client } from 'client/client.gen';

// eject interceptor by interceptor id
client.interceptors.request.eject(interceptorId);

// eject interceptor by reference to interceptor function
client.interceptors.request.eject(myInterceptor);
```

```js [update]
import { client } from 'client/client.gen';

async function myNewInterceptor(request) {
  // do something
  return request;
}
// update interceptor by interceptor id
client.interceptors.request.update(interceptorId, myNewInterceptor);

// update interceptor by reference to interceptor function
client.interceptors.request.update(myInterceptor, myNewInterceptor);
```

:::

and an example response interceptor

::: code-group

```js [use]
import { client } from 'client/client.gen';
async function myInterceptor(response) {
  // do something
  return response;
}
// Supports async functions
interceptorId = client.interceptors.response.use(myInterceptor);
```

```js [eject]
import { client } from 'client/client.gen';

// eject interceptor by interceptor id
client.interceptors.response.eject(interceptorId);

// eject interceptor by reference to interceptor function
client.interceptors.response.eject(myInterceptor);
```

```js [update]
import { client } from 'client/client.gen';

async function myNewInterceptor(response) {
  // do something
  return response;
}
// update interceptor by interceptor id
client.interceptors.response.update(interceptorId, myNewInterceptor);

// update interceptor by reference to interceptor function
client.interceptors.response.update(myInterceptor, myNewInterceptor);
```

:::

You can also use native ofetch hooks by passing them in config:

```js
import { client } from 'client/client.gen';

client.setConfig({
  onRequest: ({ options }) => {
    // mutate ofetch options (headers, query, etc.)
  },
  onResponse: ({ response }) => {
    // inspect/transform the raw Response
  },
  onRequestError: (ctx) => {
    // handle request errors
  },
  onResponseError: (ctx) => {
    // handle response errors
  },
});
```

::: tip
To eject, you must provide the id or reference of the interceptor passed to `use()`, the id is the value returned by `use()` and `update()`.
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

or with ofetch hooks:

```js
import { client } from 'client/client.gen';

client.setConfig({
  onRequest: ({ options }) => {
    options.headers.set('Authorization', 'Bearer <my_token>'); // [!code ++]
  },
});
```

## SSE

The ofetch client supports Server‑Sent Events (SSE) via `client.sse.<method>`. Use this for streaming endpoints.

```ts
const result = await client.sse.get({
  url: '/events',
  onSseEvent(event) {
    // event.data (string) or parsed data, depending on server
  },
  onSseError(error) {
    // handle stream errors
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

## Custom `ofetch`

You can provide a custom ofetch instance. This is useful if you need to extend ofetch with extra functionality (hooks, retry behavior, etc.) or replace it altogether.

```js
import { ofetch } from 'ofetch';
import { client } from 'client/client.gen';

const $ofetch = ofetch.create({
  onRequest: ({ options }) => {
    // customize request
  },
  onResponse: ({ response }) => {
    // customize response
  },
});

client.setConfig({
  ofetch: $ofetch,
});
```

You can use any of the approaches mentioned in [Configuration](#configuration), depending on how granular you want your custom instance to be.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/client-ofetch/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
