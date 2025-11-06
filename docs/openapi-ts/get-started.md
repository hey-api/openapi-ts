---
title: Get Started
description: Get started with @hey-api/openapi-ts.
---

<script setup lang="ts">
import { embedProject } from '../embed'
</script>

# Get Started

[@hey-api/openapi-ts](https://github.com/hey-api/openapi-ts) is an [open source](/openapi-ts/license) OpenAPI to TypeScript code generator trusted by companies like Google, Amazon, and PayPal to generate API clients, SDKs, validators, and more. We also build complementary tools and [services](https://app.heyapi.dev/) that help teams design, manage, and distribute APIs more effectively.

> _“OpenAPI codegen that just works.”_
>
> <sub>— Guillermo Rauch, CEO of Vercel</sub>

### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-example')(event)">
Launch demo
</button>

## Features

- runs in CLI, Node.js 20+, or npx
- works with OpenAPI 2.0, 3.0, and 3.1
- core plugins for types, SDKs, and schemas
- clients for your runtime (Fetch API, Angular, Axios, Next.js, Nuxt, etc.)
- plugin ecosystem to reduce third-party boilerplate
- custom plugins and custom clients
- [integration](/openapi-ts/integrations) with Hey API Platform

## Quick Start

The fastest way to use `@hey-api/openapi-ts` is via npx

```sh
npx @hey-api/openapi-ts -i hey-api/backend -o src/client
```

Congratulations on creating your first client! 🎉 You can learn more about the generated files on the [Output](/openapi-ts/output) page.

## Installation

You can download `@hey-api/openapi-ts` from npm using your favorite package manager.

::: code-group

```sh [npm]
npm install @hey-api/openapi-ts -D -E
```

```sh [pnpm]
pnpm add @hey-api/openapi-ts -D -E
```

```sh [yarn]
yarn add @hey-api/openapi-ts -D -E
```

```sh [bun]
bun add @hey-api/openapi-ts -D -E
```

:::

### Versioning

This package does NOT follow the [semantic versioning](https://semver.org/) strategy. Please pin an exact version so you can safely upgrade when you're ready.

Due to the nature of the package, we use the following versioning strategy.

- `1.x.x`: significant breaking changes, reserved for v1 release
- `x.1.x`: breaking changes
- `x.x.1`: new features, bug fixes, and non-breaking changes

We publish [migration notes](/openapi-ts/migrating) for every breaking release. You might not be impacted by a breaking release if you don't use the affected plugin(s).

## Usage

### CLI

Most people run `@hey-api/openapi-ts` via CLI. To do that, add a script to your `package.json` file which will make `openapi-ts` executable through script.

```json
"scripts": {
  "openapi-ts": "openapi-ts"
}
```

The above script can be executed by running `npm run openapi-ts` or equivalent command in other package managers. Next, we will create a [configuration](/openapi-ts/configuration) file and move our options from Quick Start to it.

### Node.js

You can also generate output programmatically by calling `createClient()` in a JavaScript/TypeScript file.

::: code-group

```ts [script.ts]
import { createClient } from '@hey-api/openapi-ts';

createClient({
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
});
```

:::

### Configuration

It's a good practice to extract your configuration into a separate file. Learn how to do that and discover available options on the [Configuration](/openapi-ts/configuration) page.

<!--@include: ../partials/examples.md-->
<!--@include: ../partials/sponsors.md-->
