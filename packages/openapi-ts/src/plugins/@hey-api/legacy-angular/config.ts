import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  config: {},
  handler: () => {},
  handlerLegacy: () => {},
  name: 'legacy/angular',
  output: 'client',
  tags: ['client'],
};

/**
 * Type helper for `legacy/angular` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
