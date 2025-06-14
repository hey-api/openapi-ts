---
title: TypeScript
description: Learn about files generated with @hey-api/openapi-ts.
---

# TypeScript

TypeScript interfaces are located in the `types.gen.ts` file. This is the only file that does not impact your bundle size and runtime performance. It will get discarded during build time, unless you configured to emit runtime [enums](#enums).

This file contains three different categories of interfaces created from your input:

- reusable components
- operation request, response, and error data
- enums

Depending on your input and configuration, some of these categories might be missing or differ in your output (and that's okay!).

::: code-group

```ts [types.gen.ts]
export type Pet = {
  id?: number;
  name: string;
};

export type AddPetData = {
  body: Pet;
};

export type AddPetResponse = Pet;
```

:::

Every generated interface inside `types.gen.ts` is exported. You can import individual exports in your application and use them as necessary.

## Configuration

You can modify the contents of `types.gen.ts` by configuring the `@hey-api/typescript` plugin. Note that you must specify the default plugins to preserve the default output.

```js
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    {
      name: '@hey-api/typescript',
      // ...custom options // [!code ++]
    },
  ],
};
```

## Enums

By default, `@hey-api/openapi-ts` will only emit enums as types. You may want to generate runtime artifacts. A good use case is iterating through possible field values without manually typing arrays. To emit runtime enums, set `enums` to a valid option.

::: code-group

```js [disabled]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    {
      enums: false, // default // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

```js [javascript]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    {
      enums: 'javascript', // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

```js [typescript]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    {
      enums: 'typescript', // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

:::

We recommend exporting enums as plain JavaScript objects. [TypeScript enums](https://www.typescriptlang.org/docs/handbook/enums.html) are not a type-level extension of JavaScript and pose [typing challenges](https://dev.to/ivanzm123/dont-use-enums-in-typescript-they-are-very-dangerous-57bh).

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
