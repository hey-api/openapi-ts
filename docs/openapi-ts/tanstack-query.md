---
title: TanStack Query
description: Generate query keys and functions. Use them with our REST clients or bring your own.
---

<script setup>
import { embedProject } from '../embed'
</script>

# TanStack Query

::: warning
TanStack Query plugin is currently in beta. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

[TanStack Query](https://tanstack.com/query) is one of the most popular state management solutions. Hey API can generate query keys and functions for you, so you can focus on building your product. Everything is compatible with our REST clients, but you can bring your own too.

<button class="buttonLink" @click="(event) => embedProject('hey-api-client-fetch-plugin-tanstack-react-query-example')(event)">
Live demo
</button>

## Installation

Ensure you have already [configured](/openapi-ts/get-started) `@hey-api/openapi-ts`. Update your configuration to use the TanStack Query plugin.

::: code-group

```js{5} [react]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: ['@tanstack/react-query'], // [!code ++]
}
```

```js{5} [vue]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: ['@tanstack/vue-query'], // [!code ++]
}
```

```js{5} [solid]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: ['@tanstack/solid-query'], // [!code ++]
}
```

```js{5} [svelte]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: ['@tanstack/svelte-query'], // [!code ++]
}
```

:::

You can now run `openapi-ts` to generate TanStack Query artifacts. 🎉

## Output

The TanStack Query plugin will optionally generate the following output layers, depending on the input specification.

## Queries

Queries are generated from GET and POST endpoints. The generated functions follow the naming convention of services and append `Options`, e.g. `getPetByIdOptions()`.

```ts
const { data, error } = useQuery({
  ...getPetByIdOptions({
    path: {
      petId: 1,
    },
  }),
});
```

## Infinite Queries

Infinite queries are generated from GET and POST endpoints if we detect a pagination parameter. The generated functions follow the naming convention of services and append `InfiniteOptions`, e.g. `getFooInfiniteOptions()`.

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

## Mutations

Mutations are generated from DELETE, PATCH, POST, and PUT endpoints. The generated functions follow the naming convention of services and append `Mutation`, e.g. `addPetMutation()`.

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

## Query Keys

Query keys are generated for both queries and infinite queries. If you have access to the result of query or infinite query options function, you can get the query key from the `queryKey` field.

```ts
const { queryKey } = getPetByIdOptions({
  path: {
    petId: 1,
  },
});
```

Alternatively, you can access the same query key by calling `QueryKey` or `InfiniteQueryKey` function.

```ts
const queryKey = getPetByIdQueryKey({
  path: {
    petId: 1,
  },
});
```

<!--@include: ../examples.md-->
<!--@include: ../sponsorship.md-->
