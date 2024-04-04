---
title: Get Started
description: Get started with @hey-api/openapi-ts.
---

# Get Started

`openapi-ts` started as a fork of [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen). We created it after the original project became [unmaintained](https://github.com/ferdikoomen/openapi-typescript-codegen/issues/1276#issuecomment-1302392146) to add support for OpenAPI v3.1. We plan to resolve the most pressing issues in the original project – open an issue if you'd like to prioritise your use case!

## Features

- Generate TypeScript clients from OpenAPI v2.0, v3.0, and v3.1 specifications
- Support JSON or YAML input files
- Handle external references using [JSON Schema $Ref Parser](https://github.com/APIDevTools/json-schema-ref-parser/)
- Generate Fetch, Node-Fetch, Axios, Angular, or XHR HTTP clients
- Can be used with CLI, Node.js, or npx
- Abortable requests through cancellable promise pattern

## Quick Start

The fastest way to use `openapi-ts` is via npx

```sh
npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client
```

Congratulations on creating your first client! 🎉

## Installation

::: code-group
```sh [npm]
npm install @hey-api/openapi-ts --save-dev
```
```sh [pnpm]
pnpm add @hey-api/openapi-ts -D
```
```sh [yarn]
yarn add @hey-api/openapi-ts -D
```
```sh [bun]
bun add @hey-api/openapi-ts -D
```
:::

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

::: warning
You need to be running Node.js v18 or newer
:::
