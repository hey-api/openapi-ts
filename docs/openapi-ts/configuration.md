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
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
});
```

```js [openapi-ts.config.cjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
module.exports = {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [openapi-ts.config.mjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

Alternatively, you can use `openapi-ts.config.js` and configure the export statement depending on your project setup.

## Input

Input is the first thing you must define. It can be a path, URL, or a string content resolving to an OpenAPI specification. Hey API supports all valid OpenAPI versions and file formats.

::: info
If you use an HTTPS URL with a self-signed certificate in development, you will need to set [`NODE_TLS_REJECT_UNAUTHORIZED=0`](https://github.com/hey-api/openapi-ts/issues/276#issuecomment-2043143501) in your environment.
:::

## Output

Output is the next thing to define. It can be either a string pointing to the destination folder or a configuration object containing the destination folder path and optional settings (these are described below).

::: tip
You should treat the output folder as a dependency. Do not directly modify its contents as your changes might be erased when you run `@hey-api/openapi-ts` again.
:::

## Client

Clients are responsible for sending the actual HTTP requests. Using clients is not required, but you must add a client to `plugins` if you're generating SDKs (enabled by default).

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
    input: 'path/to/openapi_one.json',
    output: 'src/client_one',
    plugins: ['legacy/fetch'],
  },
  {
    input: 'path/to/openapi_two.json',
    output: 'src/client_two',
    plugins: ['legacy/axios'],
  },
])
``` -->

## Plugins

Plugins are responsible for generating artifacts from your input. By default, Hey API will generate TypeScript interfaces and SDK from your OpenAPI specification. You can add, remove, or customize any of the plugins. In fact, we highly encourage you to do so!

You can learn more on the [Output](/openapi-ts/output) page.

## Validating

To validate your input, set `input.validate_EXPERIMENTAL` to `true`.

::: warning
The validator feature is very limited. You can help improve it by submitting more [use cases](https://github.com/hey-api/openapi-ts/issues/1970#issuecomment-2933189789).
:::

```js
export default {
  input: {
    path: 'https://get.heyapi.dev/hey-api/backend',
    validate_EXPERIMENTAL: true, // [!code ++]
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

## Formatting

To format your output folder contents, set `output.format` to a valid formatter.

::: code-group

```js [disabled]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    format: false, // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

```js [prettier]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    format: 'prettier', // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

```js [biome]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    format: 'biome', // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

:::

You can also prevent your output from being formatted by adding your output path to the formatter's ignore file.

## Linting

To lint your output folder contents, set `output.lint` to a valid linter.

::: code-group

```js [disabled]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: false, // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

```js [eslint]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: 'eslint', // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

```js [biome]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: 'biome', // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

```js [oxlint]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    lint: 'oxlint', // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

:::

You can also prevent your output from being linted by adding your output path to the linter's ignore file.

## Filters

If you work with large specifications and want to generate output from their subset, you can use `input.filters` to select the relevant resources.

### Operations

Set `include` to match operations to be included or `exclude` to match operations to be excluded. Both exact keys and regular expressions are supported. When both rules match the same operation, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: {
    filters: {
      operations: {
        include: ['GET /api/v1/foo', '/^[A-Z]+ /api/v1//'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [exclude]
export default {
  input: {
    filters: {
      operations: {
        exclude: ['GET /api/v1/foo', '/^[A-Z]+ /api/v1//'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

### Tags

Set `include` to match tags to be included or `exclude` to match tags to be excluded. When both rules match the same tag, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: {
    filters: {
      tags: {
        include: ['v2'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [exclude]
export default {
  input: {
    filters: {
      tags: {
        exclude: ['v1'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

### Deprecated

You can filter out deprecated resources by setting `deprecated` to `false`.

```js
export default {
  input: {
    filters: {
      deprecated: false, // [!code ++]
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

### Schemas

Set `include` to match schemas to be included or `exclude` to match schemas to be excluded. Both exact keys and regular expressions are supported. When both rules match the same schema, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: {
    filters: {
      schemas: {
        include: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [exclude]
export default {
  input: {
    filters: {
      schemas: {
        exclude: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

### Parameters

Set `include` to match parameters to be included or `exclude` to match parameters to be excluded. Both exact keys and regular expressions are supported. When both rules match the same parameter, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: {
    filters: {
      parameters: {
        include: ['QueryParameter', '/^MyQueryParameter/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [exclude]
export default {
  input: {
    filters: {
      parameters: {
        exclude: ['QueryParameter', '/^MyQueryParameter/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

### Request Bodies

Set `include` to match request bodies to be included or `exclude` to match request bodies to be excluded. Both exact keys and regular expressions are supported. When both rules match the same request body, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: {
    filters: {
      requestBodies: {
        include: ['Payload', '/^SpecialPayload/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [exclude]
export default {
  input: {
    filters: {
      requestBodies: {
        exclude: ['Payload', '/^SpecialPayload/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

### Responses

Set `include` to match responses to be included or `exclude` to match responses to be excluded. Both exact keys and regular expressions are supported. When both rules match the same response, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: {
    filters: {
      responses: {
        include: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [exclude]
export default {
  input: {
    filters: {
      responses: {
        exclude: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

### Orphaned resources

If you only want to exclude orphaned resources, set `orphans` to `false`. This is the default value when combined with any other filters. If this isn't the desired behavior, you may want to set `orphans` to `true` to always preserve unused resources.

```js
export default {
  input: {
    filters: {
      orphans: false, // [!code ++]
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

### Order

For performance reasons, we don't preserve the original order when filtering out resources. If maintaining the original order is important to you, set `preserveOrder` to `true`.

```js
export default {
  input: {
    filters: {
      preserveOrder: true, // [!code ++]
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

## Pagination

Paginated operations are detected by having a pagination keyword in its parameters or request body. By default, we consider the following to be pagination keywords: `after`, `before`, `cursor`, `offset`, `page`, and `start`. You can override these keywords by providing your own keywords array using `input.pagination.keywords`.

```js
export default {
  input: {
    pagination: {
      keywords: ['custom', 'pagination', 'keywords'], // [!code ++]
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

## Patch

There are times when you need to modify your input before it's processed further. A common use case is fixing an invalid specification or adding a missing field. You can apply custom patches with `input.patch`.

You can patch individual schemas by their name. All patches work with raw input data and are applied before we generate any code.

```js
export default {
  input: {
    patch: {
      schemas: {
        Foo: (schema) => {
          // convert date-time format to timestamp
          delete schema.properties.updatedAt.format;
          schema.properties.updatedAt.type = 'number';
        },
        Bar: (schema) => {
          // add missing property
          schema.properties.meta = {
            additionalProperties: true,
            type: 'object',
          };
          schema.required = ['meta'];
        },
        Baz: (schema) => {
          // remove property
          delete schema.properties.internalField;
        },
      },
    },
    path: 'https://get.heyapi.dev/hey-api/backend',
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

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
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```sh [cli]
npx @hey-api/openapi-ts \
  -i https://get.heyapi.dev/hey-api/backend \
  -o src/client \
  -c @hey-api/client-fetch \
  -w  # [!code ++]
```

:::

## Custom Files

By default, you can't keep custom files in the `output.path` folder because it's emptied on every run. If you're sure you need to disable this behavior, set `output.clean` to `false`.

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: {
    clean: false, // [!code ++]
    path: 'src/client',
  },
  plugins: ['@hey-api/client-fetch'],
};
```

::: warning
Setting `output.clean` to `false` may result in broken output. Ensure you typecheck your code.
:::

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/types/config.d.ts) interface.

<!--@include: ../examples.md-->
<!--@include: ../sponsors.md-->
