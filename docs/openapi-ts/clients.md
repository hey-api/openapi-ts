---
title: Clients
description: REST clients for your stack. Compatible with all our features.
---

<script setup>
import { embedProject } from '../embed'
</script>

# REST Clients

We all send HTTP requests in a slightly different way. Hey API doesn't force you to use any specific technology. What we do, however, is support your choice with great clients. All seamlessly integrated with our other features.

[Next.js](https://nextjs.org/) coming soon.

## Features

- seamless integration with `@hey-api/openapi-ts`
- typesafe response data and errors
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology
- support bundling inside the generated output

## Fetch API

::: warning
Fetch API client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

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

Ensure you have already [configured](/openapi-ts/get-started) `@hey-api/openapi-ts`. Update your configuration to use the Fetch API client package.

```js{2}
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

You can now run `openapi-ts` to use the new Fetch API client. 🎉

### Configuration

If you're using services, you will want to configure the internal client instance. You can do that with the `createClient()` method. Call it at the beginning of your application.

```js
import { createClient } from '@hey-api/client-fetch';

createClient({
  baseUrl: 'https://example.com',
});
```

### Interceptors

Another common requirement is request authorization. Interceptors are ideal for adding headers to your requests.

```js
import { client } from '@hey-api/client-fetch';

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer <my_token>');
  return request;
});
```

### Customization

Our Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality to work with Hey API. If you're already familiar with Fetch, customizing your client will feel like working directly with Fetch API. You can customize requests in three ways – globally, per client, or per request.

#### Global

This is the most common requirement. Our generated services consume an internal Fetch instance, so you will want to configure that.

```js
import { createClient } from '@hey-api/client-fetch';

createClient({
  baseUrl: 'https://example.com',
});
```

You can pass any Fetch API configuration option to `createClient()`, and even your own Fetch implementation.

#### Client

If you need to create a client instance pointing to a different domain, you can create a non-global client. This client will not be used by default by the generated services.

```js
import { createClient } from '@hey-api/client-fetch';

const myClient = createClient({
  baseUrl: 'https://example.com',
  global: false, // <-- create a non-global client
});
```

You can then pass this client to any generated service through the `client` option. This will override the default global instance.

```js
const response = await getFoo({
  client: myClient,
});
```

#### Request

Alternatively, you can pass the Fetch API configuration options to each service call directly. This is useful if you don't want to create a separate client for one-off use cases.

```js
const response = await getFoo({
  baseUrl: 'https://example.com', // <-- override global configuration
});
```

### Example

You can view a more complete example on this page.

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-example')(event)">
Live demo
</button>

## Axios

::: warning
Axios client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

Start by adding `@hey-api/client-axios` to your dependencies.

::: code-group

```sh [npm]
npm install @hey-api/client-axios
```

```sh [pnpm]
pnpm add @hey-api/client-axios
```

```sh [yarn]
yarn add @hey-api/client-axios
```

```sh [bun]
bun add @hey-api/client-axios
```

:::

Ensure you have already [configured](/openapi-ts/get-started) `@hey-api/openapi-ts`. Update your configuration to use the Axios client package.

```js{2}
export default {
  client: '@hey-api/client-axios',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

You can now run `openapi-ts` to use the new Axios client. 🎉

### Configuration

If you're using services, you will want to configure the internal client instance. You can do that with the `createClient()` method. Call it at the beginning of your application.

```js
import { createClient } from '@hey-api/client-axios';

createClient({
  baseURL: 'https://example.com',
});
```

### Interceptors

Another common requirement is request authorization. Interceptors are ideal for adding headers to your requests.

```js
import { client } from '@hey-api/client-axios';

client.instance.interceptors.request.use((config) => {
  config.headers.set('Authorization', 'Bearer <my_token>');
  return config;
});
```

### Customization

Our Axios client is built as a thin wrapper on top of Axios, extending its functionality to work with Hey API. If you're already familiar with Axios, customizing your client will feel like working directly with Axios. You can customize requests in three ways – globally, per client, or per request.

#### Global

This is the most common requirement. Our generated services consume an internal Axios instance, so you will want to configure that.

```js
import { createClient } from '@hey-api/client-axios';

createClient({
  baseURL: 'https://example.com',
});
```

You can pass any Axios configuration option to `createClient()`, and even your own Axios implementation.

#### Client

If you need to create a client instance pointing to a different domain, you can create a non-global client. This client will not be used by default by the generated services.

```js
import { createClient } from '@hey-api/client-axios';

const myClient = createClient({
  baseURL: 'https://example.com',
  global: false, // <-- create a non-global client
});
```

You can then pass this client to any generated service through the `client` option. This will override the default global instance.

```js
const response = await getFoo({
  client: myClient,
});
```

#### Request

Alternatively, you can pass the Axios configuration options to each service call directly. This is useful if you don't want to create a separate client for one-off use cases.

```js
const response = await getFoo({
  baseURL: 'https://example.com', // <-- override global configuration
});
```

### Example

You can view a more complete example on this page.

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-axios-example')(event)">
Live demo
</button>

## Bundling

Sometimes, you may not want to declare standalone clients as a dependency. This scenario is common if you're using Hey API to generate output that is repackaged and published for other consumers under your own brand. For such cases, our clients support bundling through the `client.bundle` configuration option.

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

## Legacy Clients

Before standalone client packages, clients were generated using `@hey-api/openapi-ts`. In fact, `@hey-api/openapi-ts` still supports generating legacy clients. You can generate them with the `client` config option.

::: code-group

```js{2} [fetch]
export default {
  client: 'fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [axios]
export default {
  client: 'axios',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [angular]
export default {
  client: 'angular',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [node]
export default {
  client: 'node',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [xhr]
export default {
  client: 'xhr',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

:::

The following legacy clients are available:

- [angular](https://angular.io/) (using [RxJS](https://rxjs.dev/))
- [axios](https://axios-http.com/)
- [fetch](https://developer.mozilla.org/docs/Web/API/Fetch_API)
- [node](https://nodejs.org/) (using [node-fetch](https://www.npmjs.com/package/node-fetch))
- [xhr](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest)

Please be aware that legacy clients are missing some key features:

- no typesafe errors 🚫
- no access to the original request and response 🚫
- hard to configure individual requests 👎
- inconsistent interceptors and response APIs 👎

If you'd like a standalone package for your client, let us know by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

::: tip
You might not need a `node` client. Fetch API is [experimental](https://nodejs.org/docs/latest-v18.x/api/globals.html#fetch) in Node.js v18 and [stable](https://nodejs.org/docs/latest-v21.x/api/globals.html#fetch) in Node.js v21. We recommend upgrading to the latest Node.js version.
:::

<!--@include: ../examples.md-->
