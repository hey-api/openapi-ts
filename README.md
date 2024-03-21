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
  - [Linting](#linting)
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

If you want to use `openapi-ts` with CLI, add a script to your `package.json` file

```json
"scripts": {
  "openapi-ts": "openapi-ts"
}
```

You can also generate your client programmatically by importing `openapi-ts` in a `.ts` file.

```ts
import { createClient } from '@nicolas-chaulet/openapi-typescript-codegen'

createClient({
  input: 'path/to/openapi.json',
  output: 'src/client',
})
```

> ⚠️ You need to be running Node.js v18 or newer

## Configuration

`openapi-ts` supports loading configuration from a file inside your project root directory. You can either create a `openapi-ts.config.cjs` file

```js
/** @type {import('@nicolas-chaulet/openapi-typescript-codegen').UserConfig} */
module.exports = {
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

or `openapi-ts.config.mjs`

```js
/** @type {import('@nicolas-chaulet/openapi-typescript-codegen').UserConfig} */
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

Alternatively, you can use `openapi-ts.config.js` and configure the export statement depending on your project setup.

### Formatting

By default, `openapi-ts` will automatically format your client according to your project configuration. To disable automatic formatting, set `format` to false

```js
/** @type {import('@nicolas-chaulet/openapi-typescript-codegen').UserConfig} */
export default {
  format: false,
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

You can also prevent your client from being processed by formatters by adding your output path to the tool's ignore file (e.g. `.prettierignore`).

### Linting

For performance reasons, `openapi-ts` does not automatically lint your client. To enable this feature, set `lint` to true

```js
/** @type {import('@nicolas-chaulet/openapi-typescript-codegen').UserConfig} */
export default {
  input: 'path/to/openapi.json',
  lint: true,
  output: 'src/client',
}
```

You can also prevent your client from being processed by linters by adding your output path to the tool's ignore file (e.g. `.eslintignore`).

### Enums

We do not generate TypeScript [enums](https://www.typescriptlang.org/docs/handbook/enums.html) because they are not standard JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh). If you want to iterate through possible field values without manually typing arrays, you can export enums by running

```js
/** @type {import('@nicolas-chaulet/openapi-typescript-codegen').UserConfig} */
export default {
  enums: true,
  input: 'path/to/openapi.json',
  output: 'src/client',
}
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
    --base <value>            Manually set base in OpenAPI config instead of inferring from server value
    --enums                   Generate JavaScript objects from enum definitions (default: false)
    --exportCore <value>      Write core files to disk (default: true)
    --exportServices <value>  Write services to disk [true, false, regexp] (default: true)
    --exportModels <value>    Write models to disk [true, false, regexp] (default: true)
    --exportSchemas <value>   Write schemas to disk (default: true)
    --format                  Process output folder with formatter?
    --no-format               Disable processing output folder with formatter
    --lint                    Process output folder with linter?
    --no-lint                 Disable processing output folder with linter
    --no-operationId          Use path URL to generate operation ID
    --postfixServices         Service name postfix (default: "Service")
    --postfixModels           Model name postfix
    --request <value>         Path to custom request file
    --useDateType <value>     Output Date instead of string for the format "date-time" in the models (default: false)
    -h, --help                display help for command
```

## Contributing

Please refer to the [contributing guide](CONTRIBUTING.md) for how to install the project for development purposes.
