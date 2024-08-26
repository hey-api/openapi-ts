---
title: Fetch API client
description: Fetch API client for your stack. Compatible with all our features.
---

<script setup>
import { embedProject } from '../../embed'
</script>

# Fetch API

::: warning
Fetch API client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

Plug and play Fetch API wrapper for `@hey-api/openapi-ts` generator.

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

Ensure you have already [configured](/openapi-ts/get-started) `@hey-api/openapi-ts`. Update your configuration to use the Fetch API client package.

```js
export default {
  client: '@hey-api/client-fetch', // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

You can now run `openapi-ts` to use the new Fetch API client. 🎉

## Configuration

If you're using services, you will want to configure the internal client instance. You can do that with the `setConfig()` method. Call it at the beginning of your application.

```js
import { client } from 'client/services.gen';

client.setConfig({
  baseUrl: 'https://example.com',
});
```

If you aren't using services, you can create your own client instance.

```js
import { createClient } from '@hey-api/client-fetch';

const client = createClient({
  baseUrl: 'https://example.com',
});
```

## Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to the rest of your application. Fetch API does not have the interceptor functionality, so we implement our own. Below is an example request interceptor

::: code-group

```js [use]
import { client } from 'client/services.gen';

client.interceptors.request.use((request, options) => {
  request.headers.set('Authorization', 'Bearer <my_token>');
  return request;
});
```

```js [eject]
import { client } from 'client/services.gen';

client.interceptors.request.eject((request, options) => {
  request.headers.set('Authorization', 'Bearer <my_token>');
  return request;
});
```

:::

and an example response interceptor

::: code-group

```js [use]
import { client } from 'client/services.gen';

client.interceptors.response.use((response, request, options) => {
  trackAnalytics(response);
  return response;
});
```

```js [eject]
import { client } from 'client/services.gen';

client.interceptors.response.eject((response, request, options) => {
  trackAnalytics(response);
  return response;
});
```

:::

::: tip
To eject, you must provide a reference to the function that was passed to `use()`.
:::

## Customization

Our Fetch client is built as a thin wrapper on top of Fetch API, extending its functionality to work with Hey API. If you're already familiar with Fetch, customizing your client will feel like working directly with Fetch API. You can customize requests in three ways – through services, per client, or per request.

### Services

This is the most common requirement. Our generated services consume an internal Fetch instance, so you will want to configure that.

```js
import { client } from 'client/services.gen';

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

You can then pass this instance to any generated service through the `client` option. This will override the internal instance.

```js
const response = await getFoo({
  client: myClient,
});
```

### Request

Alternatively, you can pass the Fetch API configuration options to each service call directly. This is useful if you don't want to create a separate client for one-off use cases.

```js
const response = await getFoo({
  baseUrl: 'https://example.com', // <-- override internal configuration
});
```

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

<!--@include: ../../examples.md-->
<!--@include: ../../sponsorship.md-->
