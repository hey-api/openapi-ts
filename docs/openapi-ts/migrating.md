---
title: Migrating
description: Migrating to @hey-api/openapi-ts.
---

# Migrating

While we try to avoid breaking changes, sometimes it's unavoidable in order to offer you the latest features.

## v0.27.38

### `useOptions: true`

By default, generated clients will use a single object argument to pass values to API calls. This is a significant change from the previous default of unspecified array of arguments. If migrating your application in one go isn't feasible, we recommend deprecating your old client and generating a new client.

```ts
import { DefaultService } from 'client' // <-- old client with array arguments

import { DefaultService } from 'client_v2' // <-- new client with options argument
```

This way, you can gradually switch over to the new syntax as you update parts of your code. Once you've removed all instances of `client` imports, you can safely delete the old `client` folder and find and replace all `client_v2` calls to `client`.

## OpenAPI TypeScript Codegen

`openapi-ts` was originally forked from Ferdi Koomen's [openapi-typescript-codegen](https://github.com/ferdikoomen/openapi-typescript-codegen). At first, we only added support for OpenAPI v3.1, but we've changed more things since. As of v0.34.5, our APIs are similar, so migrating should be relatively straightforward. If you run into an issue with migration, please [open an issue](https://github.com/hey-api/openapi-ts/issues).

### Changes

- `exportSchemas` is `true` by default (set `exportSchemas` to `false` to preserve the old behavior)
- `client` is optional (old behavior preserved, but can be most likely removed)

### Removed

- `useUnionTypes` has been removed (`openapi-ts` works the same as `useUnionTypes: true` before)
- `indent` has been removed (use [code formatter](/openapi-ts/configuration#formatting) to style output)
- `postfixModels` has been removed (open an [issue](https://github.com/hey-api/openapi-ts/issues) if you have a critical use case)

### Deprecated

- `useOptions: false` is deprecated and `true` by default (see [v0.27.38](#v0-27-38))
- `postfixServices` is deprecated and will be removed in future releases
- `request` will be deprecated and removed in future releases
- `name` will be deprecated and removed in future releases
