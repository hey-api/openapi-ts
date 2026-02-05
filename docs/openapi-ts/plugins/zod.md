---
title: Zod v4 Plugin
description: Generate Zod v4 schemas from OpenAPI with the Zod plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
import ZodVersionSwitcher from '@versions/ZodVersionSwitcher.vue';
</script>

<Heading>
  <h1>Zod<span class="sr-only"> v4</span></h1>
  <ZodVersionSwitcher />
</Heading>

### About

[Zod](https://zod.dev) is a TypeScript-first schema validation library with static type inference.

The Zod plugin for Hey API generates schemas from your OpenAPI spec, fully compatible with validators, transformers, and all core features.

## Features

- Zod v4 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- Zod schemas for requests, responses, and reusable definitions
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add `zod` to your plugins and you'll be ready to generate Zod artifacts. :tada:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    'zod', // [!code ++]
  ],
};
```

### SDKs

To add data validators to your SDKs, set `sdk.validator` to `true`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    'zod',
    {
      name: '@hey-api/sdk', // [!code ++]
      validator: true, // [!code ++]
    },
  ],
};
```

Learn more about data validators in your SDKs on the [SDKs](/openapi-ts/plugins/sdk#validators) page.

## Output

The Zod plugin will generate the following artifacts, depending on the input specification.

## Requests

A single request schema is generated for each endpoint. It may contain a request body, parameters, and headers.

::: code-group

```ts [example]
const zData = z.object({
  body: z
    .object({
      foo: z.optional(z.string()),
      bar: z.optional(z.union([z.number(), z.null()])),
    })
    .optional(),
  path: z.object({
    baz: z.string(),
  }),
  query: z.optional(z.never()),
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      requests: true, // [!code ++]
    },
  ],
};
```

:::

::: tip
If you need to access individual fields, you can do so using the [`.shape`](https://zod.dev/api?id=shape) API. For example, we can get the request body schema with `zData.shape.body`.
:::

You can customize the naming and casing pattern for `requests` schemas using the `.name` and `.case` options.

## Responses

A single Zod schema is generated for all endpoint's responses. If the endpoint describes multiple responses, the generated schema is a union of all possible response shapes.

::: code-group

```ts [example]
const zResponse = z.union([
  z.object({
    foo: z.optional(z.string()),
  }),
  z.object({
    bar: z.optional(z.number()),
  }),
]);
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      responses: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `responses` schemas using the `.name` and `.case` options.

## Definitions

A Zod schema is generated for every reusable definition from your input.

::: code-group

```ts [example]
const zFoo = z.int();

const zBar = z.object({
  bar: z.optional(z.array(z.int())),
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      definitions: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `definitions` schemas using the `.name` and `.case` options.

## ISO Datetimes

By default, values without a timezone or with a timezone offset are not allowed in the `z.iso.datetime()` method.

### Timezone offsets

You can allow values with timezone offsets by setting `dates.offset` to `true`.

::: code-group

```ts [example]
export const zFoo = z.iso.datetime({ offset: true });
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      dates: {
        offset: true, // [!code ++]
      },
    },
  ],
};
```

:::

### Local times

You can allow values without a timezone by setting `dates.local` to `true`.

::: code-group

```ts [example]
export const zFoo = z.iso.datetime({ local: true });
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      dates: {
        local: true, // [!code ++]
      },
    },
  ],
};
```

:::

## Nullish

By default, non-required object properties generate `.optional()`, which accepts `undefined` values. If you'd like non-required properties to also accept `null`, you can set `useNullish` to `true`. This generates `.nullish()` instead of `.optional()`.

::: code-group

```ts [example]
const zFoo = z.object({
  bar: z.nullish(z.string()),
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      useNullish: true, // [!code ++]
    },
  ],
};
```

:::

## Metadata

It's often useful to associate a schema with some additional [metadata](https://zod.dev/metadata) for documentation, code generation, AI structured outputs, form validation, and other purposes. If this is your use case, you can set `metadata` to `true` to generate additional metadata about schemas.

::: code-group

```ts [example]
export const zFoo = z.string().register(z.globalRegistry, {
  description: 'Additional metadata',
});
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      metadata: true, // [!code ++]
    },
  ],
};
```

:::

## Types

In addition to Zod schemas, you can generate schema-specific types. These can be generated for all schemas or for specific resources.

::: code-group

```ts [example]
export type ResponseZodType = z.infer<typeof zResponse>;
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      types: {
        infer: false, // by default, no `z.infer` types [!code ++]
      },
      responses: {
        types: {
          infer: true, // `z.infer` types only for response schemas [!code ++]
        },
      },
    },
  ],
};
```

:::

You can customize the naming and casing pattern for schema-specific `types` using the `.name` and `.case` options.

## Resolvers

You can further customize this plugin's behavior using [resolvers](/openapi-ts/plugins/concepts/resolvers).

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/zod/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
