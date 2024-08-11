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

- works with CLI, Node.js 18+, or npx
- supports OpenAPI 2.0, 3.0, and 3.1 specifications
- supports both JSON and YAML input files
- generates TypeScript interfaces, REST clients, and JSON Schemas
- Fetch API, Axios, Angular, Node.js, and XHR clients available

## Quick Start

The fastest way to use `@hey-api/openapi-ts` is via npx

```sh
npx @hey-api/openapi-ts -i path/to/openapi.json -o src/client -c @hey-api/client-fetch
```

Congratulations on creating your first client! 🎉 You can learn more about the generated files on the [Output](/openapi-ts/output) page.

Before you can make API requests with the client you've just created, you need to install `@hey-api/client-fetch` and configure it. Let's start by declaring your dependencies.

## Installation

::: code-group

```sh [npm]
npm install @hey-api/client-fetch && npm install @hey-api/openapi-ts -D
```

```sh [pnpm]
pnpm add @hey-api/client-fetch && pnpm add @hey-api/openapi-ts -D
```

```sh [yarn]
yarn add @hey-api/client-fetch && yarn add @hey-api/openapi-ts -D
```

```sh [bun]
bun add @hey-api/client-fetch && bun add @hey-api/openapi-ts -D
```

:::

We recommend pinning an exact version so you can safely upgrade when you're ready. This package is in [initial development](https://semver.org/spec/v0.1.0.html#spec-item-5) and its API might change before v1.

### CLI

Most people run `@hey-api/openapi-ts` via CLI. To do that, add a script to your `package.json` file which will make `openapi-ts` executable through script.

```json
"scripts": {
  "openapi-ts": "openapi-ts"
}
```

The above script can be executed by running `npm run openapi-ts` or equivalent command in other package managers. Next, we need to create a [configuration](/openapi-ts/configuration) file and move our options from Quick Start to it.

### Node.js

You can also generate clients programmatically by importing `@hey-api/openapi-ts` in a TypeScript file.

::: code-group

```ts [openapi-ts.ts]
import { createClient } from '@hey-api/openapi-ts';

createClient({
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
});
```

:::

### Configuration

It is a good practice to extract your configuration into a separate file. Learn how to do that and discover available options on the [Configuration](/openapi-ts/configuration) page.

<!--@include: ../examples.md-->
<!--@include: ../sponsorship.md-->
