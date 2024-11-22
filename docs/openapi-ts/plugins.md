---
title: Plugins
description: Learn about and discover available plugins.
---

# Plugins

Every generated file in your output is created by a plugin. You already learned about the default plugins in [Output](/openapi-ts/output). This page contains all native plugins and shows you how to create your own.

## Hey API

Apart from being responsible for the default output, Hey API plugins are the foundation for other plugins. Instead of creating their own primitives, other plugins can reuse the artifacts from Hey API plugins. This results in smaller output and a better user experience.

- `@hey-api/schemas` - export OpenAPI definitions as JavaScript objects
- `@hey-api/sdk` - robust and polished SDKs
- `@hey-api/transformers` - response data transformer functions
- `@hey-api/typescript` - TypeScript interfaces and enums

## Third Party

These plugins help reduce boilerplate associated with third-party dependencies. Hey API natively supports the most popular packages. Please open an issue on [GitHub](https://github.com/hey-api/openapi-ts/issues) if you'd like us to support your favorite package.

- [`@tanstack/angular-query-experimental`](/openapi-ts/tanstack-query) - TanStack Query functions and query keys
- [`@tanstack/react-query`](/openapi-ts/tanstack-query) - TanStack Query functions and query keys
- [`@tanstack/solid-query`](/openapi-ts/tanstack-query) - TanStack Query functions and query keys
- [`@tanstack/svelte-query`](/openapi-ts/tanstack-query) - TanStack Query functions and query keys
- [`@tanstack/vue-query`](/openapi-ts/tanstack-query) - TanStack Query functions and query keys
- [`fastify`](/openapi-ts/fastify) - TypeScript interface for Fastify route handlers
- [`zod`](/openapi-ts/zod) - Zod schemas to validate your data

## Community

Featured community plugins.

- [add plugin](https://github.com/hey-api/openapi-ts/pulls)

## Custom

::: warning
Plugins API is in development. The interface might change before it becomes stable. We encourage you to leave feedback on [GitHub](https://github.com/hey-api/openapi-ts/issues).
:::

If the existing plugins do not handle your use case or you're working with proprietary packages, you might want to create your own plugin.

### Configuration

We recommend following the design pattern of the native plugins. First, create a `my-plugin` folder for your plugin files. Inside, create a barrel file `index.ts` exporting the plugin's API.

::: code-group

```ts [index.ts]
export { defaultConfig, defineConfig } from './config';
export type { Config } from './types';
```

:::

`index.ts` references 2 files, so we need to create them. `types.d.ts` contains the TypeScript interface for your plugin's options. It must have the `name` and `output` fields, everything else will become your plugin's configuration options.

::: code-group

```ts [types.d.ts]
export interface Config {
  /**
   * Plugin name. Must be unique.
   */
  name: 'my-plugin';
  /**
   * Name of the generated file.
   * @default 'my-plugin'
   */
  output?: string;
  /**
   * A custom option for your plugin.
   */
  myOption?: boolean;
}
```

:::

`config.ts` contains the runtime configuration for your plugin. It must implement the `Config` interface from `types.d.ts` and additional plugin metadata defined in the `PluginConfig` interface.

::: code-group

```ts [config.ts]
import type { DefineConfig, PluginConfig } from '@hey-api/openapi-ts/plugins';

import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: PluginConfig<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: () => {},
  name: 'my-plugin',
  output: 'my-plugin',
};

/**
 * Type helper for `my-plugin` plugin, returns {@link PluginConfig} object
 */
export const defineConfig: DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
```

:::

In the `config.ts` above, we define a `my-plugin` plugin which will generate a `my-plugin.gen.ts` output file. We also demonstrate declaring `@hey-api/typescript` as a dependency for our plugin, so we can safely import artifacts from `types.gen.ts`.

Lastly, we define the `_handler` method which will be responsible for generating our custom output. We just need to create the remaining `plugin.ts` file.

::: code-group

```ts [plugin.ts]
import type { PluginHandler } from '@hey-api/openapi-ts/plugins';

import type { Config } from './types';

export const handler: PluginHandler<Config> = ({ context, plugin }) => {
  // create a file for our output
  const file = context.createFile({
    id: plugin.name,
    path: plugin.output,
  });

  context.subscribe('before', () => {
    // do something before parsing the input
  });

  context.subscribe('operation', ({ operation }) => {
    // do something with the operation model
  });

  context.subscribe('schema', ({ operation }) => {
    // do something with the schema model
  });

  context.subscribe('after', () => {
    // do something after parsing the input
  });
};
```

:::

And that's it! We can now register our plugin in the Hey API configuration.

```js
import { defineConfig } from './src/my-plugin';

export default {
  client: '@hey-api/client-fetch',
  input: 'path/to/openapi.json',
  output: 'src/client',
  plugins: [
    defineConfig({
      myOption: true,
    }),
  ],
};
```
