---
title: Pinia Colada v0 Plugin
description: Generate Pinia Colada v0 functions and query keys from OpenAPI with the Pinia Colada plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import AuthorsList from '@components/AuthorsList.vue';
import Heading from '@components/Heading.vue';
import VersionLabel from '@components/VersionLabel.vue';
import { joshHemphill, sebastiaanWouters } from '@data/people.js';
</script>

<Heading>
  <h1>Pinia Colada<span class="sr-only"> v0</span></h1>
  <VersionLabel value="v0" />
</Heading>

### About

[Pinia Colada](https://pinia-colada.esm.dev) is the perfect companion to Pinia to handle async state management in your Vue applications.

The Pinia Colada plugin for Hey API generates functions and query keys from your OpenAPI spec, fully compatible with SDKs, transformers, and all core features.

### Collaborators

<AuthorsList :people="[joshHemphill, sebastiaanWouters]" />

## Features

- Pinia Colada v0 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- create query keys following the best practices
- type-safe query options and mutation options
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add `@pinia/colada` to your plugins and you'll be ready to generate Pinia Colada artifacts. :tada:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@pinia/colada', // [!code ++]
  ],
};
```

## Output

The Pinia Colada plugin will generate the following artifacts, depending on the input specification.

## Queries

Queries are generated from [query operations](/openapi-ts/configuration/parser#hooks-query-operations). The generated query functions follow the naming convention of SDK functions and by default append `Query`, e.g. `getPetByIdQuery()`.

::: code-group

```ts [example]
const { data, error } = useQuery({
  ...getPetByIdQuery({
    path: {
      petId: 1,
    },
  }),
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@pinia/colada',
      queryOptions: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `queryOptions` functions using the `.name` and `.case` options.

### Meta

You can use the `meta` field to attach arbitrary information to a query. To generate metadata for `queryOptions`, provide a function to the `.meta` option.

::: code-group

```ts [example]
queryOptions({
  // ...other fields
  meta: {
    id: 'getPetById',
  },
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@pinia/colada',
      queryOptions: {
        meta: (operation) => ({ id: operation.id }), // [!code ++]
      },
    },
  ],
};
```

:::

## Query Keys

Query keys contain normalized SDK function parameters and additional metadata.

::: code-group

```ts [example]
const queryKey = [
  {
    _id: 'getPetById',
    baseUrl: 'https://app.heyapi.dev',
    path: {
      petId: 1,
    },
  },
];
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@pinia/colada',
      queryKeys: true, // [!code ++]
    },
  ],
};
```

:::

### Accessing Query Keys

If you have access to the result of query options function, you can get the query key from the `queryKey` field.

::: code-group

```ts [example]
const { queryKey } = getPetByIdOptions({
  path: {
    petId: 1,
  },
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@pinia/colada',
      queryOptions: true, // [!code ++]
    },
  ],
};
```

:::

Alternatively, you can access the same query key by calling query key functions. The generated query key functions follow the naming convention of SDK functions and by default append `QueryKey`, e.g. `getPetByIdQueryKey()`.

::: code-group

```ts [example]
const queryKey = getPetByIdQueryKey({
  path: {
    petId: 1,
  },
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@pinia/colada',
      queryKeys: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `queryKeys` functions using the `.name` and `.case` options.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@pinia/colada/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
