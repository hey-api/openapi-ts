import { definePluginConfig } from '~/plugins/shared/utils/config';

import type { HeyApiClientLegacyNodePlugin } from './types';

export const defaultConfig: HeyApiClientLegacyNodePlugin['Config'] = {
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
