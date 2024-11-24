---
title: Configuration
description: Configure @hey-api/openapi-ts.
---

# Configuration

`@hey-api/openapi-ts` supports loading configuration from any file inside your project root folder supported by [jiti loader](https://github.com/unjs/c12?tab=readme-ov-file#-features). Below are the most common file formats.

::: code-group

```js [openapi-ts.config.ts]
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
});
```

```js [openapi-ts.config.cjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
module.exports = {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```js [openapi-ts.config.mjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

:::

Alternatively, you can use `openapi-ts.config.js` and configure the export statement depending on your project setup.

## Input

Input is the first thing you must define. It can be a local path, remote URL, or a string content resolving to an OpenAPI specification. Hey API supports all valid OpenAPI versions and file formats.

::: info
We use [`@apidevtools/json-schema-ref-parser`](https://github.com/APIDevTools/json-schema-ref-parser) to resolve file locations. Please note that accessing a HTTPS URL on localhost has a known [workaround](https://github.com/hey-api/openapi-ts/issues/276).
:::

## Filters

::: warning
To use this feature, you must opt in to the [experimental parser](#parser).
:::

If you work with large specifications and want to generate output from their subset, you can use regular expressions to select the relevant definitions. Set `input.include` to match resource references to be included or `input.exclude` to match resource references to be excluded. When both regular expressions match the same definition, `input.exclude` takes precedence over `input.include`.

::: code-group

```js [include]
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true, // [!code ++]
  input: {
    // match only the schema named `foo` and `GET` operation for the `/api/v1/foo` path // [!code ++]
    include: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code ++]
    path: 'path/to/openapi.json',
  },
  output: 'src/client',
};
```

```js [exclude]
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true, // [!code ++]
  input: {
    // match everything except for the schema named `foo` and `GET` operation for the `/api/v1/foo` path // [!code ++]
    exclude: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code ++]
    path: 'path/to/openapi.json',
  },
  output: 'src/client',
};
```

:::

## Output

Output is the next thing to define. It can be either a string pointing to the destination folder or a configuration object containing the destination folder path and optional settings (these are described below).

::: tip
You should treat the output folder as a dependency. Do not directly modify its contents as your changes might be erased when you run `@hey-api/openapi-ts` again.
:::

## Formatting

To format your output folder contents, set `output.format` to a valid formatter.

::: code-group

```js [disabled]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    format: false, // [!code ++]
    path: 'src/client',
  },
};
```

```js [prettier]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    format: 'prettier', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    format: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being formatted by adding your output path to the formatter's ignore file.

## Linting

To lint your output folder contents, set `output.lint` to a valid linter.

::: code-group

```js [disabled]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: false, // [!code ++]
    path: 'src/client',
  },
};
```

```js [eslint]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: 'eslint', // [!code ++]
    path: 'src/client',
  },
};
```

```js [biome]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: 'biome', // [!code ++]
    path: 'src/client',
  },
};
```

```js [oxlint]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: {
    lint: 'oxlint', // [!code ++]
    path: 'src/client',
  },
};
```

:::

You can also prevent your output from being linted by adding your output path to the linter's ignore file.

## Clients

Clients are responsible for sending the actual HTTP requests. The `client` value is not required, but you must define it if you're generating SDKs (enabled by default).

You can learn more on the [Clients](/openapi-ts/clients) page.

<!--
TODO: uncomment after c12 supports multiple configs
see https://github.com/unjs/c12/issues/92
-->
<!-- ### Multiple Clients

If you want to generate multiple clients with a single `openapi-ts` command, you can provide an array of configuration objects.

```js
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig([
  {
    client: 'legacy/fetch',
    input: 'path/to/openapi_one.json',
    output: 'src/client_one',
  },
  {
    client: 'legacy/axios',
    input: 'path/to/openapi_two.json',
    output: 'src/client_two',
  },
])
``` -->

## Plugins

Plugins are responsible for generating artifacts from your input. By default, Hey API will generate TypeScript interfaces, an SDK, and JSON Schemas from your OpenAPI specification. You can add, remove, or customize any of the plugins. In fact, we highly encourage you to do so!

You can learn more on the [Output](/openapi-ts/output) page.

## Parser

If you're using OpenAPI 3.0 or newer, we encourage you to try out the experimental parser. In the future it will become the default parser, but until it's been tested it's an opt-in feature. To try it out, set the `experimentalParser` flag in your configuration to `true`.

::: code-group

```js [config]
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true, // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```sh [cli]
npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client -c @hey-api/client-fetch -e
```

:::

The experimental parser produces a cleaner output while being faster than the legacy parser. It also supports features such as [Filters](#filters) and more will be added in the future.

The legacy parser will be used with the [legacy clients](/openapi-ts/clients/legacy) regardless of the `experimentalParser` flag value. However, it's unlikely to receive any further updates.

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/types/config.ts) interface.

<!--@include: ../examples.md-->
<!--@include: ../sponsorship.md-->
