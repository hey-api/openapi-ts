---
title: Configuration
description: Configure openapi-ts.
---

# Configuration

`openapi-ts` supports loading configuration from any file inside your project root directory supported by [jiti loader](https://github.com/unjs/c12?tab=readme-ov-file#-features). Below are the most common file formats.

::: code-group

```js [openapi-ts.config.ts]
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: 'path/to/openapi.json',
  output: 'src/client',
});
```

```js [openapi-ts.config.cjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
module.exports = {
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

```js [openapi-ts.config.mjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
};
```

:::

Alternatively, you can use `openapi-ts.config.js` and configure the export statement depending on your project setup.

## Clients

By default, `openapi-ts` will try to guess your client based on your project dependencies. If we don't get it right, you can specify the desired client

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

We support these clients:

- [angular](https://angular.io/) (using [RxJS](https://rxjs.dev/))
- [axios](https://axios-http.com/)
- [fetch](https://developer.mozilla.org/docs/Web/API/Fetch_API)

We also support the legacy Node.js and XHR clients:

- [node](https://nodejs.org/) (using [node-fetch](https://www.npmjs.com/package/node-fetch))
- [xhr](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest)

::: tip
You might not need a `node` client. Fetch API is [experimental](https://nodejs.org/docs/latest-v18.x/api/globals.html#fetch) in Node.js v18 and [stable](https://nodejs.org/docs/latest-v21.x/api/globals.html#fetch) in Node.js v21. We recommend upgrading to the latest Node.js version.
:::

## Formatting

By default, `openapi-ts` will not automatically format your client. To enable this feature, set `format` to a valid formatter.

::: code-group

```js{2} [disabled]
export default {
  format: false,
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [prettier]
export default {
  format: 'prettier',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

```js{2} [biome]
export default {
  format: 'biome',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

:::

You can also prevent your client from being processed by formatters by adding your output path to the tool's ignore file (e.g. `.prettierignore`).

## Linting

For performance reasons, `openapi-ts` does not automatically lint your client. To enable this feature, set `lint` to a valid linter.

::: code-group

```js{3} [disabled]
export default {
  input: 'path/to/openapi.json',
  lint: false,
  output: 'src/client',
}
```

```js{3} [eslint]
export default {
  input: 'path/to/openapi.json',
  lint: 'eslint',
  output: 'src/client',
}
```

```js{3} [biome]
export default {
  input: 'path/to/openapi.json',
  lint: 'biome',
  output: 'src/client',
}
```

:::

You can also prevent your client from being processed by linters by adding your output path to the tool's ignore file (e.g. `.eslintignore`).

## Enums

If you need to iterate through possible field values without manually typing arrays, you can export enums with

```js{2}
export default {
  enums: 'javascript',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

This will export enums as plain JavaScript objects. For example, `Foo` would become

```js
export const FooEnum = {
  FOO: 'foo',
  BAR: 'bar',
} as const;
```

We discourage generating [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html) because they are not standard JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh). If you really need TypeScript enums, you can export them with

```js{2}
export default {
  enums: 'typescript',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

## JSON Schemas

By default, `openapi-ts` exports schemas from your OpenAPI specification as plain JavaScript objects. A great use case for schemas is client-side form input validation.

```ts
import { $Schema } from 'client/schemas';

const maxInputLength = $Schema.properties.text.maxLength;

if (userInput.length > maxInputLength) {
  throw new Error(`String length cannot exceed ${maxInputLength} characters!`);
}
```

If you're using OpenAPI v3.1, your schemas are JSON Schema compliant and can be used with other tools supporting JSON Schema. However, if you only want to validate form input, you don't want to include string descriptions inside your bundle. Instead, use `form` type.

```js{5}
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: {
    type: 'form'
  },
}
```

If you don't need schemas at all, you can disable them with

```js{4}
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: false,
}
```

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/types/config.ts) interface.

## Examples

You can view live examples on [StackBlitz](https://stackblitz.com/orgs/github/hey-api/collections/openapi-ts-examples).
