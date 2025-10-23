import { definePluginConfig } from '~/plugins/shared/utils/config';

import type { HeyApiClientLegacyAxiosPlugin } from './types';

export const defaultConfig: HeyApiClientLegacyAxiosPlugin['Config'] = {
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
