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
- [Interceptors](#interceptors)
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

or

```sh
pnpm add @hey-api/openapi-ts -D
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

By default, `openapi-ts` will try to guess your client based on your project dependencies. If we don't get it right, you can specify the desired client

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  client: 'fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

We support these clients:

- [angular](https://angular.io/) (using [RxJS](https://rxjs.dev/))
- [axios](https://axios-http.com/)
- [fetch](https://developer.mozilla.org/docs/Web/API/Fetch_API)

We also support the legacy Node.js and XHR clients:

- [node](https://nodejs.org/) (using [node-fetch](https://www.npmjs.com/package/node-fetch))
- [xhr](https://developer.mozilla.org/docs/Web/API/XMLHttpRequest)

> ⚠️ You might not need a `node` client. Fetch API is [experimental](https://nodejs.org/docs/latest-v18.x/api/globals.html#fetch) in Node.js v18 and [stable](https://nodejs.org/docs/latest-v21.x/api/globals.html#fetch) in Node.js v21. We recommend upgrading to the latest Node.js version.

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

If you need to iterate through possible field values without manually typing arrays, you can export enums with

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  enums: 'javascript',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

This will export enums as plain JavaScript objects. For example, `Foo` would become

```ts
export const FooEnum = {
  FOO: 'foo',
  BAR: 'bar',
} as const;
```

We discourage generating [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html) because they are not standard JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh). If you really need TypeScript enums, you can export them with

```mjs
/** @type {import('@hey-api/openapi-ts').UserConfig} */
export default {
  enums: 'typescript',
  input: 'path/to/openapi.json',
  output: 'src/client',
}
```

### Config API

You can view the complete list of options in the [UserConfig](./src/types/config.ts) interface.

## Interceptors

Interceptors (middleware) can be used to modify requests before they're sent or responses before they're returned to the rest of your application. Below is an example request interceptor

```ts
OpenAPI.interceptors.request.use((request) => {
  doSomethingWithRequest(request)
  return request // <-- must return request
})
```

and an example response interceptor

```ts
OpenAPI.interceptors.response.use(async (response) => {
  await doSomethingWithResponse(response) // async
  return response // <-- must return response
})
```

If you need to remove an interceptor, pass the same function to `OpenAPI.interceptors.request.eject()` or `OpenAPI.interceptors.response.eject()`.

> ⚠️ Angular client does not currently support request interceptors.

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
