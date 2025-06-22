import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import type { HeyApiClientLegacyNodePlugin } from './types';

export const defaultConfig: Plugin.Config<HeyApiClientLegacyNodePlugin> = {
  config: {},
  handler: () => {},
  name: 'legacy/node',
  output: 'client',
  tags: ['client'],
};

/**
 * Type helper for `legacy/node` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
