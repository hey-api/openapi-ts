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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
});
```

```js [openapi-ts.config.cjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
module.exports = {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

```js [openapi-ts.config.mjs]
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

:::

Alternatively, you can use `openapi-ts.config.js` and configure the export statement depending on your project setup.

## Input

You must provide an input so we can load your OpenAPI specification.

The input can be a string path, URL, [API registry](/openapi-ts/configuration/input#api-registry) shorthand, an object containing any of these, or an object representing an OpenAPI specification. Hey API supports all valid OpenAPI versions and file formats.

You can learn more on the [Input](/openapi-ts/configuration/input) page.

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

## Output

You must set the output so we know where to generate your files. It can be a path to the destination folder or an object containing the destination folder path and optional settings.

You can learn more on the [Output](/openapi-ts/configuration/output) page.

::: code-group

```js [path]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client', // [!code ++]
};
```

<!-- prettier-ignore-start -->
```js [object]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: { // [!code ++]
    path: 'src/client', // [!code ++]
    // ...other options // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

::: tip
You should treat the output folder as a dependency. Do not directly modify its contents as your changes might be erased when you run `@hey-api/openapi-ts` again.
:::

## Parser

We parse your input before making it available to plugins. Configuring the parser is optional, but it provides an ideal opportunity to modify or validate your input as needed.

You can learn more on the [Parser](/openapi-ts/configuration/parser) page.

## Plugins

Plugins are responsible for generating artifacts from your input. By default, Hey API will generate TypeScript interfaces and SDK from your OpenAPI specification. You can add, remove, or customize any of the plugins. In fact, we highly encourage you to do so!

You can learn more on the [Output](/openapi-ts/output) page.

## Advanced

More complex configuration scenarios can be handled by providing an array of inputs, outputs, or configurations.

### Multiple jobs

Throughout this documentation, we generally reference single job configurations. However, you can easily run multiple jobs by providing an array of configuration objects.

::: code-group

```js [config]
export default [
  {
    input: 'foo.yaml',
    output: 'src/foo',
  },
  {
    input: 'bar.yaml',
    output: 'src/bar',
  },
];
```

```md [example]
src/
├── foo/
│ ├── client/
│ ├── core/
│ ├── client.gen.ts
│ ├── index.ts
│ ├── sdk.gen.ts
│ └── types.gen.ts
└── bar/
├── client/
├── core/
├── client.gen.ts
├── index.ts
├── sdk.gen.ts
└── types.gen.ts
```

:::

### Job matrix

Reusing configuration across multiple jobs is possible by defining a job matrix. You can create a job matrix by providing `input` and `output` arrays of matching length.

::: code-group

```js [config]
export default {
  input: ['foo.yaml', 'bar.yaml'],
  output: ['src/foo', 'src/bar'],
};
```

```md [example]
src/
├── foo/
│ ├── client/
│ ├── core/
│ ├── client.gen.ts
│ ├── index.ts
│ ├── sdk.gen.ts
│ └── types.gen.ts
└── bar/
├── client/
├── core/
├── client.gen.ts
├── index.ts
├── sdk.gen.ts
└── types.gen.ts
```

:::

### Merging inputs

You can merge inputs by defining multiple inputs and a single output.

::: code-group

```js [config]
export default {
  input: ['foo.yaml', 'bar.yaml'],
  output: 'src/client',
};
```

```md [example]
src/
└── client/
├── client/
├── core/
├── client.gen.ts
├── index.ts
├── sdk.gen.ts
└── types.gen.ts
```

:::

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/types/config.d.ts) interface.

<!--@include: ../partials/examples.md-->
<!--@include: ../partials/sponsors.md-->
