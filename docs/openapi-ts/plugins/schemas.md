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
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/schemas',
      type: 'json', // [!code ++]
    },
  ],
};
```

```js [form]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/schemas',
      type: 'form', // [!code ++]
    },
  ],
};
```

```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
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

## API

You can view the complete list of options in the [UserConfig](https://github.com/hey-api/openapi-ts/blob/main/packages/openapi-ts/src/plugins/@hey-api/schemas/types.ts) interface.

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
