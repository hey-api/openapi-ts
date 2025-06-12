---
title: TanStack Query
description: TanStack Query plugin for Hey API. Compatible with all our features.
---

<script setup>
import { embedProject } from '../../embed'
</script>

# TanStack Query

::: warning
TanStack Query plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

### About

[TanStack Query](https://tanstack.com/query) is a powerful asynchronous state management solution for TypeScript/JavaScript, React, Solid, Vue, Svelte, and Angular.

### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-tanstack-react-query-example')(event)">
Launch demo
</button>

## Features

- seamless integration with `@hey-api/openapi-ts` ecosystem
- create query keys following the best practices
- type-safe query options, infinite query options, and mutation options
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add TanStack Query to your plugins and you'll be ready to generate TanStack Query artifacts. :tada:

::: code-group

```js [react]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    '@tanstack/react-query', // [!code ++]
  ],
};
```

```js [vue]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    '@tanstack/vue-query', // [!code ++]
  ],
};
```

```js [angular]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    '@tanstack/angular-query-experimental', // [!code ++]
  ],
};
```

```js [svelte]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    '@tanstack/svelte-query', // [!code ++]
  ],
};
```

```js [solid]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    '@tanstack/solid-query', // [!code ++]
  ],
};
```

:::

## Output

The TanStack Query plugin will generate the following artifacts, depending on the input specification.

## Queries

Queries are generated from GET and POST endpoints. The generated query functions follow the naming convention of SDK functions and by default append `Options`, e.g. `getPetByIdOptions()`.

```ts
const { data, error } = useQuery({
  ...getPetByIdOptions({
    path: {
      petId: 1,
    },
  }),
});
```

You can customize query function names using `queryOptionsNameBuilder`.

## Infinite Queries

Infinite queries are generated from GET and POST endpoints if we detect a [pagination](/openapi-ts/configuration#pagination) parameter. The generated infinite query functions follow the naming convention of SDK functions and by default append `InfiniteOptions`, e.g. `getFooInfiniteOptions()`.

```ts
const { data, error } = useInfiniteQuery({
  ...getFooInfiniteOptions({
    path: {
      fooId: 1,
    },
  }),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  initialPageParam: 0,
});
```

You can customize infinite query function names using `infiniteQueryOptionsNameBuilder`.

## Mutations

Mutations are generated from DELETE, PATCH, POST, and PUT endpoints. The generated mutation functions follow the naming convention of SDK functions and by default append `Mutation`, e.g. `addPetMutation()`.

```ts
const addPet = useMutation({
  ...addPetMutation(),
  onError: (error) => {
    console.log(error);
  },
});

addPet.mutate({
  body: {
    name: 'Kitty',
  },
});
```

You can customize mutation function names using `mutationOptionsNameBuilder`.

## Query Keys

Query keys are generated for both queries and infinite queries. If you have access to the result of query or infinite query options function, you can get the query key from the `queryKey` field.

```ts
const { queryKey } = getPetByIdOptions({
  path: {
    petId: 1,
  },
});
```

Alternatively, you can access the same query key by calling query key functions. The generated query key functions follow the naming convention of SDK functions and by default append `QueryKey` or `InfiniteQueryKey`, e.g. `getPetByIdQueryKey()` or `getPetByIdInfiniteQueryKey()`.

```ts
const queryKey = getPetByIdQueryKey({
  path: {
    petId: 1,
  },
});
```

You can customize query key function names using `queryKeyNameBuilder` and `infiniteQueryKeyNameBuilder`.

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
