---
title: Fastify
description: Fastify plugin for Hey API. Compatible with all our features.
---

# Fastify

::: warning
Fastify plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

[Fastify](https://fastify.dev/) is a fast and low overhead web framework for Node.js.

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-fastify-example')(event)">
Live demo
</button>

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- type-safe route handlers
- minimal learning curve thanks to extending the underlying technology

## Installation

::: warning
Fastify plugin works only with the [experimental parser](/openapi-ts/configuration#parser) which is currently an opt-in feature.
:::

Ensure you have already [configured](/openapi-ts/get-started) `@hey-api/openapi-ts`. Update your configuration to use the Fastify plugin.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true, // [!code ++]
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    // ...other plugins
    'fastify', // [!code ++]
  ],
};
```

You can now generate Fastify artifacts. 🎉

## Output

The Fastify plugin will generate the following artifacts, depending on the input specification.

## Route Handlers

Route handlers are generated from all endpoints. The generated interface follows the naming convention of services.

```ts
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

<!--@include: ../examples.md-->
<!--@include: ../sponsorship.md-->
