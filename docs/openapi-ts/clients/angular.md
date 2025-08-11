---
title: Angular client
description: Angular client for Hey API. Compatible with all our features.
---

<script setup lang="ts">
import { embedProject } from '../../embed'
</script>

<Heading>
  <h1>Angular</h1>
  <VersionLabel value="v1" />
  <ExperimentalLabel />
</Heading>

### About

[Angular](https://angular.dev/) is a web framework for building fast, reliable applications.

::: warning Requirements
**Angular 19+** is required for full feature support, including the experimental `httpResource` API.
:::

::: tip First Release
Angular client support is in its first release. Share your feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

## Features

- Modern Angular patterns with signals and reactive programming
- Dependency injection with `@Injectable()` decorators
- Type-safe response data and errors
- Experimental **httpResource** support (Angular 19+)

## Usage

Add `@hey-api/client-angular` to your plugins:

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    '@hey-api/client-angular', // [!code ++]
  ],
};
```

After generating the client, integrate it with Angular's `HttpClient` by adding `provideHeyApiClient` to your app configuration:

```ts
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHeyApiClient, client } from './client/client.gen';

export const appConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideHeyApiClient(client), // [!code ++]
  ],
};
```

## Configuration

### Injectable Classes Configuration

You can configure the Angular client to generate injectable classes by setting the `asClass` option to `true` in your plugin configuration. This will generate Angular services with `@Injectable()` decorators, making them available for dependency injection.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-angular',
      asClass: true, // [!code ++]
    },
  ],
};
```

::: warning
While this feature is available, it is **discouraged** as it can negatively impact tree shaking, leading to larger bundle sizes. Consider using other configuration options for better optimization.
:::

### Angular Providers

Use `provideHeyApiClient` to integrate the generated client with Angular's `HttpClient`:

```ts
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHeyApiClient, client } from './client/client.gen';

export const appConfig = {
  providers: [provideHttpClient(withFetch()), provideHeyApiClient(client)],
};
```

### `createClient()`

Manually create a client instance for custom configurations:

```ts
import { createClient } from './client/client';

const myClient = createClient({
  baseUrl: 'https://example.com',
});
```

## Plugin Configuration

The `@hey-api/client-angular` plugin supports options like `throwOnError` for error handling:

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-angular',
      throwOnError: false,
    },
  ],
};
```

## httpResource

Angular 19 introduces a experimental api &ndash; `httpResource`, a reactive approach to data loading. Enable it with:

```js
export default {
  plugins: [
    {
      name: '@angular/common',
      httpResource: {
        enabled: true,
        asClass: true,
      },
    },
  ],
};
```
