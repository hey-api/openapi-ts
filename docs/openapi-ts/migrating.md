---
title: Migrating
description: Migrating to @hey-api/openapi-ts.
---

# Migrating

While we try to avoid breaking changes, sometimes it's unavoidable in order to offer you the latest features. This page lists changes that require updates to your code. If you run into a problem with migration, please [open an issue](https://github.com/hey-api/openapi-ts/issues).

## v0.92.0

### Updated Symbol interface

The `exportFrom` property has been replaced with the `getExportFromFilePath()` function. This allows you to dynamically determine export paths based on symbol properties. This is a low-level feature, so you're most likely unaffected.

## v0.91.0

### Removed CommonJS (CJS) support

`@hey-api/openapi-ts` is now ESM-only. This change simplifies the codebase, improves tree-shaking, and enables better integration with modern bundlers and TypeScript tooling.

CommonJS entry points (`require()`, `module.exports`) are no longer supported. If you are in a CJS environment, you can still load the package dynamically using `import()` like:

```js
const { defineConfig } = await import('@hey-api/openapi-ts');
```

If you have previously written:

```js
const { defineConfig } = require('@hey-api/openapi-ts');
```

Migrate by updating your static imports:

```js
import { defineConfig } from '@hey-api/openapi-ts';
```

If your environment cannot use ESM, pin to a previous version.

## v0.90.0

### Resolvers API

The [Resolvers API](/openapi-ts/plugins/concepts/resolvers) has been simplified and expanded to provide a more consistent behavior across plugins. You can view a few common examples on the [Resolvers](/openapi-ts/plugins/concepts/resolvers) page.

### Structure API

The [SDK plugin](/openapi-ts/plugins/sdk) and [Angular plugin](/openapi-ts/plugins/angular) now implement the Structure API, enabling more complex structures and fixing several known issues.

Some Structure APIs are incompatible with the previous configuration, most notably the `methodNameBuilder` function, which accepted the operation object as an argument. You can read the [SDK Output](/openapi-ts/plugins/sdk#output) section to familiarize yourself with the Structure API.

Please [open an issue](https://github.com/hey-api/openapi-ts/issues) if you're unable to migrate your configuration to the new syntax.

## v0.89.0

### Prefer named exports

This release changes the default for `index.ts` to prefer named exports. Named exports may lead to better IDE and bundler performance compared to asterisk (`*`) as your tooling doesn't have to inspect the underlying module to discover exports.

While this change is merely cosmetic, you can set `output.preferExportAll` to `true` if you prefer to use the asterisk.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    path: 'src/client',
    preferExportAll: true, // [!code ++]
  },
};
```

### Removed `symbol:setValue:*` events

These events have been removed in favor of `node:set:*` events.

## v0.88.0

### Removed `compiler` and `tsc` exports

This release removes the `compiler` utility functions. Instead, it introduces a new TypeScript DSL exposed under the `$` symbol. All plugins now use this interface, so you may notice slight changes in the generated output.

## v0.87.0

### Removed legacy clients

This release removes support for legacy clients and plugins. Please migrate to the new clients if you haven't done so yet. If you're unable to do so due to a missing feature, let us know on [GitHub](https://github.com/hey-api/openapi-ts/issues).

## v0.86.0

### Removed Node 18 support

This release bumps the minimum required Node version to 20.19.

## v0.85.0

### Updated `output` options

We made the `output` configuration more consistent by using `null` to represent disabled options. This change does not affect boolean options.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    format: false, // [!code --]
    format: null, // [!code ++]
    lint: false, // [!code --]
    lint: null, // [!code ++]
    path: 'src/client',
    tsConfigPath: 'off', // [!code --]
    tsConfigPath: null, // [!code ++]
  },
};
```

### Updated Pinia Colada query options

Pinia Colada query options now use `defineQueryOptions` to improve reactivity support. Instead of calling the query options function, you can use one of the following approaches.

::: code-group

```ts [no params]
useQuery(getPetsQuery);
```

```ts [constant]
useQuery(getPetByIdQuery, () => ({
  path: {
    petId: 1,
  },
}));
```

```ts [reactive]
const petId = ref<number | null>(1);

useQuery(getPetByIdQuery, () => ({
  path: {
    petId: petId.value,
  },
}));
```

```ts [properties]
const petId = ref<number | null>(1);

useQuery(() => ({
  ...getPetByIdQuery({
    path: { petId: petId.value as number },
  }),
  enabled: () => petId.value != null,
}));
```

:::

## v0.84.0

### Symbol API

This release improves the Symbol API, which adds the capability to place symbols in arbitrary files. We preserved the previous output structure for all plugins except Angular.

You can preserve the previous Angular output by writing your own [placement function](/openapi-ts/configuration/parser#hooks-symbols).

### TypeScript renderer

We ship a dedicated TypeScript renderer for `.ts` files. This release improves the renderer's ability to group and sort imported modules, resulting in a more polished output.

### Removed `output` plugin option

Due to the Symbol API release, this option has been removed from the Plugin API.

## v0.83.0

### Symbol API

This release adds the Symbol API, which significantly reduces the risk of naming collisions. While the generated output should only include formatting changes, this feature introduces breaking changes to the Plugin API that affect custom plugins.

We will update the [custom plugin guide](/openapi-ts/plugins/custom) once the Plugin API becomes more stable.

### Removed `groupByTag` Pinia Colada option

This option has been removed to provide a more consistent API across plugins. We plan to bring it back in a future release.

## v0.82.0

### Hooks API

This release adds the [Hooks API](/openapi-ts/configuration/parser#hooks), giving you granular control over which operations generate queries and mutations. As a result, we tightened the previous behavior and POST operations no longer generate queries by default. To preserve the old behavior, add a custom matcher.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  parser: {
    hooks: {
      operations: {
        isQuery: (op) => (op.method === 'post' ? true : undefined), // [!code ++]
      },
    },
  },
};
```

## v0.81.0

### Server-Sent Events (SSE)

This release adds support for server-sent events (SSE). Instead of treating `text/event-stream` content types as regular HTTP methods, we now generate SSE streams. In practice, you will want to update your affected endpoints to process streamed events.

::: code-group

```js [before]
const { data } = await foo();
console.log(data.type);
```

```js [after]
const { stream } = await foo();
for await (const event of stream) {
  console.log(event.type);
}
```

:::

## v0.80.0

### Added Zod 4 and Zod Mini

This release adds support for Zod 4 and Zod Mini. By default, the `zod` plugin will generate output for Zod 4. If you want to preserve the previous output for Zod 3 or use Zod Mini, set `compatibilityVersion` to `3` or `mini`.

::: code-group

```js [Zod 3]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      compatibilityVersion: 3, // [!code ++]
    },
  ],
};
```

```js [Zod Mini]
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: 'zod',
      compatibilityVersion: 'mini', // [!code ++]
    },
  ],
};
```

:::

## v0.79.0

### Removed `typescript+namespace` enums mode

Due to a simpler TypeScript plugin implementation, the `typescript+namespace` enums mode is no longer necessary. This mode was used in the past to group inline enums under the same namespace. With the latest changes, this behavior is no longer supported. You can either choose to ignore inline enums (default), or use the `enums` transform (added in v0.78.0) to convert them into reusable components which will get exported as usual.

## v0.78.0

### Added `parser` options

Previously, `@hey-api/typescript` would generate correct types, but the validator plugins would have to re-implement the same logic or generate schemas that didn't match the generated types.

Since neither option was ideal, this release adds a dedicated place for `parser` options. Parser is responsible for preparing the input so plugins can generate more accurate output with less effort.

You can learn more about configuring parser on the [Parser](/openapi-ts/configuration/parser) page.

### Moved `input` options

The following options were moved to the new `parser` group.

- `input.filters` moved to `parser.filters`
- `input.pagination` moved to `parser.pagination`
- `input.patch` moved to `parser.patch`
- `input.validate_EXPERIMENTAL` moved to `parser.validate_EXPERIMENTAL`

### Updated `typescript` options

The following options were renamed.

- `enumsCase` moved to `enums.case`
- `enumsConstantsIgnoreNull` moved to `enums.constantsIgnoreNull`

### Moved `typescript` options

The following options were moved to the new `parser` group.

- `exportInlineEnums` moved to `parser.transforms.enums`
- `readOnlyWriteOnlyBehavior` moved to `parser.transforms.readWrite.enabled`
- `readableNameBuilder` moved to `parser.transforms.readWrite.responses.name`
- `writableNameBuilder` moved to `parser.transforms.readWrite.requests.name`

### Updated `readWrite.responses` name

Additionally, the naming pattern for response schemas has changed from `{name}Readable` to `{name}`. This is to prevent your code from breaking by default when using a schema that gets updated with a write-only field.

## v0.77.0

### Updated `sdk.validator` option

Clients can now validate both request and response data. As a result, passing a boolean or string to `validator` will control both of these options. To preserve the previous behavior, set `validator.request` to `false` and `validator.response` to your previous configuration.

<!-- prettier-ignore-start -->
```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/sdk',
      validator: true, // [!code --]
      validator: { // [!code ++]
        request: false, // [!code ++]
        response: true, // [!code ++]
      }, // [!code ++]
    },
  ],
};
```
<!-- prettier-ignore-end -->

### Updated Plugin API

Please refer to the [custom plugin](/openapi-ts/plugins/custom) tutorial for the latest guide.

## v0.76.0

### Single Valibot schema per request

Previously, we generated a separate schema for each endpoint parameter and request body. In v0.76.0, a single request schema is generated for the whole endpoint. It may contain a request body, parameters, and headers.

```ts
const vData = v.object({
  body: v.optional(
    v.object({
      foo: v.optional(v.string()),
      bar: v.optional(v.union([v.number(), v.null()])),
    }),
  ),
  headers: v.optional(v.never()),
  path: v.object({
    baz: v.string(),
  }),
  query: v.optional(v.never()),
});
```

If you need to access individual fields, you can do so using the [`.entries`](https://valibot.dev/api/object/) API. For example, we can get the request body schema with `vData.entries.body`.

## v0.75.0

### Updated TanStack Query options

The TanStack Query plugin options have been expanded to support more naming and casing patterns. As a result, the following options have been renamed.

- `queryOptionsNameBuilder` renamed to `queryOptions`
- `infiniteQueryOptionsNameBuilder` renamed to `infiniteQueryOptions`
- `mutationOptionsNameBuilder` renamed to `mutationOptions`
- `queryKeyNameBuilder` renamed to `queryKeys`
- `infiniteQueryKeyNameBuilder` renamed to `infiniteQueryKeys`

### Added `plugin.forEach()` method

This method replaces the `.subscribe()` method. Additionally, `.forEach()` is executed immediately, which means we don't need the `before` and `after` events – simply move your code before and after the `.forEach()` block.

```ts
plugin.subscribe('operation', (event) => { // [!code --]
  // do something with event // [!code --]
}); // [!code --]
plugin.subscribe('schema', (event) => { // [!code --]
plugin.forEach('operation', 'schema', (event) => { // [!code ++]
  // do something with event
});
```

## v0.74.0

### Single Zod schema per request

Previously, we generated a separate schema for each endpoint parameter and request body. In v0.74.0, a single request schema is generated for the whole endpoint. It may contain a request body, parameters, and headers.

```ts
const zData = z.object({
  body: z
    .object({
      foo: z.string().optional(),
      bar: z.union([z.number(), z.null()]).optional(),
    })
    .optional(),
  headers: z.never().optional(),
  path: z.object({
    baz: z.string(),
  }),
  query: z.never().optional(),
});
```

If you need to access individual fields, you can do so using the [`.shape`](https://zod.dev/api?id=shape) API. For example, we can get the request body schema with `zData.shape.body`.

## v0.73.0

### Bundle `@hey-api/client-*` plugins

In previous releases, you had to install a separate client package to generate a fully working output, e.g. `npm install @hey-api/client-fetch`. This created a few challenges: getting started was slower, upgrading was sometimes painful, and bundling too. Beginning with v0.73.0, all Hey API clients are bundled by default and don't require installing any additional dependencies. You can remove any installed client packages and re-run `@hey-api/openapi-ts`.

```sh
npm uninstall @hey-api/client-fetch
```

## v0.72.0

### Added `sdk.classStructure` option

When generating class-based SDKs, we now try to infer the ideal structure using `operationId` keywords. If you'd like to preserve the previous behavior, set `classStructure` to `off`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      classStructure: 'off', // [!code ++]
      name: '@hey-api/sdk',
    },
  ],
};
```

## v0.71.0

### Renamed `sdk.serviceNameBuilder` option

This option has been renamed to `sdk.classNameBuilder` to better represent its functionality. Additionally, it's no longer set by default. To preserve the previous behavior, update your configuration.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      classNameBuilder: '{{name}}Service', // [!code ++]
      name: '@hey-api/sdk',
      serviceNameBuilder: '{{name}}Service', // [!code --]
    },
  ],
};
```

## v0.68.0

### Upgraded input filters

Input filters now avoid generating invalid output without requiring you to specify every missing schema as in the previous releases. As part of this release, we changed the way filters are configured and removed the support for regular expressions. Let us know if regular expressions are still useful for you and want to bring them back!

::: code-group

```js [include]
export default {
  input: {
    // match only the schema named `foo` and `GET` operation for the `/api/v1/foo` path
    filters: {
      operations: {
        include: ['GET /api/v1/foo'], // [!code ++]
      },
      schemas: {
        include: ['foo'], // [!code ++]
      },
    },
    include: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code --]
    path: 'hey-api/backend', // sign up at app.heyapi.dev
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

```js [exclude]
export default {
  input: {
    // match everything except for the schema named `foo` and `GET` operation for the `/api/v1/foo` path
    exclude: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code --]
    filters: {
      operations: {
        exclude: ['GET /api/v1/foo'], // [!code ++]
      },
      schemas: {
        exclude: ['foo'], // [!code ++]
      },
    },
    path: 'hey-api/backend', // sign up at app.heyapi.dev
  },
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'],
};
```

:::

## v0.67.0

### Respecting `moduleResolution` value in `tsconfig.json`

This release introduces functionality related to your `tsconfig.json` file. The initial feature properly respects the value of your `moduleResolution` field. If you're using `nodenext`, the relative module paths in your output will be appended with `.js`. To preserve the previous behavior where we never appended `.js` to relative module paths, set `output.tsConfigPath` to `off`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    path: 'src/client',
    tsConfigPath: 'off', // [!code ++]
  },
};
```

## v0.66.0

### Read-only and write-only fields

Starting with v0.66.0, `@hey-api/typescript` will generate separate types for payloads and responses if it detects any read-only or write-only fields. To preserve the previous behavior and generate a single type regardless, set `readOnlyWriteOnlyBehavior` to `off`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      name: '@hey-api/typescript',
      readOnlyWriteOnlyBehavior: 'off', // [!code ++]
    },
  ],
};
```

## v0.64.0

### Added `ClientOptions` interface

The `Config` interface now accepts an optional generic extending `ClientOptions` instead of `boolean` type `ThrowOnError`.

```ts
type Foo = Config<false>; // [!code --]
type Foo = Config<{ throwOnError: false }>; // [!code ++]
```

### Added `client.baseUrl` option

You can use this option to configure the default base URL for the generated client. By default, we will attempt to resolve the first defined server or infer the base URL from the input path. If you'd like to preserve the previous behavior, set `baseUrl` to `false`.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      baseUrl: false, // [!code ++]
      name: '@hey-api/client-fetch',
    },
  ],
};
```

## v0.63.0

### Client plugins

Clients are now plugins generating their own `client.gen.ts` file. There's no migration needed if you're using CLI. If you're using the configuration file, move `client` options to `plugins`.

```js
export default {
  client: '@hey-api/client-fetch', // [!code --]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: ['@hey-api/client-fetch'], // [!code ++]
};
```

### Added `client.gen.ts` file

Related to above, the internal `client` instance previously located in `sdk.gen.ts` is now defined in `client.gen.ts`. If you're importing it in your code, update the import module.

```js
import { client } from 'client/sdk.gen'; // [!code --]
import { client } from 'client/client.gen'; // [!code ++]
```

### Moved `sdk.throwOnError` option

This SDK configuration option has been moved to the client plugins where applicable. Not every client can be configured to throw on error, so it didn't make sense to expose the option when it didn't have any effect.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    {
      name: '@hey-api/client-fetch',
      throwOnError: true, // [!code ++]
    },
    {
      name: '@hey-api/sdk',
      throwOnError: true, // [!code --]
    },
  ],
};
```

## v0.62.0

### Changed parser

Formerly known as the experimental parser, this is now the default parser. This change should not impact the generated output's functionality. However, there might be cases where this results in breaking changes due to different handling of certain scenarios. If you need to revert to the legacy parser, set the `experimentalParser` flag to `false`.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: false, // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

Note that the legacy parser is no longer supported and will be removed in the v1 release.

## v0.61.0

### Added `auth` option

Client package functions `accessToken` and `apiKey` were replaced with a single `auth` function for fetching auth tokens. If your API supports multiple auth mechanisms, you can use the `auth` argument to return the appropriate token.

```js
import { client } from 'client/sdk.gen';

client.setConfig({
  accessToken: () => '<my_token>', // [!code --]
  apiKey: () => '<my_token>', // [!code --]
  auth: (auth) => '<my_token>', // [!code ++]
});
```

Due to conflict with the Axios native `auth` option, we removed support for configuring Axios auth. Please let us know if you require this feature added back.

### Added `watch` option

While this is a new feature, supporting it involved replacing the `@apidevtools/json-schema-ref-parser` dependency with our own implementation. Since this was a big change, we're applying caution and marking this as a breaking change.

### Changed `parseAs: 'auto'` behavior

The Fetch API client will return raw response body as `ReadableStream` when `Content-Type` response header is undefined and `parseAs` is `auto`.

## v0.60.0

### Added `sdk.transformer` option

When generating SDKs, you now have to specify `transformer` in order to modify response data. By default, adding `@hey-api/transformers` to your plugins will only produce additional output. To preserve the previous functionality, set `sdk.transformer` to `true`.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      dates: true,
      name: '@hey-api/transformers',
    },
    {
      name: '@hey-api/sdk',
      transformer: true, // [!code ++]
    },
  ],
};
```

## v0.59.0

### Added `logs.level` option

You can now configure different log levels. As part of this feature, we had to introduce a breaking change by moving the `debug` option to `logs.level`. This will affect you if you're calling `@hey-api/openapi-ts` from Node.js (not CLI) or using the configuration file.

```js
export default {
  client: '@hey-api/client-fetch',
  debug: true, // [!code --]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  logs: {
    level: 'debug', // [!code ++]
  },
  output: 'src/client',
};
```

### Updated default `plugins`

`@hey-api/schemas` has been removed from the default plugins. To continue using it, add it to your plugins array.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true,
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    '@hey-api/schemas', // [!code ++]
  ],
};
```

## v0.58.0

### Removed `schemas.gen.ts` re-export

`index.ts` will no longer re-export `schemas.gen.ts` to reduce the chance of producing broken output. Please update your code to import from `schemas.gen.ts` directly.

```js
import { mySchema } from 'client'; // [!code --]
import { mySchema } from 'client/schemas.gen'; // [!code ++]
```

### Removed `transformers.gen.ts` re-export

`index.ts` will no longer re-export `transformers.gen.ts` to reduce the chance of producing broken output. Please update your code to import from `transformers.gen.ts` directly.

```js
import { myTransformer } from 'client'; // [!code --]
import { myTransformer } from 'client/transformers.gen'; // [!code ++]
```

### Added `output.clean` option

By default, the `output.path` folder will be emptied on every run. To preserve the previous behavior, set `output.clean` to `false`.

```js
export default {
  client: '@hey-api/client-fetch',
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    clean: false, // [!code ++]
    path: 'src/client',
  },
};
```

### Added `typescript.identifierCase` option

**This change affects only the experimental parser.** By default, the generated TypeScript interfaces will follow the PascalCase naming convention. In the previous versions, we tried to preserve the original name as much as possible. To keep the previous behavior, set `typescript.identifierCase` to `preserve`.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true,
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      identifierCase: 'preserve', // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

## v0.57.0

### Renamed `@hey-api/services` plugin

This plugin has been renamed to `@hey-api/sdk`.

### Changed `sdk.output` value

To align with the updated name, the `@hey-api/sdk` plugin will generate an `sdk.gen.ts` file. This will result in a breaking change if you're importing from `services.gen.ts`. Please update your imports to reflect this change.

```js
import { client } from 'client/services.gen'; // [!code --]
import { client } from 'client/sdk.gen'; // [!code ++]
```

### Renamed `@hey-api/types` plugin

This plugin has been renamed to `@hey-api/typescript`.

### Added `typescript.exportInlineEnums` option

By default, inline enums (enums not defined as reusable components in the input file) will be generated only as inlined union types. You can set `exportInlineEnums` to `true` to treat inline enums as reusable components. When `true`, the exported enums will follow the style defined in `enums`.

This is a breaking change since in the previous versions, inline enums were always treated as reusable components. To preserve your current output, set `exportInlineEnums` to `true`. This feature works only with the experimental parser.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true,
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  plugins: [
    // ...other plugins
    {
      exportInlineEnums: true, // [!code ++]
      name: '@hey-api/typescript',
    },
  ],
};
```

## v0.56.0

### Deprecated `tree` in `@hey-api/types`

This config option is deprecated and will be removed when the experimental parser becomes the default.

## v0.55.0

This release adds the ability to filter your OpenAPI specification before it's processed. This feature will be useful if you are working with a large specification and are interested in generating output only from a small subset.

This feature is available only in the experimental parser. In the future, this will become the default parser. To opt-in to the experimental parser, set the `experimentalParser` flag in your configuration to `true`.

### Deprecated `include` in `@hey-api/types`

This config option is deprecated and will be removed when the experimental parser becomes the default.

### Deprecated `filter` in `@hey-api/services`

This config option is deprecated and will be removed when the experimental parser becomes the default.

### Added `input.include` option

This config option can be used to replace the deprecated options. It accepts a regular expression string matching against references within the bundled specification.

```js
export default {
  client: '@hey-api/client-fetch',
  experimentalParser: true,
  input: {
    include: '^(#/components/schemas/foo|#/paths/api/v1/foo/get)$', // [!code ++]
    path: 'hey-api/backend', // sign up at app.heyapi.dev
  },
  output: 'src/client',
};
```

The configuration above will process only the schema named `foo` and `GET` operation for the `/api/v1/foo` path.

## v0.54.0

This release makes plugins first-class citizens. In order to achieve that, the following breaking changes were introduced.

### Removed CLI options

The `--types`, `--schemas`, and `--services` CLI options have been removed. You can list which plugins you'd like to use explicitly by passing a list of plugins as `--plugins <plugin1> <plugin2>`

### Removed `*.export` option

Previously, you could explicitly disable export of certain artifacts using the `*.export` option or its shorthand variant. These were both removed. You can now disable export of specific artifacts by manually defining an array of `plugins` and excluding the unwanted plugin.

::: code-group

```js [shorthand]
export default {
  client: '@hey-api/client-fetch',
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  schemas: false, // [!code --]
  plugins: ['@hey-api/types', '@hey-api/services'], // [!code ++]
};
```

```js [*.export]
export default {
  client: '@hey-api/client-fetch',
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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
  input: 'hey-api/backend', // sign up at app.heyapi.dev
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

## v0.53.0

### Changed schemas name pattern

Previously, generated schemas would have their definition names prefixed with `$`. This was problematic when using them with Svelte due to reserved keyword conflicts. The new naming pattern for schemas suffixes their definition names with `Schema`. You can continue using the previous pattern by setting the `schemas.name` configuration option.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  schemas: {
    name: (name) => `$${name}`, // [!code ++]
  },
};
```

### Renamed legacy clients

Legacy clients were renamed to signal they are deprecated more clearly. To continue using legacy clients, you will need to update your configuration and prefix them with `legacy/`.

::: code-group

```js [fetch]
export default {
  client: 'fetch', // [!code --]
  client: 'legacy/fetch', // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

```js [axios]
export default {
  client: 'axios', // [!code --]
  client: 'legacy/axios', // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

```js [angular]
export default {
  client: 'angular', // [!code --]
  client: 'legacy/angular', // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

```js [node]
export default {
  client: 'node', // [!code --]
  client: 'legacy/node', // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

```js [xhr]
export default {
  client: 'xhr', // [!code --]
  client: 'legacy/xhr', // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

:::

## v0.52.0

### Removed internal `client` export

Previously, client packages would create a default client which you'd then import and configure.

```js
import { client, createClient } from '@hey-api/client-fetch';

createClient({
  baseUrl: 'https://example.com',
});

console.log(client.getConfig().baseUrl); // <-- 'https://example.com'
```

This client instance was used internally by services unless overridden. Apart from running `createClient()` twice, people were confused about the meaning of `global` configuration option.

Starting with v0.52.0, client packages will not create a default client. Instead, services will define their own client. You can now achieve the same configuration by importing `client` from services and using the new `setConfig()` method.

```js
import { client } from 'client/services.gen';

client.setConfig({
  baseUrl: 'https://example.com',
});

console.log(client.getConfig().baseUrl); // <-- 'https://example.com'
```

## v0.51.0

### Required `client` option

Client now has to be explicitly specified and `@hey-api/openapi-ts` will no longer generate a legacy Fetch API client by default. To preserve the previous default behavior, set the `client` option to `fetch`.

```js
export default {
  client: 'fetch', // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

## v0.48.0

### Changed `methodNameBuilder()` signature

The `services.methodNameBuilder()` function now provides a single `operation` argument instead of multiple cherry-picked properties from it.

```js
import { createClient } from '@hey-api/openapi-ts';

createClient({
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  services: {
    methodNameBuilder: (service, name) => name, // [!code --]
    methodNameBuilder: (operation) => operation.name, // [!code ++]
  },
});
```

## v0.46.0

### Tree-shakeable services

By default, your services will now support [tree-shaking](https://developer.mozilla.org/docs/Glossary/Tree_shaking). You can either use wildcard imports

```js
import { DefaultService } from 'client/services.gen'; // [!code --]
import * as DefaultService from 'client/services.gen'; // [!code ++]

DefaultService.foo(); // only import needs to be changed
```

or update all references to service classes

```js
import { DefaultService } from 'client/services.gen'; // [!code --]
import { foo } from 'client/services.gen'; // [!code ++]

foo(); // all references need to be changed
```

If you want to preserve the old behavior, you can set the newly exposed `services.asClass` option to `true.`

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  services: {
    asClass: true, // [!code ++]
  },
};
```

## v0.45.0

### Removed `client` inference

`@hey-api/openapi-ts` will no longer infer which client you want to generate. By default, we will create a `fetch` client. If you want a different client, you can specify it using the `client` option.

```js
export default {
  client: 'axios', // [!code ++]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
};
```

## v0.44.0

### Moved `format`

This config option has been moved. You can now configure formatter using the `output.format` option.

```js
export default {
  format: 'prettier', // [!code --]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: {
    format: 'prettier', // [!code ++]
    path: 'src/client',
  },
};
```

### Moved `lint`

This config option has been moved. You can now configure linter using the `output.lint` option.

```js
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  lint: 'eslint', // [!code --]
  output: {
    lint: 'eslint', // [!code ++]
    path: 'src/client',
  },
};
```

## v0.43.0

### Removed `enums.gen.ts`

This file has been removed. Instead, enums are exported from `types.gen.ts`. If you use imports from `enums.gen.ts`, you should be able to easily find and replace all instances.

```js
import { Foo } from 'client/enums.gen'; // [!code --]
import { Foo } from 'client/types.gen'; // [!code ++]
```

### Removed `Enum` postfix

Generated enum names are no longer postfixed with `Enum`. You can either alias your imports

```js
import { FooEnum } from 'client/types.gen'; // [!code --]
import { Foo as FooEnum } from 'client/types.gen'; // [!code ++]

console.log(FooEnum.value); // only import needs to be changed
```

or update all references to enums

```js
import { FooEnum } from 'client/types.gen'; // [!code --]
import { Foo } from 'client/types.gen'; // [!code ++]

console.log(Foo.value); // all references need to be changed
```

### Moved `enums`

This config option has been moved. You can now configure enums using the `types.enums` option.

```js
export default {
  enums: 'javascript', // [!code --]
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  types: {
    enums: 'javascript', // [!code ++]
  },
};
```

## v0.42.0

### Changed `format`

This config option has changed. You now need to specify a value (`biome` or `prettier`) to format the output (default: `false`).

```js{2}
export default {
  format: 'prettier',
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
}
```

### Changed `lint`

This config option has changed. You now need to specify a value (`biome` or `eslint`) to lint the output (default: `false`).

```js{3}
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  lint: 'eslint',
  output: 'src/client',
}
```

### Moved `operationId`

This config option has been moved. You can now configure it using the `services.operationId` option.

```js{5}
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  services: {
    operationId: true,
  },
}
```

## v0.41.0

### Removed `postfixServices`

This config option has been removed. You can now transform service names using the string pattern parameter.

```js{5}
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  services: {
    name: 'myAwesome{{name}}Api',
  },
}
```

### Removed `serviceResponse`

This config option has been removed. You can now configure service responses using the `services.response` option.

```js{5}
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  services: {
    response: 'body',
  },
}
```

### Removed `useDateType`

This config option has been removed. You can now configure date type using the `types.dates` option.

```js{5}
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  type: {
    dates: true,
  },
}
```

## v0.40.0

### Renamed `models.gen.ts` file

`models.gen.ts` is now called `types.gen.ts`. If you use imports from `models.gen.ts`, you should be able to easily find and replace all instances.

```js
import type { Model } from 'client/models.gen' // [!code --]
import type { Model } from 'client/types.gen' // [!code ++]
```

### Renamed `exportModels`

This config option is now called `types`.

### PascalCase for types

You can now choose to export types using the PascalCase naming convention.

```js{5}
export default {
  input: 'hey-api/backend', // sign up at app.heyapi.dev
  output: 'src/client',
  types: {
    name: 'PascalCase',
  },
}
```

### Exported `enums.gen.ts` file

Enums are now re-exported from the main `index.ts` file.

## v0.39.0

### Single `enums.gen.ts` file

Enums are now exported from a separate file. If you use imports from `models.ts`, you can change them to `enums.gen.ts`.

```js
import { Enum } from 'client/models'; // [!code --]
import { Enum } from 'client/enums.gen'; // [!code ++]
```

### Renamed `models.ts` file

`models.ts` is now called `models.gen.ts`. If you use imports from `models.ts`, you should be able to easily find and replace all instances.

```js
import type { Model } from 'client/models' // [!code --]
import type { Model } from 'client/models.gen' // [!code ++]
```

### Renamed `schemas.ts` file

`schemas.ts` is now called `schemas.gen.ts`. If you use imports from `schemas.ts`, you should be able to easily find and replace all instances.

```js
import { $Schema } from 'client/schemas'; // [!code --]
import { $Schema } from 'client/schemas.gen'; // [!code ++]
```

### Renamed `services.ts` file

`services.ts` is now called `services.gen.ts`. If you use imports from `services.ts`, you should be able to easily find and replace all instances.

```js
import { DefaultService } from 'client/services'; // [!code --]
import { DefaultService } from 'client/services.gen'; // [!code ++]
```

### Deprecated exports from `index.ts`

Until this release, `index.ts` file exported all generated artifacts. Starting from this release, enums are no longer exported from `index.ts`. Models, schemas, and services will continue to be exported from `index.ts` to avoid a huge migration lift, but we recommend migrating to import groups per artifact type.

```js
import { Enum, type Model, $Schema, DefaultService } from 'client' // [!code --]
import { Enum } from 'client/enums.gen' // [!code ++]
import type { Model } from 'client/models.gen' // [!code ++]
import { $Schema } from 'client/schemas.gen' // [!code ++]
import { DefaultService } from 'client/services.gen' // [!code ++]
```

### Prefer `unknown`

Types that cannot be determined will now be generated as `unknown` instead of `any`. To dismiss any errors, you can cast your variables back to `any`, but we recommend updating your code to work with `unknown` types.

```js
const foo = bar as any
```

## v0.38.0

### Renamed `write`

This config option is now called `dryRun` (file) or `--dry-run` (CLI). To restore existing functionality, invert the value, ie. `write: true` is `dryRun: false` and `write: false` is `dryRun: true`.

## v0.36.0

### JSON Schema 2020-12

Schemas are exported directly from OpenAPI specification. This means your schemas might change depending on which OpenAPI version you're using. If this release caused a field to be removed, consult the JSON Schema documentation on how to obtain the same value from JSON Schema (eg. [required properties](https://json-schema.org/understanding-json-schema/reference/object#required)).

### Renamed `exportSchemas`

This config option is now called `schemas`.

## v0.35.0

### Removed `postfixModels`

This config option has been removed.

## v0.34.0

### Single `services.ts` file

Services are now exported from a single file. If you used imports from individual service files, these will need to be updated to refer to the single `services.ts` file.

## v0.31.1

### Merged enums options

`useLegacyEnums` config option is now `enums: 'typescript'` and existing `enums: true` option is now `enums: 'javascript'`.

## v0.31.0

### Single `models.ts` file

TypeScript interfaces are now exported from a single file. If you used imports from individual model files, these will need to be updated to refer to the single `models.ts` file.

### Single `schemas.ts` file

Schemas are now exported from a single file. If you used imports from individual schema files, these will need to be updated to refer to the single `schemas.ts` file.

## v0.27.38

### `useOptions: true`

By default, generated clients will use a single object argument to pass values to API calls. This is a significant change from the previous default of unspecified array of arguments. If migrating your application in one go isn't feasible, we recommend deprecating your old client and generating a new client.

```ts
import { DefaultService } from 'client/services'; // <-- old client with array arguments

import { DefaultService } from 'client_v2/services'; // <-- new client with options argument
```

This way, you can gradually switch over to the new syntax as you update parts of your code. Once you've removed all instances of `client` imports, you can safely delete the old `client` folder and find and replace all `client_v2` calls to `client`.

## v0.27.36

### `exportSchemas: true`

By default, we will create schemas from your OpenAPI specification. Use `exportSchemas: false` to preserve the old behavior.

## v0.27.32

### Renamed `Config` interface

This interface is now called `UserConfig`.

## v0.27.29

### Renamed `openapi` CLI command

This command is now called `openapi-ts`.

## v0.27.26

### Removed `indent`

This config option has been removed. Use a [code formatter](/openapi-ts/configuration/output#post-process) to modify the generated files code style according to your preferences.

## v0.27.24

### Removed `useUnionTypes`

This config option has been removed. Generated types will behave the same as `useUnionTypes: true` before.

## OpenAPI TypeScript Codegen

`@hey-api/openapi-ts` was originally forked from Ferdi Koomen's [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen). Therefore, we want you to be able to migrate your projects. Migration should be relatively straightforward if you follow the release notes on this page. Start on [v0.27.24](#v0-27-24) and scroll to the release you're migrating to.
