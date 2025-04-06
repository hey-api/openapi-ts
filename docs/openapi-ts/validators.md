---
title: Validators
description: Learn about validating data with @hey-api/openapi-ts.
---

# Validators

There are times when you cannot blindly trust the server to return the correct data. You might be working on a critical application where any mistakes would be costly, or you're simply dealing with a legacy or undocumented system.

Whatever your reason to use validators might be, you can rest assured that you're working with the correct data.

## Options

Hey API natively supports the following validators.

- [Zod](/openapi-ts/plugins/zod)
- [Ajv](/openapi-ts/plugins/ajv) <span data-soon>Soon</span>
- [Arktype](/openapi-ts/plugins/arktype) <span data-soon>Soon</span>
- [Joi](/openapi-ts/plugins/joi) <span data-soon>Soon</span>
- [TypeBox](/openapi-ts/plugins/typebox) <span data-soon>Soon</span>
- [Valibot](/openapi-ts/plugins/valibot) <span data-soon>Soon</span>
- [Yup](/openapi-ts/plugins/yup) <span data-soon>Soon</span>

Don't see your validator? Let us know your interest by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

## Installation

There are two ways to generate validators. If you only need response validation in your SDKs, set `sdk.validator` to the desired value. For a more granular approach, add your validator to plugins and set `sdk.validator` to `true`.

::: code-group

```js [sdk]
export default {
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/client',
  plugins: [
    '@hey-api/client-fetch',
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
    '@hey-api/client-fetch',
    {
      name: '@hey-api/sdk',
      validator: true, // [!code ++]
    },
    {
      name: 'zod', // [!code ++]
      // other options
    },
  ],
};
```

:::

<!--@include: ../examples.md-->
<!--@include: ../sponsors.md-->
