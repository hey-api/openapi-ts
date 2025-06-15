import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: () => {},
  _handlerLegacy: () => {},
  _tags: ['client'],
  config: {},
  name: 'legacy/node',
  output: 'client',
};

/**
 * Type helper for `legacy/node` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
