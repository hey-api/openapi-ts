---
title: Get Started
description: Get started with @hey-api/openapi-ts.
---

<script setup>
import { embedProject } from '../embed'
</script>

# Get Started

::: warning
This package is in initial development. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

[@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) is an OpenAPI to TypeScript codegen trusted over 2,000,000 times each month to generate reliable API clients and SDKs. The code is [MIT-licensed](/license) and free to use. Discover available features below or view our [roadmap](https://github.com/orgs/hey-api/discussions/1495) to learn what's coming next.

### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-example')(event)">
Launch demo
</button>

## Features

- runs in CLI, Node.js 18+, or npx
- works with OpenAPI 2.0, 3.0, and 3.1
- customizable types and SDKs
- clients for your runtime (Fetch API, Axios, Next.js, Nuxt, etc.)
- plugin ecosystem to reduce third-party boilerplate
- custom plugins and custom clients
- [integration](/openapi-ts/integrations) with Hey API Platform

## Quick Start

The fastest way to use `@hey-api/openapi-ts` is via npx

```sh
npx @hey-api/openapi-ts \
  -i https://get.heyapi.dev/hey-api/backend \
  -o src/client
```

Congratulations on creating your first client! 🎉 You can learn more about the generated files on the [Output](/openapi-ts/output) page.

## Installation

::: code-group

```sh [npm]
npm install @hey-api/openapi-ts -D
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

We recommend pinning an exact version so you can safely upgrade when you're ready. This package is in [initial development](https://semver.org/spec/v0.1.0.html#spec-item-5) and its API might change before v1.

### CLI

Most people run `@hey-api/openapi-ts` via CLI. To do that, add a script to your `package.json` file which will make `openapi-ts` executable through script.

```json
"scripts": {
  "openapi-ts": "openapi-ts"
}
```

The above script can be executed by running `npm run openapi-ts` or equivalent command in other package managers. Next, we will create a [configuration](/openapi-ts/configuration) file and move our options from Quick Start to it.

### Node.js

You can also generate clients programmatically by importing `@hey-api/openapi-ts` in a TypeScript file.

::: code-group

```ts [openapi-ts.ts]
import { createClient } from '@hey-api/openapi-ts';

createClient({
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
});
```

:::

### Configuration

It's a good practice to extract your configuration into a separate file. Learn how to do that and discover available options on the [Configuration](/openapi-ts/configuration) page.

<!--@include: ../examples.md-->
<!--@include: ../sponsors.md-->
