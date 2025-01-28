import type { Plugin } from '../../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: handler,
  _handlerLegacy: () => {
    // TODO: Add error for dx?
  },
  _tags: ['client'],
  bundle: false,
  name: '@hey-api/client-angular',
  output: 'client',
  throwOnError: false,
};

/**
 * Type helper for `@hey-api/client-angular` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
