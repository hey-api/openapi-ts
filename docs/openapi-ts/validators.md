---
title: Validators
description: Learn about validating data with @hey-api/openapi-ts.
---

# Validators

There are times when you cannot blindly trust the server to return the correct data. You might be working on a critical application where any mistakes would be costly, or you're simply dealing with a legacy or undocumented system.

Hey API clients support validating responses so you can rest assured that you're working with the correct data.

## Available Validators

- [Zod](/openapi-ts/validators/zod)
- [Ajv](https://ajv.js.org/) <span class="soon">Soon</span>
- [Joi](https://joi.dev/) <span class="soon">Soon</span>
- [Yup](https://github.com/jquense/yup) <span class="soon">Soon</span>

If you'd like Hey API to support your validator, let us know by [opening an issue](https://github.com/hey-api/openapi-ts/issues).

## Installation

There are two ways to generate validators. If you only need response validation in your SDKs, set `sdk.validator` to the desired value. For a more granular approach, add the validator to your plugins and set `sdk.validator` to `true`.

::: code-group

```js [sdk]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
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
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
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
<!--@include: ../sponsorship.md-->
