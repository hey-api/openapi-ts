# OpenAPI TypeScript Codegen

> ✨ Turn your OpenAPI specification into a beautiful TypeScript client

## Table of Contents
- [Table of Contents](#table-of-contents)
- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Formatting](#formatting)
  - [Enums](#enums)
  - [Config API](#config-api)
- [Contributing](#contributing)

## About

This is an opinionated fork of the [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen) package. We created it after the original project became [unmaintained](https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1276#issuecomment-1302392146) because we wanted to support OpenAPI v3.1 introduced in the FastAPI [v0.99.0](https://fastapi.tiangolo.com/release-notes/#0990) release. We plan to resolve the most pressing issues in the original project – open an issue if you'd like to prioritise your use case!

## Features

- generate TypeScript clients from OpenAPI v2.0, v3.0, and v3.1 specifications
- support JSON or YAML input files
- handle external references using [JSON Schema $Ref Parser](https://github.com/APIDevTools/json-schema-ref-parser/)
- generate Fetch, Node-Fetch, Axios, Angular, or XHR HTTP clients
- can be used with CLI, Node.js, or npx
- abortable requests through cancellable promise pattern

## Quick Start

The fastest way to use `openapi-ts` is via npx

```sh
npx @nicolas-chaulet/openapi-typescript-codegen -i path/to/openapi.json -o src/client
```

Congratulations on creating your first client! 🎉

## Installation

```sh
npm install @nicolas-chaulet/openapi-typescript-codegen --save-dev
```

or

```sh
yarn add @nicolas-chaulet/openapi-typescript-codegen -D
```

and add a script to your `package.json` file

```json
"scripts": {
  "openapi-ts": "openapi-ts"
}
```

> ⚠️ You need to be running Node.js v18 or newer

## Configuration

<!-- `openapi-ts` supports loading configuration from a file inside your project root directory. You can either create a `openapi-ts.config.js` file -->

`openapi-ts` supports loading configuration from a file inside your project root directory. You just need to create a `openapi-ts.config.js` file

```js
/** @type {import('@nicolas-chaulet/openapi-typescript-codegen').UserConfig} */
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

<!-- or `openapi-ts.config.ts`

```ts
import { defineConfig } from '@nicolas-chaulet/openapi-typescript-codegen';

export default defineConfig({
  input: 'path/to/openapi.json',
  output: 'src/client',
})
``` -->

### Formatting

By default, `openapi-ts` will automatically format your client according to your project configuration. To disable automatic formatting, set `autoformat` to false

```ts
import { defineConfig } from '@nicolas-chaulet/openapi-typescript-codegen';

export default defineConfig({
  autoformat: false,
  input: 'path/to/openapi.json',
  output: 'src/client',
})
```

You can also prevent your client from being processed by formatters and linters by adding your output path to the tool's ignore file (e.g. `.eslintignore`, `.prettierignore`).

### Enums

We do not generate TypeScript [enums](https://www.typescriptlang.org/docs/handbook/enums.html) because they are not standard JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh). If you want to iterate through possible field values without manually typing arrays, you can export enums by running

```ts
import { defineConfig } from '@nicolas-chaulet/openapi-typescript-codegen';

export default defineConfig({
  enums: true,
  input: 'path/to/openapi.json',
  output: 'src/client',
})
```

This will export your enums as plain JavaScript objects. For example, `Foo` will generate the following

```ts
export const FooEnum = {
  FOO: 'foo',
  BAR: 'bar',
} as const;
```

### Config API

```sh
$ openapi-ts --help

  Usage: openapi-ts [options]

  Options:
    -V, --version             output the version number
    -i, --input <value>       OpenAPI specification, can be a path, url or string content (required)
    -o, --output <value>      Output directory (required)
    -c, --client <value>      HTTP client to generate [fetch, xhr, node, axios, angular] (default: "fetch")
    --name <value>            Custom client class name
    --useOptions <value>      Use options instead of arguments (default: false)
    --no-autoformat           Disable processing generated files with formatter
    --base <value>            Manually set base in OpenAPI config instead of inferring from server value
    --enums                   Generate JavaScript objects from enum definitions (default: false)
    --exportCore <value>      Write core files to disk (default: true)
    --exportServices <value>  Write services to disk [true, false, regexp] (default: true)
    --exportModels <value>    Write models to disk [true, false, regexp] (default: true)
    --exportSchemas <value>   Write schemas to disk (default: false)
    --no-operationId          Use path URL to generate operation ID
    --postfixServices         Service name postfix (default: "Service")
    --postfixModels           Model name postfix
    --request <value>         Path to custom request file
    --useDateType <value>     Output Date instead of string for the format "date-time" in the models (default: false)
    -h, --help                display help for command
```

## Contributing

Please refer to the [contributing guide](CONTRIBUTING.md) for how to install the project for development purposes.
