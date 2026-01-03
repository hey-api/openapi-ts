---
title: SDK Plugin
description: Generate SDKs from OpenAPI with the SDK plugin for openapi-ts. Fully compatible with validators, transformers, and all core features.
---

# SDK

### About

The SDK plugin generates a high-level, ergonomic API layer on top of the low-level HTTP client.

It exposes typed functions or methods for each operation, with built-in auth handling, configurable request and response validation, and ready-to-use code examples.

## Features

- high-level SDK layer on top of the HTTP client
- typed functions or methods per operation
- built-in authentication handling
- request and response validation
- ready-to-use code examples

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
    // ...other plugins
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
    // ...other plugins
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
    // ...other plugins
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

## Code Examples

The SDK plugin can generate ready-to-use code examples for each operation, showing how to call the SDK methods with proper parameters and setup.

Examples are not generated by default, but you can enable and customize them through the `examples` option. With the default settings, an example might look like this.

::: code-group

```ts [example]
import { PetStore } from 'your-package';

await new PetStore().addPet();
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      examples: true, // [!code ++]
      name: '@hey-api/sdk',
      operations: {
        containerName: 'PetStore',
        strategy: 'single',
      },
    },
  ],
};
```

:::

### Module and Setup

To make examples more practical, configure `moduleName` to specify the package from which users import your SDK.

Next, set `setupName` to indicate how users should instantiate the SDK, typically only once per application.

::: code-group

```ts [example]
import { PetStore } from '@petstore/client'; // [!code ++]

const client = new PetStore(); // [!code ++]

await client.addPet();
```

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      examples: {
        moduleName: '@petstore/client', // [!code ++]
        setupName: 'client', // [!code ++]
      },
      name: '@hey-api/sdk',
      operations: {
        containerName: 'PetStore',
        strategy: 'single',
      },
    },
  ],
};
```

:::

### Initialization

Often, your SDK needs to be instantiated with an API key or other configuration. In examples, `importSetup` lets you control how the SDK is initialized.

::: code-group

<!-- prettier-ignore-start -->
```ts [example]
import { PetStore } from '@petstore/client';

const client = new PetStore({ // [!code ++]
  apiKey: 'YOUR_API_KEY', // [!code ++]
}); // [!code ++]

await client.addPet();
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
      examples: {
        importSetup: ({ $, node }) => // [!code ++]
          $.new( // [!code ++]
            node.name, // [!code ++]
            $.object() // [!code ++]
              .pretty() // [!code ++]
              .prop('apiKey', $.literal('YOUR_API_KEY')), // [!code ++]
          ), // [!code ++]
        moduleName: '@petstore/client',
        setupName: 'client',
      },
      name: '@hey-api/sdk',
      operations: {
        containerName: 'PetStore',
        strategy: 'single',
      },
    },
  ],
};
```
<!-- prettier-ignore-end -->

:::

### Import Style

If you re-export the generated SDK from your own module, you can adjust `importName` and `importKind` to match your actual import style.

::: code-group

<!-- prettier-ignore-start -->
```ts [example]
import CatStore from '@petstore/client'; // [!code ++]

const client = new CatStore({ // [!code ++]
  apiKey: 'YOUR_API_KEY',
});

await client.addPet();
```
<!-- prettier-ignore-end -->

```js [config]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      examples: {
        importKind: 'default', // [!code ++]
        importName: 'CatStore', // [!code ++]
        importSetup: ({ $, node }) =>
          $(node.name).call(
            $.object().pretty().prop('apiKey', $.literal('YOUR_API_KEY')),
          ),
        moduleName: '@petstore/client',
        setupName: 'client',
      },
      name: '@hey-api/sdk',
      operations: {
        containerName: 'PetStore',
        strategy: 'single',
      },
    },
  ],
};
```

:::

### Payload

You can customize the example request using the `payload` option. Requests can also be customized selectively. For example, we can provide a default payload only for the `addPet()` method.

::: code-group

<!-- prettier-ignore-start -->
```ts [example]
import CatStore from '@petstore/client';

const client = new CatStore({
  apiKey: 'YOUR_API_KEY',
});

await client.addPet({ // [!code ++]
  petId: 1234, // [!code ++]
}); // [!code ++]
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
      examples: {
        importKind: 'default',
        importName: 'CatStore',
        importSetup: ({ $, node }) =>
          $(node.name).call(
            $.object().pretty().prop('apiKey', $.literal('YOUR_API_KEY')),
          ),
        moduleName: '@petstore/client',
        payload(operation, ctx) { // [!code ++]
          const { $ } = ctx; // [!code ++]
          if (operation.path === '/pet/{petId}' || operation.path === '/pet') { // [!code ++]
            return $.object().pretty().prop('petId', $.literal(1234)); // [!code ++]
          } // [!code ++]
        }, // [!code ++]
        setupName: 'client',
      },
      name: '@hey-api/sdk',
      operations: {
        containerName: 'PetStore',
        strategy: 'single',
      },
    },
  ],
};
```
<!-- prettier-ignore-end -->

:::

### Display

Enabling examples does not produce visible output on its own. Examples are written into the source specification and can be consumed by documentation tools such as [Mintlify](https://kutt.it/6vrYy9) or [Scalar](https://kutt.it/skQUVd). To persist that specification, enable [Source](/openapi-ts/configuration/output#source) generation.

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/sdk/types.d.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
