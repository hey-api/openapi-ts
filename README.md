# OpenAPI TypeScript 👋

> ✨ Turn your OpenAPI specification into a beautiful TypeScript client

## Table of Contents
- [Table of Contents](#table-of-contents)
- [About](#about)
- [Features](#features)
- [Quick Start](#quick-start)
- [Installation](#installation)
- [Configuration](#configuration)
  - [Clients](#clients)
  - [Formatting](#formatting)
  - [Linting](#linting)
  - [Enums](#enums)
  - [Config API](#config-api)
- [Migrating](#migrating)
- [Contributing](#contributing)

## About

`openapi-ts` started as a fork of [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen). We created it after the original project became [unmaintained](https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1276#issuecomment-1302392146) to add support for OpenAPI v3.1. We plan to resolve the most pressing issues in the original project – open an issue if you'd like to prioritise your use case!

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
npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client
```

Congratulations on creating your first client! 🎉

## Installation

```sh
npm install @hey-api/openapi-ts --save-dev
```

or

```sh
yarn add @hey-api/openapi-ts -D
```

If you want to use `openapi-ts` with CLI, add a script to your `package.json` file

```json
"scripts": {
  "openapi-ts": "openapi-ts"
}
```

You can also generate your client programmatically by importing `openapi-ts` in a `.ts` file.

```ts
import { createClient } from '@hey-api/openapi-ts'

createClient({
  input: 'path/to/openapi.json',
  output: 'src/client',
})
```

> ⚠️ You need to be running Node.js v18 or newer

## Configuration

`openapi-ts` supports loading configuration from a file inside your project root directory. You can either create a `openapi-ts.config.cjs` file

```cjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
module.exports = {
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

or `openapi-ts.config.mjs`

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

Alternatively, you can use `openapi-ts.config.js` and configure the export statement depending on your project setup.

### Clients

We provide a variety of possible clients to use when generating your `openapi-ts` client. If one is not specified by the user, we will try to infer the client to use. If the inferred client is not correct, you can set it with the client config parameter. The following are available:

- `angular`: An [Angular](https://angular.io/) client using [RxJS](https://rxjs.dev/).
- `axios`: An [Axios](https://axios-http.com/docs/intro) client.
- `fetch`: A [Fetch API](https://developer.mozilla.org/docs/Web/API/Fetch_API) client.
    > NOTE: The Fetch API is experimental in Node.js 18+ and was stabilized in [Node.js v21](https://nodejs.org/docs/latest-v21.x/api/globals.html#fetch)
- `node`: A [Node.js](https://nodejs.org/) client using [node-fetch](https://www.npmjs.com/package/node-fetch).
- `xhr`: A [XMLHttpRequest](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest) client.

### Formatting

By default, `openapi-ts` will automatically format your client according to your project configuration. To disable automatic formatting, set `format` to false

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  format: false,
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

You can also prevent your client from being processed by formatters by adding your output path to the tool's ignore file (e.g. `.prettierignore`).

### Linting

For performance reasons, `openapi-ts` does not automatically lint your client. To enable this feature, set `lint` to true

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  input: 'path/to/openapi.json',
  lint: true,
  output: 'src/client',
}
```

You can also prevent your client from being processed by linters by adding your output path to the tool's ignore file (e.g. `.eslintignore`).

### Enums

We do not generate TypeScript [enums](https://www.typescriptlang.org/docs/handbook/enums.html) because they are not standard JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh). If you want to iterate through possible field values without manually typing arrays, you can export enums by running

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
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

### File headers

To add a header in the generated files, set the `header` parameter in your configuration file

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  header: `/**
  * generated using openapi-ts -- do no edit
  * Licensed under the MIT License.
  */`
}
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
    --useOptions <value>      Use options instead of arguments (default: true)
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
    --useLegacyEnums          Generate Typescript enum definitions (default: false)
    -h, --help                display help for command
```

## Migrating

While we try to avoid breaking changes, sometimes it's unavoidable in order to offer you the latest features.

### v0.27.38

### `useOptions: true`

By default, generated clients will use a single object argument to pass values to API calls. This is a significant change from the previous default of unspecified array of arguments. If migrating your application in one go isn't feasible, we recommend deprecating your old client and generating a new client.

```ts
import { DefaultService } from 'client' // <-- old client with array arguments

import { DefaultService } from 'client_v2' // <-- new client with options argument
```

This way, you can gradually switch over to the new syntax as you update parts of your code. Once you've removed all instances of `client` imports, you can safely delete the old `client` folder and find and replace all `client_v2` calls to `client`.

## Contributing

Please refer to the [contributing guide](CONTRIBUTING.md) for how to install the project for development purposes.
