import type { Plugin } from '../../types';
import { clientDefaultConfig } from '../client-core/config';
import { clientPluginHandler } from '../client-core/plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  ...clientDefaultConfig,
  _handler: clientPluginHandler,
  _handlerLegacy: () => {},
  name: '@hey-api/client-next',
  throwOnError: false,
};

/**
 * Type helper for `@hey-api/client-next` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
