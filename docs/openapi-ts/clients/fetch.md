---
title: Fetch API client
description: Fetch API client for Hey API. Compatible with all our features.
---

<script setup>
import { embedProject } from '../../embed'
</script>

# Fetch API

::: warning
Fetch API client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

The [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API) provides an interface for fetching resources (including across the network). It is a more powerful and flexible replacement for XMLHttpRequest.

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-example')(event)">
Live demo
</button>

## Installation

Start by adding `@hey-api/client-fetch` to your dependencies.

::: code-group

```sh [npm]
npm install @hey-api/client-fetch
```

```sh [pnpm]
pnpm add @hey-api/client-fetch
```

```sh [yarn]
yarn add @hey-api/client-fetch
```

```sh [bun]
bun add @hey-api/client-fetch
```

:::

In your [configuration](/openapi-ts/get-started), set `client` to `@hey-api/client-fetch` and you'll be ready to use the Fetch API client. :tada:

::: code-group

```js [config]
export default {
  client: '@hey-api/client-fetch', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -c @hey-api/client-fetch \  # [!code ++]
  -i path/to/openapi.json \
  -o src/client
```

:::

## Configuration

If you're using SDKs, you will want to configure the internal client instance. You can do that with the `setConfig()` method. Call it at the beginning of your application.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  baseUrl: 'https://example.com',
});
```

If you aren't using SDKs, you can create your own client instance.

```js
import { createClient } from '@hey-api/client-fetch';

const client = createClient({
  baseUrl: 'https://example.com',
});
```

## Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. They can be added with `use` and removed with `eject`. Fetch API does not have the interceptor functionality, so we implement our own. Below is an example request interceptor

::: code-group

```js [use]
import { client } from 'client/sdk.gen';

client.interceptors.request.use((request) => {
  // do something
  return request;
});
```

```js [eject]
import { client } from 'client/sdk.gen';

client.interceptors.request.eject((request) => {
  // do something
  return request;
});
```

:::

and an example response interceptor

::: code-group

```js [use]
import { client } from 'client/sdk.gen';

client.interceptors.response.use((response) => {
  // do something
  return response;
});
```

```js [eject]
import { client } from 'client/sdk.gen';

client.interceptors.response.eject((response) => {
  // do something
  return response;
});
```

:::

::: tip
To eject, you must provide a reference to the function that was passed to `use()`.
:::

## Customization

The Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality to work with Hey API. If you're already familiar with Fetch, customizing your client will feel like working directly with Fetch API. You can customize requests in three ways – through SDKs, per client, or per request.

### SDKs

This is the most common requirement. The generated SDKs consume an internal client instance, so you will want to configure that.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  baseUrl: 'https://example.com',
});
```

You can pass any Fetch API configuration option to `setConfig()`, and even your own Fetch implementation.

### Client

If you need to create a client pointing to a different domain, you can create your own client instance.

```js
import { createClient } from '@hey-api/client-fetch';

const myClient = createClient({
  baseUrl: 'https://example.com',
});
```

You can then pass this instance to any SDK function through the `client` option. This will override the internal instance.

```js
const response = await getFoo({
  client: myClient,
});
```

### Request

Alternatively, you can pass the Fetch API configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```js
const response = await getFoo({
  baseUrl: 'https://example.com', // <-- override internal configuration
});
```

## Auth

::: warning
To use this feature, you must opt in to the [experimental parser](/openapi-ts/configuration#parser).
:::

The SDKs include auth mechanisms for every endpoint. You will want to configure the `auth` field to pass the right token for each request. The `auth` field can be a string or a function returning a string representing the token. The returned value will be attached only to requests that require auth.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  auth: () => '<my_token>', // [!code ++]
  baseUrl: 'https://example.com',
});
```

If you're not using SDKs or generating auth, using interceptors is a common approach to configuring auth for each request.

```js
import { client } from 'client/sdk.gen';

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer <my_token>'); // [!code ++]
  return request;
});
```

## Build URL

::: warning
To use this feature, you must opt in to the [experimental parser](/openapi-ts/configuration#parser).
:::

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

## Bundling

Sometimes, you may not want to declare client packages as a dependency. This scenario is common if you're using Hey API to generate output that is repackaged and published for other consumers under your own brand. For such cases, our clients support bundling through the `client.bundle` configuration option.

```js
export default {
  client: {
    bundle: true, // [!code ++]
    name: '@hey-api/client-fetch',
  },
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
