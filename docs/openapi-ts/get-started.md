---
title: Get Started
description: Get started with @hey-api/openapi-ts.
---

# Get Started

`openapi-ts` allows you to create TypeScript interfaces, REST clients, and schemas from an OpenAPI specification.

## Features

- generate TypeScript interfaces from OpenAPI v2.0, v3.0, and v3.1 specifications
- support JSON or YAML input files
- handle external references using [JSON Schema $Ref Parser](https://github.com/APIDevTools/json-schema-ref-parser/)
- generate fetch, axios, angular, node.js, or xhr REST clients
- usable with CLI, Node.js, or npx
- abortable requests through cancellable promise pattern

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
