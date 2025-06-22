import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import type { HeyApiClientLegacyXhrPlugin } from './types';

export const defaultConfig: Plugin.Config<HeyApiClientLegacyXhrPlugin> = {
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
