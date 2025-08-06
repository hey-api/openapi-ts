---
title: TanStack Query v5 Plugin
description: Generate TanStack Query v5 functions and query keys from OpenAPI with the TanStack Query plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import { embedProject } from '../../embed'
</script>

<Heading>
  <h1>TanStack Query</h1>
  <VersionLabel value="v5" />
</Heading>

### About

[TanStack Query](https://tanstack.com/query) is a powerful asynchronous state management solution for TypeScript/JavaScript, React, Solid, Vue, Svelte, and Angular.

### Demo

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-tanstack-react-query-example')(event)">
Launch demo
</button>

## Features

- TanStack Query v5 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- create query keys following the best practices
- type-safe query options, infinite query options, and mutation options
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add TanStack Query to your plugins and you'll be ready to generate TanStack Query artifacts. :tada:

::: code-group

```js [react]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/react-query', // [!code ++]
  ],
};
```

```js [vue]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/vue-query', // [!code ++]
  ],
};
```

```js [angular]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/angular-query-experimental', // [!code ++]
  ],
};
```

```js [svelte]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/svelte-query', // [!code ++]
  ],
};
```

```js [solid]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
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

You can customize the naming and casing pattern for `queryOptions` functions using the `.name` and `.case` options.

## Query Keys

If you have access to the result of query options function, you can get the query key from the `queryKey` field.

```ts
const { queryKey } = getPetByIdOptions({
  path: {
    petId: 1,
  },
});
```

Alternatively, you can access the same query key by calling query key functions. The generated query key functions follow the naming convention of SDK functions and by default append `QueryKey`, e.g. `getPetByIdQueryKey()`.

```ts
const queryKey = getPetByIdQueryKey({
  path: {
    petId: 1,
  },
});
```

You can customize the naming and casing pattern for `queryKeys` functions using the `.name` and `.case` options.

## Infinite Queries

Infinite queries are generated from GET and POST endpoints if we detect a [pagination](/openapi-ts/configuration/parser#pagination) parameter. The generated infinite query functions follow the naming convention of SDK functions and by default append `InfiniteOptions`, e.g. `getFooInfiniteOptions()`.

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

You can customize the naming and casing pattern for `infiniteQueryOptions` functions using the `.name` and `.case` options.

## Infinite Query Keys

If you have access to the result of infinite query options function, you can get the query key from the `queryKey` field.

```ts
const { queryKey } = getPetByIdInfiniteOptions({
  path: {
    petId: 1,
  },
});
```

Alternatively, you can access the same query key by calling query key functions. The generated query key functions follow the naming convention of SDK functions and by default append `InfiniteQueryKey`, e.g. `getPetByIdInfiniteQueryKey()`.

```ts
const queryKey = getPetByIdInfiniteQueryKey({
  path: {
    petId: 1,
  },
});
```

You can customize the naming and casing pattern for `infiniteQueryKeys` functions using the `.name` and `.case` options.

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

You can customize the naming and casing pattern for `mutationOptions` functions using the `.name` and `.case` options.

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@tanstack/react-query/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
