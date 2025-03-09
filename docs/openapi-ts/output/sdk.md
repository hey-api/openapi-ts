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
    '@hey-api/client-fetch',
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
    '@hey-api/client-fetch',
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
    '@hey-api/client-fetch',
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
import type { Options } from '@hey-api/client-fetch';

import { client as _heyApiClient } from './client.gen';
import type { AddPetData, AddPetError, AddPetResponse } from './types.gen';

export const addPet = (options: Options<AddPetData>) =>
  (options?.client ?? _heyApiClient).post<AddPetResponse, AddPetError>({
    url: '/pet',
    ...options,
  });
```

```ts [class]
import type { Options } from '@hey-api/client-fetch';

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
import { client } from '@hey-api/client-fetch';

client.post({
  body: {
    name: 'Kitty',
  },
  url: '/pet',
});
```

:::

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
