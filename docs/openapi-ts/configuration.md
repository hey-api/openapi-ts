---
title: Configuration
description: Configure @hey-api/openapi-ts.
---

# Configuration

`@hey-api/openapi-ts` supports loading configuration from any file inside your project root directory supported by [jiti loader](https://github.com/unjs/c12?tab=readme-ov-file#-features). Below are the most common file formats.

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

## Clients

Clients are responsible for sending the actual HTTP requests. Apart from input and output, this is the only required option.

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
    client: 'fetch',
    input: 'path/to/openapi_one.json',
    output: 'src/client_one',
  },
  {
    client: 'axios',
    input: 'path/to/openapi_two.json',
    output: 'src/client_two',
  },
])
``` -->

## Services

Services are abstractions on top of clients and serve the same purpose. By default, `@hey-api/openapi-ts` will generate a flat service layer. Your choice to use services comes down to personal preferences and bundle size considerations.

You can learn more on the [Output](/openapi-ts/output#api-services) page.

## Enums

By default, `@hey-api/openapi-ts` will only emit enums as types. You may want to generate runtime artifacts. A good use case is iterating through possible field values without manually typing arrays. To emit runtime enums, set `types.enums` to a valid option.

::: code-group

```js [disabled]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  types: {
    enums: false, // [!code ++]
  },
};
```

```js [javascript]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  types: {
    enums: 'javascript', // [!code ++]
  },
};
```

```js [typescript]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  types: {
    enums: 'typescript', // [!code ++]
  },
};
```

:::

We recommend exporting enums as plain JavaScript objects. [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html) are not a type-level extension of JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh).

## JSON Schemas

By default, `@hey-api/openapi-ts` generates schemas from your OpenAPI specification. A great use case for schemas is client-side form input validation. If you're using OpenAPI 3.1, your [schemas](/openapi-ts/output#json-schemas) are JSON Schema compliant and can be used with other tools supporting JSON Schema. However, if you only want to validate form input, you probably don't want to include string descriptions inside your bundle. You can choose your preferred type using `schemas.type` option.

::: code-group

```js [json]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: {
    type: 'json', // [!code ++]
  },
};
```

```js [form]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: {
    type: 'form', // [!code ++]
  },
};
```

```js [disabled]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: false, // [!code ++]
};
```

:::

## Formatting

By default, `@hey-api/openapi-ts` will not automatically format your output. To enable this feature, set `output.format` to a valid formatter.

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

By default, `@hey-api/openapi-ts` will not automatically lint your output. To enable this feature, set `output.lint` to a valid linter.

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

:::

You can also prevent your output from being linted by adding your output path to the linter's ignore file.

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/types/config.ts) interface.

<!--@include: ../examples.md-->
<!--@include: ../sponsorship.md-->
