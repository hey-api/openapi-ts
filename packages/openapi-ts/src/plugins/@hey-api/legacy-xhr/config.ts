import { definePluginConfig } from '~/plugins/shared/utils/config';

import type { HeyApiClientLegacyXhrPlugin } from './types';

export const defaultConfig: HeyApiClientLegacyXhrPlugin['Config'] = {
  config: {},
  handler: () => {},
  name: 'legacy/xhr',
  output: 'client',
  tags: ['client'],
};

/**
 * Type helper for `legacy/xhr` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
