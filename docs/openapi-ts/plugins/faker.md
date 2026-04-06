---
title: Faker Plugin
description: Generate realistic mock data factories from OpenAPI with the Faker plugin for openapi-ts. Compatible with Faker v9 and v10.
---

<script setup lang="ts">
import Heading from '@components/Heading.vue';
</script>

<Heading>
  <h1>Faker<span class="sr-only"> v9 & v10</span></h1>
</Heading>

### About

[Faker](https://fakerjs.dev) is a popular library that generates fake (but reasonable) data that can be used for things such as unit testing, performance testing, building demos, and working without a completed backend.

The Faker plugin for Hey API generates factory functions from your OpenAPI spec that return realistic mock data using `@faker-js/faker`.

## Features

- Faker v9 and v10 support
- seamless integration with `@hey-api/openapi-ts` ecosystem
- factory functions for reusable schema definitions, operation requests, and operation responses
- smart property name inference for realistic data (e.g. `email` &rarr; `faker.internet.email()`)
- constraint and format awareness (min/max, string formats, array bounds)
- optional property and default value handling
- dependency injection for custom faker instances (locale, seed)
- minimal learning curve thanks to extending the underlying technology

## Installation

In your [configuration](/openapi-ts/get-started), add `@faker-js/faker` to your plugins and you'll be ready to generate faker factories. :tada:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@faker-js/faker', // [!code ++]
  ],
};
```

## Output

The Faker plugin will generate the following artifacts, depending on the input specification.

## Definitions

A factory function is generated for every reusable definition from your input.

::: code-group

```ts [example]
import { faker, type Faker } from '@faker-js/faker';

import type { Bar, Foo } from '../types.gen';

export const fakeFoo = (options?: Options): Foo => ({
  name: ensureFaker(options).string.sample(),
  age: ensureFaker(options).number.int({ min: 1, max: 120 }),
});

export const fakeBar = (options?: Options): Bar =>
  ensureFaker(options).helpers.arrayElement(['baz', 'qux']);
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@faker-js/faker',
      definitions: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `definitions` factories using the `.name` and `.case` options.

## Requests

A single factory function is generated per operation for request data. It combines the request body, path parameters, query parameters, and headers into one object. Only keys with actual data are included.

::: code-group

```ts [example]
// body + path + query combined into one factory
export const fakeUpdatePetRequest = (options?: Options): Omit<UpdatePetData, 'url'> => {
  const f = options?.faker ?? faker;
  return {
    body: {
      name: f.string.sample(),
      tag: fakeTag(options),
    },
    path: {
      id: f.string.uuid(),
    },
    query: {
      dryRun: f.datatype.boolean(),
    },
  };
};

// body only
export const fakeCreatePetRequest = (options?: Options): Omit<CreatePetData, 'url'> => {
  const f = options?.faker ?? faker;
  return {
    body: {
      name: f.string.sample(),
    },
  };
};
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@faker-js/faker',
      requests: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `requests` factories using the `.name` and `.case` options.

## Responses

A factory function is generated for operation responses. When an operation has a single success response, the factory is unsuffixed. When multiple responses exist, each factory is suffixed with the status code.

::: code-group

```ts [example]
// single success response — unsuffixed
export const fakeCreatePetResponse = (options?: Options): CreatePetResponse => fakePet(options);

// multiple responses — suffixed with status code
export const fakeGetPetResponse200 = (options?: Options): GetPetResponses[200] => fakePet(options);

export const fakeGetPetResponse404 = (options?: Options): GetPetErrors[404] => fakeError(options);
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@faker-js/faker',
      responses: true, // [!code ++]
    },
  ],
};
```

:::

You can customize the naming and casing pattern for `responses` factories using the `.name` and `.case` options.

## Smart Inference

The plugin infers semantically appropriate faker methods from property names, producing more realistic mock data without requiring explicit schema formats or annotations.

```ts
// property name "email" → faker.internet.email()
// property name "firstName" → faker.person.firstName()
// property name "city" → faker.location.city()
// property name "id" → faker.string.uuid()
// property name "age" → faker.number.int({ min: 1, max: 120 })
```

Ancestor context is also used for disambiguation. For example, `name` under a `User` schema produces `faker.person.fullName()`, while `name` under a `Company` schema produces `faker.company.name()`.

Explicit schema annotations (format, pattern, constraints) always take priority over name-based inference.

### Name Rules

You can extend or override the built-in name inference with custom `nameRules`. Rules are defined per schema type (`string` or `number`) and map property names to specific faker methods.

::: code-group

```ts [output]
export const fakeError = (options?: Options): Error => {
  const f = options?.faker ?? faker;
  return {
    code: f.number.int(),
    message: f.word.words({ count: 4 }),
  };
};

export const fakeDocument = (options?: Options): Document => {
  const f = options?.faker ?? faker;
  return {
    id: f.database.mongodbObjectId(),
    _id: f.database.mongodbObjectId(),
  };
};
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@faker-js/faker',
      nameRules: {
        // [!code ++]
        string: {
          // [!code ++]
          // compound rule: "message" inside an "error" schema // [!code ++]
          'error.message': {
            // [!code ++]
            fakerPath: ['word', 'words'], // [!code ++]
            defaultArgs: { count: 4 }, // [!code ++]
          }, // [!code ++]
          // suffix rule: any property ending with "id" // [!code ++]
          id: {
            // [!code ++]
            fakerPath: ['database', 'mongodbObjectId'], // [!code ++]
            suffixMatch: true, // [!code ++]
          }, // [!code ++]
        }, // [!code ++]
      }, // [!code ++]
    },
  ],
};
```

:::

Each rule requires a `fakerPath` — a tuple of `[module, method]` corresponding to a faker method (e.g. `['database', 'mongodbObjectId']` for `faker.database.mongodbObjectId()`). You can optionally provide `defaultArgs` to pass default arguments to the faker method.

**Matching strategies:**

- **Exact match** — `'email'` matches a property named `email`
- **Compound match** — `'error.message'` matches a property named `message` inside an ancestor named `error`
- **Suffix match** — `'id'` with `suffixMatch: true` matches any property ending with `id` (e.g. `userId`, `_id`)

User-provided rules take priority over built-in rules. Property names are normalized (lowercased, separators removed) before matching.

## Formats and Constraints

The plugin respects OpenAPI schema formats and constraints to generate appropriately bounded data.

**String formats:**

- `email` &rarr; `faker.internet.email()`
- `date-time` &rarr; `faker.date.recent().toISOString()`
- `date` &rarr; `faker.date.recent().toISOString().slice(0, 10)`
- `uuid` &rarr; `faker.string.uuid()`
- `uri` / `url` &rarr; `faker.internet.url()`
- `ipv4` &rarr; `faker.internet.ipv4()`
- `ipv6` &rarr; `faker.internet.ipv6()`
- `pattern` &rarr; `faker.helpers.fromRegExp(pattern)`

**Numeric constraints:**

- `minimum` / `maximum` &rarr; `faker.number.int({ min, max })`
- `exclusiveMinimum` / `exclusiveMaximum` &rarr; adjusted bounds

**String constraints:**

- `minLength` / `maxLength` &rarr; `faker.string.alpha({ length: { min, max } })`

**Array constraints:**

- `minItems` / `maxItems` &rarr; controls count in `faker.helpers.multiple()`

## Optional Properties

Required properties are always included. Optional properties are controlled by the `includeOptional` option at runtime.

```ts
const user = fakeFoo(); // includes optional properties by default
const user = fakeFoo({ includeOptional: false }); // excludes optional properties
const user = fakeFoo({ includeOptional: 0.5 }); // 50% probability per optional property
```

## Default Values

When a schema defines default values, you can control whether to use them instead of generating fake data via the `useDefault` option.

```ts
const data = fakeFoo(); // always generates fake data
const data = fakeFoo({ useDefault: true }); // uses schema defaults when available
const data = fakeFoo({ useDefault: 0.5 }); // 50% probability of using defaults
```

## Circular References

Schemas with circular references are automatically detected, whether self-referencing (a schema that refers to itself) or mutually recursive (two or more schemas that refer to each other). The generated factories use a depth counter to prevent infinite recursion, returning empty arrays or omitting optional properties once the limit is reached.

The maximum depth defaults to `10` and can be configured via the `maxCallDepth` option.

## Locale

You can configure the locale for generated faker factories. When set, the generated code imports the faker instance from the locale-specific build of `@faker-js/faker`.

::: code-group

```ts [output]
import { faker } from '@faker-js/faker/locale/de';
import type { Faker } from '@faker-js/faker';
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@faker-js/faker',
      locale: 'de', // [!code ++]
    },
  ],
};
```

:::

See the [Faker localization guide](https://fakerjs.dev/guide/localization) for available locales.

## Deterministic Results

For snapshot testing or reproducible output, you can seed the faker instance and fix the reference date to ensure deterministic results.

```ts
import { faker } from '@faker-js/faker';

faker.seed(42);
faker.setDefaultRefDate('2026-01-01T00:00:00.000Z');

const data = fakeFoo();
// always returns the same output
```

## Custom Faker Instance

You can pass your own [faker instance](https://fakerjs.dev/api/faker.html) via the `faker` option for runtime locale switching or other customizations.

```ts
import { faker } from '@faker-js/faker/locale/de';

const data = fakeFoo({ faker });
```

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@faker-js/faker/types.ts) interface.

<!--@include: ../../partials/sponsors.md-->
