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
  parser: {
    patch: {
      schemas: {
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
      },
    },
  },
};
```
<!-- prettier-ignore-end -->

## Validate

::: warning
The validator feature is very limited. You can help improve it by submitting more [use cases](https://github.com/hey-api/openapi-ts/issues/1970#issuecomment-2933189789).
:::

If you don't control or trust your input, you might want to validate it. Any detected errors in your input will exit `@hey-api/openapi-ts` and no plugins will be executed.

To validate your input, set `validate_EXPERIMENTAL` to `true`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    validate_EXPERIMENTAL: true, // [!code ++]
  },
};
```

## Filters

Filters allow you to trim your input before it's processed further, so your output contains only relevant resources.

### Operations

Set `include` to match operations to be included or `exclude` to match operations to be excluded. Both exact keys and regular expressions are supported. When both rules match the same operation, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      operations: {
        include: ['GET /api/v1/foo', '/^[A-Z]+ /api/v1//'], // [!code ++]
      },
    },
  },
};
```

```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      operations: {
        exclude: ['GET /api/v1/foo', '/^[A-Z]+ /api/v1//'], // [!code ++]
      },
    },
  },
};
```

:::

### Tags

Set `include` to match tags to be included or `exclude` to match tags to be excluded. When both rules match the same tag, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      tags: {
        include: ['v2'], // [!code ++]
      },
    },
  },
};
```

```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      tags: {
        exclude: ['v1'], // [!code ++]
      },
    },
  },
};
```

:::

### Deprecated

You can filter out deprecated resources by setting `deprecated` to `false`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      deprecated: false, // [!code ++]
    },
  },
};
```

### Schemas

Set `include` to match schemas to be included or `exclude` to match schemas to be excluded. Both exact keys and regular expressions are supported. When both rules match the same schema, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      schemas: {
        include: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
  },
};
```

```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      schemas: {
        exclude: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
  },
};
```

:::

### Parameters

Set `include` to match parameters to be included or `exclude` to match parameters to be excluded. Both exact keys and regular expressions are supported. When both rules match the same parameter, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      parameters: {
        include: ['QueryParameter', '/^MyQueryParameter/'], // [!code ++]
      },
    },
  },
};
```

```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      parameters: {
        exclude: ['QueryParameter', '/^MyQueryParameter/'], // [!code ++]
      },
    },
  },
};
```

:::

### Request Bodies

Set `include` to match request bodies to be included or `exclude` to match request bodies to be excluded. Both exact keys and regular expressions are supported. When both rules match the same request body, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      requestBodies: {
        include: ['Payload', '/^SpecialPayload/'], // [!code ++]
      },
    },
  },
};
```

```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      requestBodies: {
        exclude: ['Payload', '/^SpecialPayload/'], // [!code ++]
      },
    },
  },
};
```

:::

### Responses

Set `include` to match responses to be included or `exclude` to match responses to be excluded. Both exact keys and regular expressions are supported. When both rules match the same response, `exclude` takes precedence over `include`.

::: code-group

```js [include]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      responses: {
        include: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
  },
};
```

```js [exclude]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      responses: {
        exclude: ['Foo', '/^Bar/'], // [!code ++]
      },
    },
  },
};
```

:::

### Orphaned resources

If you only want to exclude orphaned resources, set `orphans` to `false`. This is the default value when combined with any other filters. If this isn't the desired behavior, you may want to set `orphans` to `true` to always preserve unused resources.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      orphans: false, // [!code ++]
    },
  },
};
```

### Order

For performance reasons, we don't preserve the original order when filtering out resources. If maintaining the original order is important to you, set `preserveOrder` to `true`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    filters: {
      preserveOrder: true, // [!code ++]
    },
  },
};
```

## Transforms

You can think of transforms as deterministic [patches](#patch). They provide an easy way to apply the most commonly used input transformations.

### Enums

Your input might contain two types of enums:

- enums defined as reusable components (root enums)
- non-reusable enums nested within other schemas (inline enums)

You may want all enums to be reusable. This is because only root enums are typically exported by plugins. Inline enums will never be directly importable since they're nested inside other schemas.

::: code-group

```js [root]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    transforms: {
      enums: 'root', // [!code ++]
    },
  },
};
```

```js [inline]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    transforms: {
      enums: 'inline', // [!code ++]
    },
  },
};
```

:::

You can customize the naming and casing pattern for `enums` schemas using the `.name` and `.case` options.

### Read-write

Your schemas might contain read-only or write-only fields. Using such schemas directly could mean asking the user to provide a read-only field in requests, or expecting a write-only field in responses. We separate schemas for requests and responses if direct usage would result in such scenarios.

::: code-group

```js [default]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    transforms: {
      readWrite: {
        requests: '{{name}}Writable', // [!code ++]
        responses: '{{name}}', // [!code ++]
      },
    },
  },
};
```

```js [disabled]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    transforms: {
      readWrite: false, // [!code ++]
    },
  },
};
```

:::

You can customize the naming and casing pattern for `requests` and `responses` schemas using the `.name` and `.case` options.

## Pagination

Paginated operations are detected by having a pagination keyword in its parameters or request body. By default, we consider the following to be pagination keywords: `after`, `before`, `cursor`, `offset`, `page`, and `start`.

You can provide custom pagination keywords using `pagination.keywords`.

::: code-group

```js [extend]
import { defaultPaginationKeywords } from '@hey-api/openapi-ts';

export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    pagination: {
      keywords: [
        ...defaultPaginationKeywords, // [!code ++]
        'extra', // [!code ++]
        'pagination', // [!code ++]
        'keywords', // [!code ++]
      ],
    },
  },
};
```

```js [override]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    pagination: {
      keywords: [
        'custom', // [!code ++]
        'pagination', // [!code ++]
        'keywords', // [!code ++]
      ],
    },
  },
};
```

:::

## Hooks

Hooks affect runtime behavior but aren’t tied to any single plugin. They can be configured globally via `hooks` or per plugin through the `~hooks` property.

::: code-group

```js [parser]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    hooks: {}, // configure global hooks here // [!code ++]
  },
};
```

```js [plugin]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      name: '@tanstack/react-query',
      '~hooks': {}, // configure plugin hooks here // [!code ++]
    },
  ],
};
```

:::

We always use the first hook that returns a value. If a hook returns no value, we fall back to less specific hooks until one does.

### Operations {#hooks-operations}

Each operation has a list of classifiers that can include `query`, `mutation`, both, or none. Plugins may use these values to decide whether to generate specific output. For example, you usually don’t want to generate [TanStack Query options](/openapi-ts/plugins/tanstack-query#queries) for PATCH operations.

#### Query operations {#hooks-query-operations}

By default, GET operations are classified as `query` operations.

#### Mutation operations {#hooks-mutation-operations}

By default, DELETE, PATCH, POST, and PUT operations are classified as `mutation` operations.

#### Example: POST search query

Imagine your API has a POST `/search` endpoint that accepts a large payload. By default, it's classified as a `mutation`, but in practice it behaves like a `query`, and your [state management](/openapi-ts/state-management) plugin should generate query hooks.

You can achieve this by classifying the operation as `query` in a matcher.

::: code-group

<!-- prettier-ignore-start -->
```js [isQuery]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    hooks: {
      operations: {
        isQuery: (op) => {
          if (op.method === 'post' && op.path === '/search') { // [!code ++]
            return true; // [!code ++]
          } // [!code ++]
        },
      },
    },
  },
};
```
<!-- prettier-ignore-end -->
<!-- prettier-ignore-start -->
```js [getKind]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    hooks: {
      operations: {
        getKind: (op) => {
          if (op.method === 'post' && op.path === '/search') { // [!code ++]
            return ['query']; // [!code ++]
          } // [!code ++]
        },
      },
    },
  },
};
```
<!-- prettier-ignore-end -->

:::

### Symbols {#hooks-symbols}

Each symbol can have a placement function deciding its output location.

#### Example: Alphabetic sort

While we work on a better example, let's imagine a world where it's desirable to place every symbol in a file named after its initial letter. For example, a function named `Foo` should end up in the file `f.ts`.

You can achieve this by using the symbol's name.

<!-- prettier-ignore-start -->
```js [getKind]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    hooks: {
      symbols: {
        getFilePath: (symbol) => {
          if (symbol.name) { // [!code ++]
            return symbol.name[0]?.toLowerCase(); // [!code ++]
          } // [!code ++]
        },
      },
    },
  },
};
```
<!-- prettier-ignore-end -->

<!--@include: ../../partials/examples.md-->
<!--@include: ../../partials/sponsors.md-->
