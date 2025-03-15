import type { Plugin } from '../types';
import { handler } from './plugin'
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: handler,
  _handlerLegacy: () => {},
  name: 'openapi-info',
  output: 'opeapi-info',
};

/**
 * Type helper for `metadata` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
