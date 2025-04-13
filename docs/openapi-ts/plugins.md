---
title: Plugins
description: Learn about and discover available plugins.
---

# Plugins

Every generated file in your output is created by a plugin. You already learned about the default plugins in [Output](/openapi-ts/output). However, you might be working with third-party packages and wishing to automate more of your boilerplate. This page lists all native and selected community plugins enabling you to do that.

## Hey API

Apart from being responsible for the default output, Hey API plugins are the foundation for other plugins. Instead of creating their own primitives, other plugins can reuse the artifacts from Hey API plugins. This results in a smaller output size and a better user experience.

- [`@hey-api/schemas`](/openapi-ts/output/json-schema) - export OpenAPI definitions as JavaScript objects
- [`@hey-api/sdk`](/openapi-ts/output/sdk) - robust and polished SDKs
- [`@hey-api/transformers`](/openapi-ts/transformers) - response data transformer functions
- [`@hey-api/typescript`](/openapi-ts/output/typescript) - TypeScript interfaces and enums

## Third Party

These plugins help reduce boilerplate associated with third-party dependencies. Hey API natively supports the most popular packages. Please open an issue on [GitHub](https://github.com/hey-api/openapi-ts/issues) if you'd like us to support your favorite package.

- [`@tanstack/angular-query-experimental`](/openapi-ts/plugins/tanstack-query)
- [`@tanstack/react-query`](/openapi-ts/plugins/tanstack-query)
- [`@tanstack/solid-query`](/openapi-ts/plugins/tanstack-query)
- [`@tanstack/svelte-query`](/openapi-ts/plugins/tanstack-query)
- [`@tanstack/vue-query`](/openapi-ts/plugins/tanstack-query)
- [`fastify`](/openapi-ts/plugins/fastify)
- [`zod`](/openapi-ts/plugins/zod)

## Upcoming

The following plugins are planned but not in development yet. You can help us prioritize them by voting on [GitHub](https://github.com/hey-api/openapi-ts/labels/RSVP%20%F0%9F%91%8D%F0%9F%91%8E).

- [Ajv](/openapi-ts/plugins/ajv) <span data-soon>Soon</span>
- [Arktype](/openapi-ts/plugins/arktype) <span data-soon>Soon</span>
- [Express](/openapi-ts/plugins/express) <span data-soon>Soon</span>
- [Faker](/openapi-ts/plugins/faker) <span data-soon>Soon</span>
- [Hono](/openapi-ts/plugins/hono) <span data-soon>Soon</span>
- [Joi](/openapi-ts/plugins/joi) <span data-soon>Soon</span>
- [Koa](/openapi-ts/plugins/koa) <span data-soon>Soon</span>
- [MSW](/openapi-ts/plugins/msw) <span data-soon>Soon</span>
- [Nest](/openapi-ts/plugins/nest) <span data-soon>Soon</span>
- [Nock](/openapi-ts/plugins/nock) <span data-soon>Soon</span>
- [Pinia Colada](/openapi-ts/plugins/pinia-colada) <span data-soon>Soon</span>
- [Superstruct](/openapi-ts/plugins/superstruct) <span data-soon>Soon</span>
- [Supertest](/openapi-ts/plugins/supertest) <span data-soon>Soon</span>
- [SWR](/openapi-ts/plugins/swr) <span data-soon>Soon</span>
- [TypeBox](/openapi-ts/plugins/typebox) <span data-soon>Soon</span>
- [Valibot](/openapi-ts/plugins/valibot) <span data-soon>Soon</span>
- [Yup](/openapi-ts/plugins/yup) <span data-soon>Soon</span>
- [Zustand](/openapi-ts/plugins/zustand) <span data-soon>Soon</span>

Don't see your plugin? [Build your own](/openapi-ts/plugins/custom) or let us know your interest by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

## Community

Featured community plugins.

- [add plugin](https://github.com/hey-api/openapi-ts/pulls)

<!--@include: ../examples.md-->
<!--@include: ../sponsors.md-->
