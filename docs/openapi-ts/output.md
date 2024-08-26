---
title: Output
description: Learn about files generated with @hey-api/openapi-ts.
---

# Output

Learn about files generated with `@hey-api/openapi-ts`.

::: tip

Your actual output depends on your OpenAPI specification and Hey API configuration. It may contain a different number of files and their contents might differ.

:::

### Example

If you use the default configuration, your [project](https://stackblitz.com/edit/hey-api-example?file=openapi-ts.config.ts,src%2Fclient%2Fschemas.gen.ts,src%2Fclient%2Fservices.gen.ts,src%2Fclient%2Ftypes.gen.ts) might look something like this.

```md
my-app/
├── node_modules/
├── src/
│ ├── client/
│ │ ├── core/
│ │ ├── index.ts
│ │ ├── schemas.gen.ts
│ │ ├── services.gen.ts
│ │ └── types.gen.ts
│ └── index.ts
└── package.json
```

Let's go through each file in the `src/client` folder and explain what it looks like, what it does, and how to use it.

## TypeScript interfaces

TypeScript interfaces are located in the `types.gen.ts` file. This is the only file that does not impact your bundle size and runtime performance. It will get discarded during build time, unless you configured to emit runtime [enums](/openapi-ts/configuration#enums).

This file contains three different categories of interfaces created from your OpenAPI specification:

- components, parameters, and enums
- operation request, response, and error data
- operation tree interface

Depending on your OpenAPI specification and configuration, some of these categories might be missing or differ in your output (and that's okay!).

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

As you can see, everything is exported from `types.gen.ts`. You can import individual exports in your application and use them as necessary.

## API Services

API services are located in the `services.gen.ts` file. This file contains abstractions for sending API requests which can be called instead of using the client directly. Whether you should use API services comes down to your personal preference and bundle size considerations. You have three options to choose from.

### Flat Services

This is the default setting. It supports tree-shaking and can lead to reduced bundle size over duplicated client calls. The method names are generated from operation IDs.

### Class Services

The previous default setting. It does not support tree-shaking which will lead to increased bundle sizes, but some prefer this option for syntax reasons. The class names are generated from operation tags and method names are generated from operation IDs.

### No Services

If you prefer to use clients directly or do not need the service layer, this is the option for you. Type support for clients is currently limited due to popularity of other options. If you'd like to use this option and need better types, [open an issue](https://github.com/hey-api/openapi-ts/issues).

### Configuration

You can choose your preferred style using the `services` config option.

::: code-group

```js [flat]
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  services: {
    asClass: false, // [!code ++]
  },
};
```

```js [class]
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  services: {
    asClass: true, // [!code ++]
  },
};
```

```js [none]
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  services: false, // [!code ++]
};
```

:::

### Filtering Endpoints

If you only want to include specific endpoints in the generated services, you can use the `services.filter` config option to filter endpoints. The provided value should be a regular expression to match against endpoints with the `{method} {path}` pattern. For example, the config below will only include all `/api/v1/foo` endpoints.

```js
export default {
  input: 'path/to/openapi.json',
  output: 'src/client',
  services: {
    filter: '^\\w+ /api/v1/foo$', // [!code ++]
  },
};
```

### Output

Below are different outputs depending on your chosen style. No services approach will not generate the `services.gen.ts` file.

::: code-group

```ts [flat]
import { client, type Options } from '@hey-api/client-fetch';

import type { AddPetData, AddPetError, AddPetResponse } from './types.gen';

export const addPet = (options: Options<AddPetData>) =>
  (options?.client ?? client).post<AddPetResponse, AddPetError>({
    ...options,
    url: '/pet',
  });
```

```ts [class]
import { client, type Options } from '@hey-api/client-fetch';

import type { AddPetData, AddPetError, AddPetResponse } from './types.gen';

export class PetService {
  public static addPet(options: Options<AddPetData>) {
    return (options?.client ?? client).post<AddPetResponse, AddPetError>({
      ...options,
      url: '/pet',
    });
  }
}
```

:::

### Usage

This is how you'd make the same request using each approach.

::: code-group

```ts [flat]
import { addPet } from './client/services.gen';

addPet({
  body: {
    name: 'Kitty',
  },
});
```

```ts [class]
import { PetService } from './client/services.gen';

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

## JSON Schemas

Schemas are located in the `schemas.gen.ts` file. This file contains runtime schemas generated from your OpenAPI specification definitions located in `#/components/schemas`. Starting with OpenAPI 3.1, these schemas are JSON Schema compliant.

```ts
export const $Pet = {
  required: ['name'],
  properties: {
    id: {
      type: 'integer',
      format: 'int64',
      example: 10,
    },
    name: {
      type: 'string',
      example: 'doggie',
    },
  },
  type: 'object',
} as const;
```

You may want to use schemas if you want to enforce form validations that aren't possible using only types, such as maximum field length.

```ts
import { $Schema } from './client/schemas.gen';

const maxInputLength = $Schema.properties.text.maxLength;

if (userInput.length > maxInputLength) {
  throw new Error(`Text length can't exceed ${maxInputLength} characters!`);
}
```

## Index

For convenience, every generated artifact is re-exported from `index.ts`. We recommend importing types, services, and schemas from their respective files to avoid ambiguity, but you can also use the index file.

```ts
import type { Pet } from './client/types.gen';
// or
import type { Pet } from './client';
```

## Core

Client core files are located in the `core` folder. This folder will include different files depending on which client you're using. With standalone packages, this folder isn't generated by default. If you want to bundle standalone clients into your output, read the [Bundling](/openapi-ts/clients#bundling) section.

For legacy clients, the [`OpenAPI`](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/templates/core/OpenAPI.hbs#L68-L84) configuration object will be most likely of interest. You can change its properties to set authorization tokens, base URL, and more.

```ts
import { OpenAPI } from './client/core/OpenAPI';
```

## Plugins

Different plugins may emit their own artifacts. These will be documented in their respective pages.

<!--@include: ../examples.md-->
<!--@include: ../sponsorship.md-->
