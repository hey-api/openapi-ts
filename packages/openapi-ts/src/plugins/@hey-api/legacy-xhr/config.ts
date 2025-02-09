import type { Plugin } from '../../types';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: () => {},
  _handlerLegacy: () => {},
  _tags: ['client'],
  name: 'legacy/xhr',
  output: 'client',
};

/**
 * Type helper for `legacy/xhr` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
