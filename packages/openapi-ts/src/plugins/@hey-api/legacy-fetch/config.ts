import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import type { HeyApiClientLegacyFetchPlugin } from './types';

export const defaultConfig: Plugin.Config<HeyApiClientLegacyFetchPlugin> = {
  config: {},
  handler: () => {},
  name: 'legacy/fetch',
  output: 'client',
  tags: ['client'],
};

/**
 * Type helper for `legacy/fetch` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
