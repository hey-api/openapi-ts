---
title: Angular v20 Client
description: Generate a type-safe Angular v20 client from OpenAPI with the Angular client for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import AuthorsList from '@components/AuthorsList.vue';
import Heading from '@components/Heading.vue';
import { maxScopp } from '@data/people.js';
import AngularVersionSwitcher from '@versions/AngularVersionSwitcher.vue';
</script>

<Heading>
  <h1>Angular<span class="sr-only"> 20</span></h1>
  <AngularVersionSwitcher />
</Heading>

::: warning
Angular client is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[Angular](https://angular.dev/) is a web framework that empowers developers to build fast, reliable applications.

The Angular client for Hey API generates a type-safe client from your OpenAPI spec, fully compatible with validators, transformers, and all core features.

### Collaborators

<AuthorsList :people="[maxScopp]" />

## Features

- Angular v20 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe response data and errors
- support for [`@Injectable()`](https://angular.dev/api/core/Injectable) decorators
- response data validation and transformation
- access to the original request and response
- granular request and response customization options
- minimal learning curve thanks to extending the underlying technology
- support bundling inside the generated output

## Installation

In your [configuration](/openapi-ts/get-started), add `@hey-api/client-angular` to your plugins and you'll be ready to generate client artifacts. :tada:

::: code-group

```js [config]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: ['@hey-api/client-angular'], // [!code ++]
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i https://get.heyapi.dev/hey-api/backend \
  -o src/client \
  -c @hey-api/client-angular # [!code ++]
```

:::

### Providers

You can use the Angular client in your application by adding `provideHeyApiClient` to your providers.

```ts
import { provideHeyApiClient, client } from './client/client.gen';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideHeyApiClient(client), // [!code ++]
  ],
};
```

## Configuration

The Angular client is built as a thin wrapper on top of Angular, extending its functionality to work with Hey API. If you're already familiar with Angular, configuring your client will feel like working directly with Angular.

When we installed the client above, it created a [`client.gen.ts`](/openapi-ts/output#client) file. You will most likely want to configure the exported `client` instance. There are two ways to do that.

### `setConfig()`

This is the simpler approach. You can call the `setConfig()` method at the beginning of your application or anytime you need to update the client configuration. You can pass any `HttpRequest` configuration option to `setConfig()`, and even your own [`httpClient`](#custom-httpclient) implementation.

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
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-angular',
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

## `@Injectable`

If you prefer to use the [`@Injectable()`](https://angular.dev/api/core/Injectable) decorators, set the `asClass` option in your SDK plugin to `true`.

::: code-group

```ts [example]
@Injectable({ providedIn: 'root' })
export class FooService {
  // class methods
}
```

```js [config]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    '@hey-api/client-angular',
    {
      name: '@hey-api/sdk',
      asClass: true, // [!code ++]
    },
  ],
};
```

:::

## Interceptors

::: warning
This section is under construction. We appreciate your patience.
:::

## Auth

::: warning
This section is under construction. We appreciate your patience.
:::

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

## Custom `httpClient`

You can implement your own `httpClient`. This is useful if you need to extend the default `httpClient` methods with extra functionality, or replace it altogether.

```js
import { client } from 'client/client.gen';

client.setConfig({
  httpClient: inject(CustomHttpClient),
});
```

You can use any of the approaches mentioned in [Configuration](#configuration), depending on how granular you want your custom client to be.

## Plugins

You might be also interested in the [Angular](/openapi-ts/plugins/angular) plugin.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/client-angular/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
