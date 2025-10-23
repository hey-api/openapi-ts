import { definePluginConfig } from '~/plugins/shared/utils/config';

import type { HeyApiClientLegacyFetchPlugin } from './types';

export const defaultConfig: HeyApiClientLegacyFetchPlugin['Config'] = {
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
