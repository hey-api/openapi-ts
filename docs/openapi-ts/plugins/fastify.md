---
title: Fastify v5 Plugin
description: Generate Fastify v5 route handlers from OpenAPI with the Fastify plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import AuthorsList from '@components/AuthorsList.vue';
import Heading from '@components/Heading.vue';
import { jacobCohen } from '@data/people.js';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>Fastify</h1>
  <VersionLabel value="v5" />
</Heading>

::: warning
Fastify plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[Fastify](https://fastify.dev) is a fast and low overhead web framework for Node.js.

The Fastify plugin for Hey API generates route handlers from your OpenAPI spec, fully compatible with all core features.

### Collaborators

<AuthorsList :people="[jacobCohen]" />

## Features

- Fastify v5 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe route handlers
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add `fastify` to your plugins and you'll be ready to generate Fastify artifacts. :tada:

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    'fastify', // [!code ++]
  ],
};
```

## Output

The Fastify plugin will generate the following artifacts, depending on the input specification.

## Route Handlers

Route handlers are generated from all endpoints. The generated interface follows the naming convention of SDK functions.

::: code-group

```ts [example]
const fastify = Fastify();
const serviceHandlers: RouteHandlers = {
  createPets(request, reply) {
    reply.code(201).send();
  },
  listPets(request, reply) {
    reply.code(200).send([]);
  },
  showPetById(request, reply) {
    reply.code(200).send({
      id: Number(request.params.petId),
      name: 'Kitty',
    });
  },
};
fastify.register(glue, { serviceHandlers });
```

```js [config]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'fastify',
    },
  ],
};
```

:::

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/fastify/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
