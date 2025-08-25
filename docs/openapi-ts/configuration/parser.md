---
title: Parser
description: Configure @hey-api/openapi-ts.
---

# Parser

We parse your input before making it available to plugins. Configuring the parser is optional, but it provides an ideal opportunity to modify or validate your input as needed.

## Patch

Sometimes you need to modify raw input before it's processed further. A common use case is fixing an invalid specification or adding a missing field. For this reason, custom patches are applied before any parsing takes place.

You can add custom patches with `patch`.

<!-- prettier-ignore-start -->
```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    patch: { // [!code ++]
      schemas: { // [!code ++]
        Foo: (schema) => { // [!code ++]
          // convert date-time format to timestamp // [!code ++]
          delete schema.properties.updatedAt.format; // [!code ++]
          schema.properties.updatedAt.type = 'number'; // [!code ++]
        }, // [!code ++]
        Bar: (schema) => { // [!code ++]
          // add missing property // [!code ++]
          schema.properties.meta = { // [!code ++]
            additionalProperties: true, // [!code ++]
            type: 'object', // [!code ++]
          }; // [!code ++]
          schema.required = ['meta']; // [!code ++]
        }, // [!code ++]
        Baz: (schema) => { // [!code ++]
          // remove property // [!code ++]
          delete schema.properties.internalField; // [!code ++]
        }, // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

## Validate

::: warning
The validator feature is very limited. You can help improve it by submitting more [use cases](https://github.com/hey-api/openapi-ts/issues/1970#issuecomment-2933189789).
:::

If you don't control or trust your input, you might want to validate it. Any detected errors in your input will exit `@hey-api/openapi-ts` and no plugins will be executed.

To validate your input, set `validate_EXPERIMENTAL` to `true`.

<!-- prettier-ignore-start -->
```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    validate_EXPERIMENTAL: true, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

## Filters

Filters allow you to trim your input before it's processed further, so your output contains only relevant resources.

### Operations

Set `include` to match operations to be included or `exclude` to match operations to be excluded. Both exact keys and regular expressions are supported. When both rules match the same operation, `exclude` takes precedence over `include`.

::: code-group

<!-- prettier-ignore-start -->
```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      operations: { // [!code ++]
        include: ['GET /api/v1/foo', '/^[A-Z]+ /api/v1//'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      operations: { // [!code ++]
        exclude: ['GET /api/v1/foo', '/^[A-Z]+ /api/v1//'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

### Tags

Set `include` to match tags to be included or `exclude` to match tags to be excluded. When both rules match the same tag, `exclude` takes precedence over `include`.

::: code-group

<!-- prettier-ignore-start -->
```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      tags: { // [!code ++]
        include: ['v2'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      tags: { // [!code ++]
        exclude: ['v1'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

### Deprecated

You can filter out deprecated resources by setting `deprecated` to `false`.

<!-- prettier-ignore-start -->
```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      deprecated: false, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

### Schemas

Set `include` to match schemas to be included or `exclude` to match schemas to be excluded. Both exact keys and regular expressions are supported. When both rules match the same schema, `exclude` takes precedence over `include`.

::: code-group

<!-- prettier-ignore-start -->
```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      schemas: { // [!code ++]
        include: ['Foo', '/^Bar/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      schemas: { // [!code ++]
        exclude: ['Foo', '/^Bar/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

### Parameters

Set `include` to match parameters to be included or `exclude` to match parameters to be excluded. Both exact keys and regular expressions are supported. When both rules match the same parameter, `exclude` takes precedence over `include`.

::: code-group

<!-- prettier-ignore-start -->
```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      parameters: { // [!code ++]
        include: ['QueryParameter', '/^MyQueryParameter/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      parameters: { // [!code ++]
        exclude: ['QueryParameter', '/^MyQueryParameter/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

### Request Bodies

Set `include` to match request bodies to be included or `exclude` to match request bodies to be excluded. Both exact keys and regular expressions are supported. When both rules match the same request body, `exclude` takes precedence over `include`.

::: code-group

<!-- prettier-ignore-start -->
```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      requestBodies: { // [!code ++]
        include: ['Payload', '/^SpecialPayload/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      requestBodies: { // [!code ++]
        exclude: ['Payload', '/^SpecialPayload/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

### Responses

Set `include` to match responses to be included or `exclude` to match responses to be excluded. Both exact keys and regular expressions are supported. When both rules match the same response, `exclude` takes precedence over `include`.

::: code-group

<!-- prettier-ignore-start -->
```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      responses: { // [!code ++]
        include: ['Foo', '/^Bar/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      responses: { // [!code ++]
        exclude: ['Foo', '/^Bar/'], // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

### Orphaned resources

If you only want to exclude orphaned resources, set `orphans` to `false`. This is the default value when combined with any other filters. If this isn't the desired behavior, you may want to set `orphans` to `true` to always preserve unused resources.

<!-- prettier-ignore-start -->
```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      orphans: false, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

### Order

For performance reasons, we don't preserve the original order when filtering out resources. If maintaining the original order is important to you, set `preserveOrder` to `true`.

<!-- prettier-ignore-start -->
```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    filters: { // [!code ++]
      preserveOrder: true, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

## Transforms

You can think of transforms as deterministic [patches](#patch). They provide an easy way to apply the most commonly used input transformations.

### Enums

Your input might contain two types of enums:

- enums defined as reusable components (root enums)
- non-reusable enums nested within other schemas (inline enums)

You may want all enums to be reusable. This is because only root enums are typically exported by plugins. Inline enums will never be directly importable since they're nested inside other schemas.

::: code-group

<!-- prettier-ignore-start -->
```js [root]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    transforms: { // [!code ++]
      enums: 'root', // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [inline]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    transforms: { // [!code ++]
      enums: 'inline', // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

You can customize the naming and casing pattern for `enums` schemas using the `.name` and `.case` options.

### Read-write

Your schemas might contain read-only or write-only fields. Using such schemas directly could mean asking the user to provide a read-only field in requests, or expecting a write-only field in responses. We separate schemas for requests and responses if direct usage would result in such scenarios.

::: code-group

<!-- prettier-ignore-start -->
```js [default]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    transforms: { // [!code ++]
      readWrite: { // [!code ++]
        requests: '{{name}}Writable', // [!code ++]
        responses: '{{name}}', // [!code ++]
      }, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    transforms: { // [!code ++]
      readWrite: false, // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

You can customize the naming and casing pattern for `requests` and `responses` schemas using the `.name` and `.case` options.

## Pagination

Paginated operations are detected by having a pagination keyword in its parameters or request body. By default, we consider the following to be pagination keywords: `after`, `before`, `cursor`, `offset`, `page`, and `start`.

You can provide custom pagination keywords using `pagination.keywords`.

::: code-group

<!-- prettier-ignore-start -->
```js [extend]
import { defaultPaginationKeywords } from '@hey-api/openapi-ts';

export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    pagination: { // [!code ++]
      keywords: [...defaultPaginationKeywords, 'extra', 'pagination', 'keywords'], // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [override]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: { // [!code ++]
    pagination: { // [!code ++]
      keywords: ['custom', 'pagination', 'keywords'], // [!code ++]
    }, // [!code ++]
  }, // [!code ++]
};
```
<!-- prettier-ignore-end -->

:::

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
