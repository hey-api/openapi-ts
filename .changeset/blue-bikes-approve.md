---
'@hey-api/openapi-ts': minor
'@hey-api/docs': minor
---

feat: make plugins first-class citizens

This release makes plugins first-class citizens. In order to achieve that, the following breaking changes were introduced.

### Removed CLI options

The `--types`, `--schemas`, and `--services` CLI options have been removed. You can list which plugins you'd like to use explicitly by passing a list of plugins as `--plugins <plugin1> <plugin2>`

### Removed `*.export` option

Previously, you could explicitly disable export of certain artifacts using the `*.export` option or its shorthand variant. These were both removed. You can now disable export of specific artifacts by manually defining an array of `plugins` and excluding the unwanted plugin.

::: code-group

```js [shorthand]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: false, // [!code --]
  plugins: ['@hey-api/types', '@hey-api/services'], // [!code ++]
};
```

```js [*.export]
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: {
    export: false, // [!code --]
  },
  plugins: ['@hey-api/types', '@hey-api/services'], // [!code ++]
};
```

:::

### Renamed `schemas.name` option

Each plugin definition contains a `name` field. This was conflicting with the `schemas.name` option. As a result, it has been renamed to `nameBuilder`.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  schemas: {
    name: (name) => `${name}Schema`, // [!code --]
  },
  plugins: [
    // ...other plugins
    {
      nameBuilder: (name) => `${name}Schema`, // [!code ++]
      name: '@hey-api/schemas',
    },
  ],
};
```

### Removed `services.include` shorthand option

Previously, you could use a string value as a shorthand for the `services.include` configuration option. You can now achieve the same result using the `include` option.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  services: '^MySchema', // [!code --]
  plugins: [
    // ...other plugins
    {
      include: '^MySchema', // [!code ++]
      name: '@hey-api/services',
    },
  ],
};
```

### Renamed `services.name` option

Each plugin definition contains a `name` field. This was conflicting with the `services.name` option. As a result, it has been renamed to `serviceNameBuilder`.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  services: {
    name: '{{name}}Service', // [!code --]
  },
  plugins: [
    // ...other plugins
    {
      serviceNameBuilder: '{{name}}Service', // [!code ++]
      name: '@hey-api/services',
    },
  ],
};
```

### Renamed `types.dates` option

Previously, you could set `types.dates` to a boolean or a string value, depending on whether you wanted to transform only type strings into dates, or runtime code too. Many people found these options confusing, so they have been simplified to a boolean and extracted into a separate `@hey-api/transformers` plugin.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  types: {
    dates: 'types+transform', // [!code --]
  },
  plugins: [
    // ...other plugins
    {
      dates: true, // [!code ++]
      name: '@hey-api/transformers',
    },
  ],
};
```

### Removed `types.include` shorthand option

Previously, you could use a string value as a shorthand for the `types.include` configuration option. You can now achieve the same result using the `include` option.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  types: '^MySchema', // [!code --]
  plugins: [
    // ...other plugins
    {
      include: '^MySchema', // [!code ++]
      name: '@hey-api/types',
    },
  ],
};
```

### Renamed `types.name` option

Each plugin definition contains a `name` field. This was conflicting with the `types.name` option. As a result, it has been renamed to `style`.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  types: {
    name: 'PascalCase', // [!code --]
  },
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/types',
      style: 'PascalCase', // [!code ++]
    },
  ],
};
```
