import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import type { HeyApiClientLegacyAxiosPlugin } from './types';

export const defaultConfig: Plugin.Config<HeyApiClientLegacyAxiosPlugin> = {
  config: {},
  handler: () => {},
  name: 'legacy/axios',
  output: 'client',
  tags: ['client'],
};

/**
 * Type helper for `legacy/axios` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
