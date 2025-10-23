import { definePluginConfig } from '~/plugins/shared/utils/config';

import type { HeyApiClientLegacyAngularPlugin } from './types';

export const defaultConfig: HeyApiClientLegacyAngularPlugin['Config'] = {
  config: {},
  handler: () => {},
  name: 'legacy/angular',
  output: 'client',
  tags: ['client'],
};

/**
 * Type helper for `legacy/angular` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
