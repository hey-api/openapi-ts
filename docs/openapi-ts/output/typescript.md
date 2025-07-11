---
title: TypeScript
description: Learn about files generated with @hey-api/openapi-ts.
---

# TypeScript

TypeScript interfaces are located in the `types.gen.ts` file. This is the only file that does not impact your bundle size and runtime performance. It will get discarded during build time, unless you configured to emit runtime [enums](#enums).

## Installation

In your [configuration](/openapi-ts/get-started), add `@hey-api/typescript` to your plugins and you'll be ready to generate TypeScript artifacts. :tada:

```js
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@hey-api/typescript', // [!code ++]
  ],
};
```

:::tip
The `@hey-api/typescript` plugin might be implicitly added to your `plugins` if another plugin depends on it.
:::

## Output

The TypeScript plugin will generate the following artifacts, depending on the input specification.

## Requests

A single request type is generated for each endpoint. It may contain a request body, parameters, and headers.

```ts
export type AddPetData = {
  body: {
    id?: number;
    name: string;
  };
  path?: never;
  query?: never;
  url: '/pets';
};
```

You can customize the naming and casing pattern for `requests` types using the `.name` and `.case` options.

## Responses

A single type is generated for all endpoint's responses.

```ts
export type AddPetResponses = {
  200: {
    id?: number;
    name: string;
  };
};

export type AddPetResponse = AddPetResponses[keyof AddPetResponses];
```

You can customize the naming and casing pattern for `responses` types using the `.name` and `.case` options.

## Definitions

A type is generated for every reusable definition from your input.

```ts
export type Pet = {
  id?: number;
  name: string;
};
```

You can customize the naming and casing pattern for `definitions` types using the `.name` and `.case` options.

## Enums

By default, `@hey-api/typescript` will emit enums only as types. You may want to generate runtime artifacts. A good use case is iterating through possible field values without manually typing arrays. To emit runtime enums, set `enums` to a valid option.

::: code-group

```js [disabled]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      enums: false, // default // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

```js [javascript]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      enums: 'javascript', // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

```js [typescript]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      enums: 'typescript', // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

:::

We recommend exporting enums as plain JavaScript objects. [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html) are not a type-level extension of JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh).

## Config API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/typescript/types.d.ts) interface.

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
