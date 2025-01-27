import type { Plugin } from '../../types';
import { handler } from '../client-core/plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: handler,
  _handlerLegacy: () => {},
  _tags: ['client'],
  bundle: false,
  name: '@hey-api/client-fetch',
  output: 'client',
  throwOnError: false,
};

/**
 * Type helper for `@hey-api/client-fetch` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
