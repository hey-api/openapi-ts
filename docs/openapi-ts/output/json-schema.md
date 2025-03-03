---
title: JSON Schema
description: Learn about files generated with @hey-api/openapi-ts.
---

# JSON Schemas

Schemas are located in the `schemas.gen.ts` file. This file contains runtime schemas generated from your OpenAPI specification definitions located in `#/components/schemas`. If you're using OpenAPI 3.1, your schemas are fully JSON Schema compliant and can be used with other tools supporting JSON Schema.

## Configuration

You can modify the contents of `schemas.gen.ts` by configuring the `@hey-api/schemas` plugin. Note that you must specify the default plugins to preserve the default output.

::: code-group

```js [json]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    {
      name: '@hey-api/schemas',
      type: 'json', // [!code ++]
    },
  ],
};
```

```js [form]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    {
      name: '@hey-api/schemas',
      type: 'form', // [!code ++]
    },
  ],
};
```

```js [disabled]
import { defaultPlugins } from '@hey-api/openapi-ts';

export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    ...defaultPlugins,
    '@hey-api/client-fetch',
    '@hey-api/schemas', // [!code --]
  ],
};
```

:::

## Output

Below is an example output generated in the `type: 'form'` style. Disabling schemas will not generate the `schemas.gen.ts` file.

```ts
export const PetSchema = {
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

## Usage

A great use case for schemas is client-side form input validation.

```ts
import { $Schema } from './client/schemas.gen';

const maxInputLength = $Schema.properties.text.maxLength;

if (userInput.length > maxInputLength) {
  throw new Error(`Text length can't exceed ${maxInputLength} characters!`);
}
```

<!--@include: ../../examples.md-->
<!--@include: ../../sponsors.md-->
