---
title: oRPC v1 Plugin
description: Generate oRPC v1 contracts from OpenAPI with the oRPC plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import AuthorsList from '@components/AuthorsList.vue';
import Heading from '@components/Heading.vue';
import { stephenZhou } from '@data/people.js';
import VersionLabel from '@components/VersionLabel.vue';
</script>

<Heading>
  <h1>oRPC<span class="sr-only"> v1</span></h1>
  <VersionLabel value="v1" />
</Heading>

::: warning
oRPC plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[oRPC](https://orpc.dev) combines RPC with OpenAPI, allowing you to define and call remote or local procedures through a type-safe API while adhering to the OpenAPI specification.

The oRPC plugin for Hey API generates contracts from your OpenAPI spec, fully compatible with all core features.

### Collaborators

<AuthorsList :people="[stephenZhou]" />

## Features

- oRPC v1 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- generated contracts
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add `orpc` to your plugins and you'll be ready to generate oRPC artifacts. :tada:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    'orpc', // [!code ++]
  ],
};
```

## Output

The oRPC plugin will generate the following artifacts, depending on the input specification.

## Contracts

Contracts are generated from all endpoints.

::: code-group

```js [example]
import { oc } from '@orpc/contract';

const addPet = oc.route({
  description: 'Add a new pet to the store.',
  inputStructure: 'detailed',
  method: 'POST',
  operationId: 'addPet',
  path: '/pet',
  summary: 'Add a new pet to the store.',
  tags: ['pet'],
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    'orpc',
  ],
};
```

:::

### Validators

To enable schema validation, set `validator` to `zod` or one of the available [validator plugins](/openapi-ts/validators). This will implicitly add the selected plugin with default values.

For a more granular approach, manually add a validator plugin and set `validator` to the plugin name or `true` to automatically select a compatible plugin. Until you customize the validator plugin, both approaches will produce the same default output.

::: code-group

```js [example]
import { oc } from '@orpc/contract';

import { vAddPetData, vAddPetResponse } from './valibot.gen';

const addPet = oc
  .route({
    description: 'Add a new pet to the store.',
    inputStructure: 'detailed',
    method: 'POST',
    operationId: 'addPet',
    path: '/pet',
    summary: 'Add a new pet to the store.',
    tags: ['pet'],
  })
  .input(vAddPetData) // [!code ++]
  .output(vAddPetResponse); // [!code ++]
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'orpc',
      validator: true, // or 'valibot' // [!code ++]
    },
    {
      name: 'valibot', // customize (optional) // [!code ++]
      // other options
    },
  ],
};
```

:::

You can choose to validate only inputs or outputs.

::: code-group

```js [inputs]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'orpc',
      validator: {
        input: 'zod', // [!code ++]
      },
    },
  ],
};
```

```js [outputs]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'orpc',
      validator: {
        output: 'zod', // [!code ++]
      },
    },
  ],
};
```

:::

Learn more about available validators on the [Validators](/openapi-ts/validators) page.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/orpc/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
