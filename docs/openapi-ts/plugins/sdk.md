---
title: SDK Plugin
description: Generate SDKs from OpenAPI with the SDK plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

# SDK

### About

The SDK plugin generates a high-level, ergonomic API layer on top of the low-level HTTP client.

It exposes typed functions or classes for each operation, with built-in auth handling and optional request and response validation.

## Features

- high-level SDK layer on top of the HTTP client
- typed functions or classes per operation
- built-in authentication handling
- optional request and response validation

## Installation

In your [configuration](/openapi-ts/get-started), add `@hey-api/sdk` to your plugins and you'll be ready to generate SDK artifacts. :tada:

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@hey-api/sdk', // [!code ++]
  ],
};
```

## Output

The SDK plugin supports a wide range of configuration options. This guide focuses on two main SDK formats: tree-shakeable functions and instantiable classes, but you can apply the same concepts to create more advanced configurations.

## Flat

This is the default setting. Flat SDKs support tree-shaking, which can lead to a reduced bundle size. You select flat mode by setting `operations.strategy` to `flat`.

::: code-group

```ts [example]
import type { AddPetData } from './types.gen';

export const addPet = (options: Options<AddPetData>) => {
  /** ... */
};
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/sdk',
      operations: {
        strategy: 'flat', // [!code ++]
      },
    },
  ],
};
```

:::

## Instance

Class SDKs do not support tree-shaking, which results in a larger bundle size, but you may prefer their syntax. You select class mode by setting `operations.strategy` to `single`.

::: code-group

```ts [example]
import type { AddPetData } from './types.gen';

export class Sdk extends HeyApiClient {
  public addPet(options: Options<AddPetData>) {
    /** ... */
  }
}
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/sdk',
      operations: {
        strategy: 'single', // [!code ++]
      },
    },
  ],
};
```

:::

### Name

As shown above, by default our SDK class is called `Sdk`. The first thing you'll likely want to do is change this to your preferred name, which you can do using `operation.containerName`.

::: code-group

<!-- prettier-ignore-start -->
```ts [example]
import { client } from './client.gen';
import type { AddPetData, AddPetErrors, AddPetResponses } from './types.gen';

export class PetStore extends HeyApiClient { // [!code ++]
  /** ... */
}
```
<!-- prettier-ignore-end -->

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/sdk',
      operations: {
        containerName: 'PetStore', // [!code ++]
        strategy: 'single',
      },
    },
  ],
};
```

:::

### Structure

While we try to infer the SDK structure from `operationId` fields, you'll likely want to customize it further. You can do this using `operations.nesting`.

Similar to the `operations.strategy` option, we provide a few presets. However, you gain the most control by providing your own function.

To demonstrate the power of this feature, let's nest a few endpoints inside a `Pet` class and rename them. Our original `addPet()` method will now become `pet.add()`. Notice that we use the built-in `OperationPath.fromOperationId()` helper to handle the remaining operations.

::: code-group

<!-- prettier-ignore-start -->
```ts [example]
import { client } from './client.gen';
import type { AddPetData, AddPetErrors, AddPetResponses } from './types.gen';

export class Pet extends HeyApiClient {
  public add(options: Options<PostPetData>) { // [!code ++]
    /** ... */
  }
}

export class PetStore extends HeyApiClient {
  get pet(): Pet { // [!code ++]
    /** ... */
  }
}
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/sdk',
      operations: {
        containerName: 'PetStore',
        nesting(operation) {
          if (operation.path === '/pet/{petId}' || operation.path === '/pet') { // [!code ++]
            return ['pet', operation.operationId?.replace(/Pet/, '') // [!code ++]
              || operation.method.toLocaleLowerCase()]; // [!code ++]
          } // [!code ++]
          return OperationPath.fromOperationId()(operation); // [!code ++]
        },
        strategy: 'single',
      },
    },
  ],
};
```
<!-- prettier-ignore-end -->

:::

## Auth

Most APIs require some form of authentication, which is why the SDK plugin provides built-in auth mechanisms by default. All you need to do is return the data from the `auth()` function, and the SDK will handle serialization and encoding for you. There are several ways to do this, for example on the client instance.

::: code-group

```ts [example]
import { client } from './client.gen';

client.setConfig({
  auth() {
    return '<token>';
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
      auth: true, // [!code ++]
      name: '@hey-api/sdk',
    },
  ],
};
```

:::

::: info
The SDK plugin currently supports only the `bearer` and `basic` auth schemes. [Open an issue](https://github.com/hey-api/openapi-ts/issues) if you'd like support for additional mechanisms.
:::

## Validators

Validating data at runtime comes with a performance cost, which is why it's not enabled by default. To enable validation, set `validator` to `zod` or one of the available [validator plugins](/openapi-ts/validators). This will implicitly add the selected plugin with default values.

For a more granular approach, manually add a validator plugin and set `validator` to the plugin name or `true` to automatically select a compatible plugin. Until you customize the validator plugin, both approaches will produce the same default output.

::: code-group

<!-- prettier-ignore-start -->
```ts [example]
import * as v from 'valibot';

export const addPet = (options: Options<AddPetData>) =>
  (options.client ?? client).post<AddPetResponses, AddPetErrors>({
    requestValidator: async (data) => // [!code ++]
      await v.parseAsync(vAddPetData, data), // [!code ++]
    responseValidator: async (data) => // [!code ++]
      await v.parseAsync(vAddPetResponse, data), // [!code ++]
    /** ... */
  });
```
<!-- prettier-ignore-end -->

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/sdk',
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

You can choose to validate only requests or responses.

::: code-group

```js [requests]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/sdk',
      validator: {
        request: 'zod', // [!code ++]
      },
    },
  ],
};
```

```js [responses]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/sdk',
      validator: {
        response: 'zod', // [!code ++]
      },
    },
  ],
};
```

:::

Learn more about available validators on the [Validators](/openapi-ts/validators) page.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/sdk/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
