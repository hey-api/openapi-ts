---
title: Nuxt client
description: Nuxt client for Hey API. Compatible with all our features.
---

# Nuxt

::: warning
Nuxt client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

[Nuxt](https://nuxt.com/) is an open source framework that makes web development intuitive and powerful.

## Installation

Start by adding `@hey-api/client-nuxt` to your dependencies.

::: code-group

```sh [npm]
npm install @hey-api/client-nuxt
```

```sh [pnpm]
pnpm add @hey-api/client-nuxt
```

```sh [yarn]
yarn add @hey-api/client-nuxt
```

```sh [bun]
bun add @hey-api/client-nuxt
```

:::

In your [configuration](/openapi-ts/get-started), set `client` to `@hey-api/client-nuxt` and you'll be ready to use the Nuxt client. :tada:

::: code-group

```js [config]
export default {
  client: '@hey-api/client-nuxt', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -c @hey-api/client-nuxt \  # [!code ++]
  -i path/to/openapi.json \
  -o src/client
```

:::

## Configuration

If you're using SDKs, you will want to configure the internal client instance. You can do that with the `setConfig()` method. Call it at the beginning of your application.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  baseURL: 'https://example.com',
});
```

If you aren't using SDKs, you can create your own client instance.

```js
import { createClient } from '@hey-api/client-nuxt';

const client = createClient({
  baseURL: 'https://example.com',
});
```

## Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to your application. Nuxt provides interceptors through ofetch, please refer to their documentation on [$fetch](https://nuxt.com/docs/api/utils/dollarfetch).

You can pass any Nuxt/ofetch arguments to the client instance.

```js
import { client } from 'client/sdk.gen';

const result = await client.get({
  composable: '$fetch',
  onRequest: (context) => {
    // do something
  },
  url: '/foo',
});
```

## Customization

The Nuxt client is built as a thin wrapper on top of Nuxt, extending its functionality to work with Hey API. If you're already familiar with Nuxt, customizing your client will feel like working directly with Nuxt. You can customize requests in three ways – through SDKs, per client, or per request.

### SDKs

This is the most common requirement. The generated SDKs consume an internal client instance, so you will want to configure that.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  baseURL: 'https://example.com',
});
```

You can pass any Nuxt configuration option to `setConfig()`, and even your own `$fetch` implementation.

### Client

If you need to create a client pointing to a different domain, you can create your own client instance.

```js
import { createClient } from '@hey-api/client-nuxt';

const myClient = createClient({
  baseURL: 'https://example.com',
});
```

You can then pass this instance to any SDK function through the `client` option. This will override the internal instance.

```js
const response = await getFoo({
  client: myClient,
});
```

### Request

Alternatively, you can pass the Nuxt configuration options to each SDK function. This is useful if you don't want to create a client instance for one-off use cases.

```js
const response = await getFoo({
  baseURL: 'https://example.com', // <-- override internal configuration
});
```

## Auth

The SDKs include auth mechanisms for every endpoint. You will want to configure the `auth` field to pass the right token for each request. The `auth` field can be a string or a function returning a string representing the token. The returned value will be attached only to requests that require auth.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  auth: () => '<my_token>', // [!code ++]
  baseURL: 'https://example.com',
});
```

If you're not using SDKs or generating auth, using interceptors is a common approach to configuring auth for each request.

```js
import { client } from 'client/sdk.gen';

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

## Bundling

Sometimes, you may not want to declare client packages as a dependency. This scenario is common if you're using Hey API to generate output that is repackaged and published for other consumers under your own brand. For such cases, our clients support bundling through the `client.bundle` configuration option.

```js
export default {
  client: {
    bundle: true, // [!code ++]
    name: '@hey-api/client-nuxt',
  },
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
