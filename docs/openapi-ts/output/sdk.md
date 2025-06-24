---
title: SDK
description: Learn about files generated with @hey-api/openapi-ts.
---

# SDKs

SDKs are located in the `sdk.gen.ts` file. SDKs are abstractions on top of clients and serve the same purpose. By default, `@hey-api/openapi-ts` will generate a flat SDK layer. Your choice to use SDKs depends on personal preferences and bundle size considerations.

### Flat SDKs

This is the default setting. Flat SDKs support tree-shaking and can lead to reduced bundle size over duplicated client calls. The function names are generated from operation IDs or operation location.

### Class SDKs

Class SDKs do not support tree-shaking which will lead to increased bundle sizes, but some people prefer this option for syntax reasons. The class names are generated from operation tags and method names are generated from operation IDs or operation location.

### No SDKs

If you prefer to use clients directly or do not need the SDK layer, define `plugins` manually and omit the `@hey-api/sdk` plugin. Type support for clients is currently limited due to popularity of other options. If you'd like to use this option and need better types, please [open an issue](https://github.com/hey-api/openapi-ts/issues).

## Configuration

You can modify the contents of `sdk.gen.ts` by configuring the `@hey-api/sdk` plugin. Note that you must specify the default plugins to preserve the default output.

::: code-group

```js [flat]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    {
      asClass: false, // default // [!code ++]
      name: '@hey-api/sdk',
    },
  ],
};
```

```js [class]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    {
      asClass: true, // [!code ++]
      name: '@hey-api/sdk',
    },
  ],
};
```

```js [none]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk', // [!code --]
  ],
};
```

:::

## Output

Below are different outputs depending on your chosen style. No SDKs approach will not generate the `sdk.gen.ts` file.

::: code-group

```ts [flat]
import type { Options } from './client';
import { client as _heyApiClient } from './client.gen';
import type { AddPetData, AddPetError, AddPetResponse } from './types.gen';

export const addPet = (options: Options<AddPetData>) =>
  (options?.client ?? _heyApiClient).post<AddPetResponse, AddPetError>({
    url: '/pet',
    ...options,
  });
```

```ts [class]
import type { Options } from './client';
import { client as _heyApiClient } from './client.gen';
import type { AddPetData, AddPetError, AddPetResponse } from './types.gen';

export class PetService {
  public static addPet(options: Options<AddPetData>) {
    return (options?.client ?? _heyApiClient).post<AddPetResponse, AddPetError>(
      {
        url: '/pet',
        ...options,
      },
    );
  }
}
```

:::

## Usage

This is how you'd make the same request using each approach.

::: code-group

```ts [flat]
import { addPet } from './client/sdk.gen';

addPet({
  body: {
    name: 'Kitty',
  },
});
```

```ts [class]
import { PetService } from './client/sdk.gen';

PetService.addPet({
  body: {
    name: 'Kitty',
  },
});
```

```ts [none]
import { client } from './client/client';

client.post({
  body: {
    name: 'Kitty',
  },
  url: '/pet',
});
```

:::

## Validators

There are two ways to configure validators. If you only want to add validators to your SDKs, set `sdk.validator` to a validator plugin name. This will implicitly add the selected plugin with default values.

For a more granular approach, add a validator plugin and set `sdk.validator` to the plugin name or `true` to automatically select a plugin. Until you customize the validator plugin, both approaches will produce the same default output.

::: code-group

```js [sdk]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/sdk',
      validator: 'zod', // [!code ++]
    },
  ],
};
```

```js [validator]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/sdk',
      validator: true, // or 'zod' // [!code ++]
    },
    {
      name: 'zod', // [!code ++]
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
  input: 'https://get.heyapi.dev/hey-api/backend',
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
  input: 'https://get.heyapi.dev/hey-api/backend',
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

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
