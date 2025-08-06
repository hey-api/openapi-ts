---
title: Axios client
description: Axios client for Hey API. Compatible with all our features.
---

<script setup lang="ts">
import { embedProject } from '../../embed'
</script>

<Heading>
  <h1>Axios</h1>
  <VersionLabel value="v1" />
</Heading>

### About

[Axios](https://axios-http.com) is a simple promise based HTTP client for the browser and Node.js. Axios provides a simple to use library in a small package with a very extensible interface.

### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-axios-example')(event)">
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

In your [configuration](/openapi-ts/get-started), add `@hey-api/client-axios` to your plugins and you'll be ready to generate client artifacts. :tada:

::: code-group

```js [config]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: ['@hey-api/client-axios'], // [!code ++]
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i https://get.heyapi.dev/hey-api/backend \
  -o src/client \
  -c @hey-api/client-axios # [!code ++]
```

:::

## Configuration

The Axios client is built as a thin wrapper on top of Axios, extending its functionality to work with Hey API. If you're already familiar with Axios, configuring your client will feel like working directly with Axios.

When we installed the client above, it created a [`client.gen.ts`](/openapi-ts/output#client) file. You will most likely want to configure the exported `client` instance. There are two ways to do that.

### `setConfig()`

This is the simpler approach. You can call the `setConfig()` method at the beginning of your application or anytime you need to update the client configuration. You can pass any Axios configuration option to `setConfig()` (except for `auth`), and even your own [Axios](#custom-axios) implementation.

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
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-axios',
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

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. Axios provides interceptors, please refer to their documentation on [interceptors](https://axios-http.com/docs/interceptors).

We expose the Axios instance through the `instance` field.

```js
import { client } from 'client/client.gen';

client.instance.interceptors.request.use((config) => {
  // do something
  return config;
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

client.instance.interceptors.request.use((config) => {
  config.headers.set('Authorization', 'Bearer <my_token>'); // [!code ++]
  return config;
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

## Custom `axios`

You can implement your own `axios` instance. This is useful if you need to extend the default `axios` instance with extra functionality, or replace it altogether.

```js
import axios from 'axios';
import { client } from 'client/client.gen';

// Customize the default axios instance
axios.defaults.baseURL = 'https://example.com';

client.setConfig({
  axios: axios,
});
```

or you can pass an `AxiosInstance` created with `axios.create()`:

```js
import axios from 'axios';
import { client } from 'client/client.gen';

const customAxiosInstance = axios.create({
  baseURL: 'https://example.com',
});

client.setConfig({
  axios: customAxiosInstance,
});
```

You can use any of the approaches mentioned in [Configuration](#configuration), depending on how granular you want your custom instance to be.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/client-axios/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
