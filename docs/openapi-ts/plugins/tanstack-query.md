---
title: TanStack Query v5 Plugin
description: Generate TanStack Query v5 functions and query keys from OpenAPI with the TanStack Query plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
import VersionLabel from '@components/VersionLabel.vue';

import { embedProject } from '../../embed'
</script>

<Heading>
  <h1>TanStack Query<span class="sr-only"> v5</span></h1>
  <VersionLabel value="v5" />
</Heading>

### About

[TanStack Query](https://tanstack.com/query) is a powerful asynchronous state management solution for TypeScript/JavaScript, React, Solid, Vue, Svelte, and Angular.

The TanStack Query plugin for Hey API generates functions and query keys from your OpenAPI spec, fully compatible with SDKs, transformers, and all core features.

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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/react-query', // [!code ++]
  ],
};
```

```js [vue]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/vue-query', // [!code ++]
  ],
};
```

```js [angular]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/angular-query-experimental', // [!code ++]
  ],
};
```

```js [svelte]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@tanstack/svelte-query', // [!code ++]
  ],
};
```

```js [solid]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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

Queries are generated from [query operations](/openapi-ts/configuration/parser#hooks-query-operations). The generated query functions follow the naming convention of SDK functions and by default append `Options`, e.g. `getPetByIdOptions()`.

::: code-group

```ts [example]
const query = useQuery({
  ...getPetByIdOptions({
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
      name: '@tanstack/react-query',
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
      name: '@tanstack/react-query',
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
      name: '@tanstack/react-query',
      queryKeys: true, // [!code ++]
    },
  ],
};
```

:::

### Tags

You can include operation tags in your query keys by setting `tags` to `true`. This will make query keys larger but provides better cache invalidation capabilities.

::: code-group

```ts [example]
const queryKey = [
  {
    _id: 'getPetById',
    baseUrl: 'https://app.heyapi.dev',
    path: {
      petId: 1,
    },
    tags: ['pets', 'one', 'get'], // [!code ++]
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
      name: '@tanstack/react-query',
      queryKeys: {
        tags: true, // [!code ++]
      },
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
      name: '@tanstack/react-query',
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
      name: '@tanstack/react-query',
      queryKeys: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `queryKeys` functions using the `.name` and `.case` options.

## Infinite Queries

Infinite queries are generated from [query operations](/openapi-ts/configuration/parser#hooks-query-operations) if we detect a [pagination](/openapi-ts/configuration/parser#pagination) parameter. The generated infinite query functions follow the naming convention of SDK functions and by default append `InfiniteOptions`, e.g. `getFooInfiniteOptions()`.

::: code-group

```ts [example]
const query = useInfiniteQuery({
  ...getFooInfiniteOptions({
    path: {
      fooId: 1,
    },
  }),
  getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  initialPageParam: 0,
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@tanstack/react-query',
      infiniteQueryOptions: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `infiniteQueryOptions` functions using the `.name` and `.case` options.

### Meta

You can use the `meta` field to attach arbitrary information to a query. To generate metadata for `infiniteQueryOptions`, provide a function to the `.meta` option.

::: code-group

```ts [example]
infiniteQueryOptions({
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
      name: '@tanstack/react-query',
      infiniteQueryOptions: {
        meta: (operation) => ({ id: operation.id }), // [!code ++]
      },
    },
  ],
};
```

:::

## Infinite Query Keys

Infinite query keys contain normalized SDK function parameters and additional metadata.

::: code-group

```ts [example]
const queryKey = [
  {
    _id: 'getPetById',
    _infinite: true,
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
      name: '@tanstack/react-query',
      infiniteQueryKeys: true, // [!code ++]
    },
  ],
};
```

:::

### Tags

You can include operation tags in your infinite query keys by setting `tags` to `true`. This will make query keys larger but provides better cache invalidation capabilities.

::: code-group

```ts [example]
const queryKey = [
  {
    _id: 'getPetById',
    _infinite: true,
    baseUrl: 'https://app.heyapi.dev',
    path: {
      petId: 1,
    },
    tags: ['pets', 'one', 'get'], // [!code ++]
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
      name: '@tanstack/react-query',
      infiniteQueryKeys: {
        tags: true, // [!code ++]
      },
    },
  ],
};
```

:::

### Accessing Infinite Query Keys

If you have access to the result of infinite query options function, you can get the query key from the `queryKey` field.

::: code-group

```ts [example]
const { queryKey } = getPetByIdInfiniteOptions({
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
      name: '@tanstack/react-query',
      infiniteQueryOptions: true, // [!code ++]
    },
  ],
};
```

:::

Alternatively, you can access the same query key by calling query key functions. The generated query key functions follow the naming convention of SDK functions and by default append `InfiniteQueryKey`, e.g. `getPetByIdInfiniteQueryKey()`.

::: code-group

```ts [example]
const queryKey = getPetByIdInfiniteQueryKey({
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
      name: '@tanstack/react-query',
      infiniteQueryKeys: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `infiniteQueryKeys` functions using the `.name` and `.case` options.

## Mutations

Mutations are generated from [mutation operations](/openapi-ts/configuration/parser#hooks-mutation-operations). The generated mutation functions follow the naming convention of SDK functions and by default append `Mutation`, e.g. `addPetMutation()`.

::: code-group

```ts [example]
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

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@tanstack/react-query',
      mutationOptions: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `mutationOptions` functions using the `.name` and `.case` options.

### Meta

You can use the `meta` field to attach arbitrary information to a mutation. To generate metadata for `mutationOptions`, provide a function to the `.meta` option.

::: code-group

```ts [example]
const mutationOptions = {
  // ...other fields
  meta: {
    id: 'getPetById',
  },
};
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@tanstack/react-query',
      mutationOptions: {
        meta: (operation) => ({ id: operation.id }), // [!code ++]
      },
    },
  ],
};
```

:::

## Reactivity

For Vue applications, to ensure reactivity works correctly with generated query options, you need to wrap the options functions in `computed()`. This ensures that when your reactive dependencies change, TanStack Query will re-execute the query with the updated parameters.

::: code-group

```ts [example]
import { computed, ref } from 'vue';
import { useInfiniteQuery } from '@tanstack/vue-query';
import { listUsersInfiniteOptions } from './client';

const search = ref('');

const { data, dataUpdatedAt } = useInfiniteQuery(
  computed(() => listUsersInfiniteOptions({
    query: {
      search: search.value
    }
  }))
);
```

```ts [without computed - won't be reactive]
// ❌ This won't react to changes in search.value
const { data } = useInfiniteQuery(
  listUsersInfiniteOptions({
    query: {
      search: search.value // Fixed at initial value
    }
  })
);
```

```ts [with computed - reactive]
// ✅ This will re-run when search.value changes
const { data } = useInfiniteQuery(
  computed(() => listUsersInfiniteOptions({
    query: {
      search: search.value
    }
  }))
);
```

:::

This applies to all generated options functions:
- `*Options()` for regular queries
- `*InfiniteOptions()` for infinite queries
- `*Mutation()` for mutations

The generated functions are already wrapped in `queryOptions()`, `infiniteQueryOptions()`, and `mutationOptions()` respectively, which matches the official TanStack Query documentation patterns.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@tanstack/react-query/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
