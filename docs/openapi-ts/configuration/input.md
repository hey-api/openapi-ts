---
title: Input
description: Configure @hey-api/openapi-ts.
---

# Input

You must set the input so we can load your OpenAPI specification.

## Input

Input can be a path or URL, object containing a path or URL, or an object representing an OpenAPI specification. Hey API supports all valid OpenAPI versions and file formats.

::: code-group

```js [path]
export default {
  input: './path/to/openapi.json', // [!code ++]
};
```

```js [url]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend', // [!code ++]
};
```

<!-- prettier-ignore-start -->
```js [object]
export default {
  input: { // [!code ++]
    path: 'https://get.heyapi.dev/hey-api/backend', // [!code ++]
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

### ReadMe API Registry

You can use ReadMe API Registry UUIDs to fetch OpenAPI specifications directly from ReadMe's platform. This is useful when API providers use ReadMe as their source of truth for API documentation.

::: code-group

```js [simple format]
export default {
  input: 'readme:abc123def456', // [!code ++]
};
```

```js [full format]
export default {
  input: 'readme:@organization/project#abc123def456', // [!code ++]
};
```

```js [object format]
export default {
  input: {
    path: 'readme:abc123def456', // [!code ++]
    // ...other options
  },
};
```

:::

The ReadMe input formats are:

- `readme:uuid` - Simple format using only the UUID
- `readme:@organization/project#uuid` - Full format including organization and project names

Both formats will fetch the OpenAPI specification from `https://dash.readme.com/api/v1/api-registry/{uuid}`.

### Hey API Platform options

You might want to use the [Hey API Platform](/openapi-ts/integrations) to store your specifications. If you do so, the `input` object provides options to help with constructing the correct URL.

```js
export default {
  input: {
    path: 'https://get.heyapi.dev/',
    branch: 'main', // [!code ++]
    project: 'backend', // [!code ++]
  },
};
```

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

## Watch Mode

::: warning
Watch mode currently supports only remote files via URL.
:::

If your schema changes frequently, you may want to automatically regenerate the output during development. To watch your input file for changes, enable `input.watch` mode in your configuration or pass the `--watch` flag to the CLI.

::: code-group

```js [config]
export default {
  input: {
    path: 'https://get.heyapi.dev/hey-api/backend',
    watch: true, // [!code ++]
  },
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i https://get.heyapi.dev/hey-api/backend \
  -o src/client \
  -w  # [!code ++]
```

:::

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
