---
title: Get Started
description: Get started with @hey-api/openapi-ts.
---

<script setup>
import { embedProject } from '../embed'
</script>

# Get Started

Generate TypeScript interfaces, REST clients, and JSON Schemas from OpenAPI specifications.

<button class="buttonLink" @click="(event) => embedProject('hey-api-example')(event)">
Live demo
</button>

## Features

- works with CLI, Node.js, or npx
- supports OpenAPI 2.0, 3.0, and 3.1 specifications
- supports both JSON and YAML input files
- generates TypeScript interfaces, REST clients, and JSON Schemas
- Fetch API, Axios, Angular, Node.js, and XHR clients available

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
import { createClient } from '@hey-api/openapi-ts';

createClient({
  input: 'path/to/openapi.json',
  output: 'src/client',
});
```

::: warning
You need to be running Node.js v18 or newer
:::

## Examples

You can view live examples on [StackBlitz](https://stackblitz.com/orgs/github/hey-api/collections/openapi-ts-examples).
