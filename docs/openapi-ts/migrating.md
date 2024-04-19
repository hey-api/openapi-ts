---
title: Migrating
description: Migrating to @hey-api/openapi-ts.
---

# Migrating

While we try to avoid breaking changes, sometimes it's unavoidable in order to offer you the latest features. This page lists changes that require updates to your code. If you run into an issue with migration, please [open an issue](https://github.com/hey-api/openapi-ts/issues).

## @next

These changes haven't been released yet. However, you can migrate your code today to save time on migration once they're released.

### Deprecated exports from `index.ts`

Currently, `index.ts` file exports all generated artifacts. We will be slowly moving away from this practice.

```js
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI, type OpenAPIConfig } from './core/OpenAPI';
export * from './enums.gen'; // [!code --]
export * from './schemas.gen'; // [!code --]
export * from './services.gen'; // [!code --]
export * from './types.gen'; // [!code --]
```

Any non-core related imports should be imported as

```js
import { Enum } from 'client/enums.gen'
import { $Schema } from 'client/schemas.gen';
import { DefaultService } from 'client/services.gen';
import type { Model } from 'client/types.gen';
```

You don't have to update imports from `core` directory. These will be addressed in later releases.

### Deprecated `useOptions`

This config option is deprecated and will be removed.

### Deprecated `request`

This config option is deprecated and will be removed.

### Deprecated `name`

This config option is deprecated and will be removed.

## v0.41.0

### Removed `postfixServices`

This config option has been removed. You can now transform service names using the string pattern parameter.

```js{5}
export default {
  input: 'path/to/openapi.json',
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
  input: 'path/to/openapi.json',
  output: 'src/client',
  services: {
    response: 'body',
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
  input: 'path/to/openapi.json',
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

This config option has been removed. Use a [code formatter](/openapi-ts/configuration#formatting) to modify the generated files code style according to your preferences.

## v0.27.24

### Removed `useUnionTypes`

This config option has been removed. Generated types will behave the same as `useUnionTypes: true` before.

## OpenAPI TypeScript Codegen

`openapi-ts` was originally forked from Ferdi Koomen's [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen). Therefore, we want you to be able to migrate your projects. Migration should be relatively straightforward if you follow the release notes on this page. Start here and scroll up to the release you're migrating to.
