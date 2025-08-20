---
title: Input
description: Configure @hey-api/openapi-ts.
---

# Input

You must provide an input so we can load your OpenAPI specification.

## Input

The input can be a string path, URL, API registry shorthand, an object containing any of these, or an object representing an OpenAPI specification. Hey API supports all valid OpenAPI versions and file formats.

::: code-group

```js [path]
export default {
  input: './path/to/openapi.json', // [!code ++]
};
```

```js [url]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend', // sign up at app.heyapi.dev // [!code ++]
};
```

```js [registry]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev // [!code ++]
};
```

<!-- prettier-ignore-start -->
```js [object]
export default {
  input: { // [!code ++]
    path: 'hey-api/backend', // sign up at app.heyapi.dev // [!code ++]
    // ...other options // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [spec]
export default {
  input: { // [!code ++]
    openapi: '3.1.1', // [!code ++]
    // ...rest of your spec // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

::: info
If you use an HTTPS URL with a self-signed certificate in development, you will need to set [`NODE_TLS_REJECT_UNAUTHORIZED=0`](https://github.com/hey-api/openapi-ts/issues/276#issuecomment-2043143501) in your environment.
:::

### Request options

You can pass any valid Fetch API [options](https://developer.mozilla.org/docs/Web/API/RequestInit) to the request for fetching your specification. This is useful if your file is behind auth for example.

<!-- prettier-ignore-start -->
```js
export default {
  input: {
    path: 'https://secret.com/protected-spec',
    fetch: { // [!code ++]
      headers: { // [!code ++]
        Authorization: 'Bearer xxx', // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  },
};
```
<!-- prettier-ignore-end -->

## API Registry

You can store your specifications in an API registry to serve as a single source of truth. This helps prevent drift, improves discoverability, enables version tracking, and more.

### Hey API

You can learn more about [Hey API Platform](https://app.heyapi.dev) on the [Integrations](/openapi-ts/integrations) page.

```js [uuid]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev // [!code ++]
};
```

The `input` object lets you provide additional options to construct the correct URL.

```js
export default {
  input: {
    path: 'hey-api/backend', // sign up at app.heyapi.dev
    branch: 'main', // [!code ++]
  },
};
```

We also provide shorthands for other registries:

::: details Scalar
Prefix your input with `scalar:` to use the Scalar API Registry.

```js [long]
export default {
  input: 'scalar:@scalar/access-service', // [!code ++]
};
```

:::

::: details ReadMe
Prefix your input with `readme:` to use the ReadMe API Registry.

::: code-group

```js [uuid]
export default {
  input: 'readme:nysezql0wwo236', // [!code ++]
};
```

```js [long]
export default {
  input: 'readme:@developers/v2.0#nysezql0wwo236', // [!code ++]
};
```

:::

## Watch Mode

::: warning
Watch mode currently supports only remote files via URL.
:::

If your schema changes frequently, you may want to automatically regenerate the output during development. To watch your input file for changes, enable `input.watch` mode in your configuration or pass the `--watch` flag to the CLI.

::: code-group

```js [config]
export default {
  input: {
    path: 'hey-api/backend', // sign up at app.heyapi.dev
    watch: true, // [!code ++]
  },
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i hey-api/backend \
  -o src/client \
  -w  # [!code ++]
```

:::

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
