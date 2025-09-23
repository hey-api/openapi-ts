---
title: Plugins
description: Reduce third-party boilerplate with our plugin ecosystem.
---

<script setup lang="ts">
import { embedProject } from '../embed'
</script>

# Plugins

Hey API plugins reduce third-party boilerplate by generating code specifically tailored to your favorite libraries and frameworks. Instead of writing repetitive integration code, our plugins seamlessly integrate with your existing tools while maintaining type safety and performance.

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe generated code for your favorite libraries
- reduced boilerplate and manual integration work
- extensive plugin ecosystem covering validation, state management, mocking, and more
- support for popular frameworks and libraries
- easy customization and configuration options

## Plugin Categories

Hey API organizes plugins into logical categories to help you find exactly what you need:

### Core Plugins

Essential plugins for basic TypeScript and SDK generation.

- [TypeScript](/openapi-ts/plugins/typescript) - Generate TypeScript types
- [SDK](/openapi-ts/plugins/sdk) - Generate SDK methods
- [Transformers](/openapi-ts/plugins/transformers) - Transform request/response data
- [Schemas](/openapi-ts/plugins/schemas) - Generate JSON schemas

### Clients

REST clients for different runtime environments and libraries.

- [Fetch API](/openapi-ts/clients/fetch) - Modern browser and Node.js fetch
- [Angular](/openapi-ts/clients/angular) - Angular HTTP client
- [Axios](/openapi-ts/clients/axios) - Popular HTTP client library
- [Next.js](/openapi-ts/clients/next-js) - Next.js optimized client
- [Nuxt](/openapi-ts/clients/nuxt) - Nuxt.js integration
- [OFetch](/openapi-ts/clients/ofetch) - Minimal fetch wrapper
- [Effect](/openapi-ts/clients/effect) <span data-soon>Soon</span> - Effect-TS integration
- [Legacy](/openapi-ts/clients/legacy) - Legacy client support

### Validators

Validate request and response data with popular validation libraries.

- [Valibot](/openapi-ts/plugins/valibot) - Modern schema validation
- [Zod](/openapi-ts/plugins/zod) - TypeScript-first schema validation
- [Ajv](/openapi-ts/plugins/ajv) <span data-soon>Soon</span> - JSON Schema validator
- [Arktype](/openapi-ts/plugins/arktype) <span data-soon>Soon</span> - Runtime type validation
- [Joi](/openapi-ts/plugins/joi) <span data-soon>Soon</span> - Object schema validation
- [Superstruct](/openapi-ts/plugins/superstruct) <span data-soon>Soon</span> - Data validation library
- [TypeBox](/openapi-ts/plugins/typebox) <span data-soon>Soon</span> - JSON Schema Type Builder
- [Yup](/openapi-ts/plugins/yup) <span data-soon>Soon</span> - Schema validation

### State Management

Integrate with popular state management and data fetching libraries.

- [Pinia Colada](/openapi-ts/plugins/pinia-colada) - Vue.js async state management
- [TanStack Query](/openapi-ts/plugins/tanstack-query) - Powerful data synchronization
- [SWR](/openapi-ts/plugins/swr) <span data-soon>Soon</span> - React data fetching
- [Zustand](/openapi-ts/plugins/zustand) <span data-soon>Soon</span> - Small state management

### Mocking & Testing

Generate mock data and testing utilities for your APIs.

- [Chance](/openapi-ts/plugins/chance) <span data-soon>Soon</span> - Random data generator
- [Faker](/openapi-ts/plugins/faker) <span data-soon>Soon</span> - Generate fake data
- [Falso](/openapi-ts/plugins/falso) <span data-soon>Soon</span> - Mock data generator
- [MSW](/openapi-ts/plugins/msw) <span data-soon>Soon</span> - API mocking for testing
- [Nock](/openapi-ts/plugins/nock) <span data-soon>Soon</span> - HTTP server mocking
- [Supertest](/openapi-ts/plugins/supertest) <span data-soon>Soon</span> - HTTP assertion testing

### Web Frameworks

Generate server-side code for popular web frameworks.

- [Angular](/openapi-ts/plugins/angular) - Angular framework integration
- [Fastify](/openapi-ts/plugins/fastify) - Fast web framework
- [Adonis](/openapi-ts/plugins/adonis) <span data-soon>Soon</span> - Node.js framework
- [Elysia](/openapi-ts/plugins/elysia) <span data-soon>Soon</span> - Bun web framework
- [Express](/openapi-ts/plugins/express) <span data-soon>Soon</span> - Node.js web framework
- [Hono](/openapi-ts/plugins/hono) <span data-soon>Soon</span> - Ultrafast web framework
- [Koa](/openapi-ts/plugins/koa) <span data-soon>Soon</span> - Next generation framework
- [Nest](/openapi-ts/plugins/nest) <span data-soon>Soon</span> - Scalable Node.js framework

### Custom Development

Build your own plugins and clients for specific use cases.

- [Custom Plugin](/openapi-ts/plugins/custom) - Build your own plugin
- [Custom Client](/openapi-ts/clients/custom) - Create custom HTTP client

## Getting Started

To use plugins with Hey API, install the main package and configure your desired plugins:

```bash
npm install @hey-api/openapi-ts
```

Then configure your plugins in `openapi-ts.config.ts`:

```typescript
import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: ['@hey-api/schemas', '@hey-api/sdk', '@hey-api/typescript'],
});
```

Don't see the plugin you need? [Build your own](/openapi-ts/plugins/custom) or let us know your interest by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

<!--@include: ../partials/examples.md-->
<!--@include: ../partials/sponsors.md-->
