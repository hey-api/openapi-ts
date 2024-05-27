---
title: Clients
description: REST clients for your stack. Compatible with all our features.
---

<script setup>
import { embedProject } from '../embed'
</script>

# REST Clients

We all send HTTP requests in a slightly different way. Hey API doesn't force you to use any specific technology. What we do, however, is support your choice with great clients. All seamlessly integrated with our other features.

[Next.js](https://nextjs.org/) and [Axios](https://axios-http.com/) coming soon.

## Features

- seamless integration with `@hey-api/openapi-ts`
- typesafe response data and errors
- access to the original request and response
- each request call is configurable
- minimal learning curve thanks to extending the underlying technology

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

You will most likely want to configure the global client instance used by services. You can do that with the `createClient()` method. Call it at the beginning of your application.

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

### Example

You can view a more complete example on this page.

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-example')(event)">
Live demo
</button>

## Legacy Clients

Before standalone client packages, clients were generated using `@hey-api/openapi-ts`. In fact, `@hey-api/openapi-ts` still generates a legacy Fetch API client by default. You can generate other legacy clients with the `client` config option.

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

Please be aware that legacy clients are missing some features:

- no typesafe errors 🚫
- no access to the original request and response 🚫
- hard to configure individual requests 👎
- inconsistent interceptors and response APIs 👎

If you'd like a standalone package for your client, let us know by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

::: tip
You might not need a `node` client. Fetch API is [experimental](https://nodejs.org/docs/latest-v18.x/api/globals.html#fetch) in Node.js v18 and [stable](https://nodejs.org/docs/latest-v21.x/api/globals.html#fetch) in Node.js v21. We recommend upgrading to the latest Node.js version.
:::

<!--@include: ../examples.md-->
