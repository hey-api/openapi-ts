---
title: Migrating
description: Migrating to @hey-api/openapi-ts.
---

# Migrating

While we try to avoid breaking changes, sometimes it's unavoidable in order to offer you the latest features. This page lists changes that require updates to your code.

## @next

These changes haven't been released yet. However, you can migrate your code today to save time on migration once they're released.

### Deprecated exports from `index.ts`

Currently, `index.ts` file exports all generated artifacts.

```ts
export { ApiError } from './core/ApiError';
export { CancelablePromise, CancelError } from './core/CancelablePromise';
export { OpenAPI, type OpenAPIConfig } from './core/OpenAPI';
export * from './models';
export * from './schemas';
export * from './services';
```

We will be slowly moving away from this practice. Any non-core related imports should be imported as

```ts
import type { Model } from 'client/models';
import { $Schema } from 'client/schemas';
import { DefaultService } from 'client/services';
```

You don't have to update imports from `core` directory. These will be addressed in later releases.

### Deprecated `useOptions`

This config option is deprecated and will be removed.

### Deprecated `postfixServices`

This config option is deprecated and will be removed.

### Deprecated `request`

This config option is deprecated and will be removed.

### Deprecated `name`

This config option is deprecated and will be removed.

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
import { DefaultService } from 'client/services' // <-- old client with array arguments

import { DefaultService } from 'client_v2/services' // <-- new client with options argument
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

`openapi-ts` was originally forked from Ferdi Koomen's [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen). Therefore, we want you to be able to migrate your openapi-typescript-codegen projects. Migration should be relatively straightforward if you follow the release notes on this page. If you run into an issue with migration, please [open an issue](https://github.com/hey-api/openapi-ts/issues).

### Changed

- `exportSchemas` is `true` by default (see [v0.27.36](#v0-27-36))
- `useOptions` is `true` by default (see [v0.27.38](#v0-27-38))

### Removed

- `useUnionTypes` has been removed (see [v0.27.24](#v0-27-24))
- `indent` has been removed (see [v0.27.26](#v0-27-26))
- `postfixModels` has been removed (see [v0.35.0](#v0-35-0))
