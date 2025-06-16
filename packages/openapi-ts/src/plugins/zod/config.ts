import { definePluginConfig } from '../shared/utils/config';
import type { Plugin } from '../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  config: {
    comments: true,
    exportFromIndex: false,
    metadata: false,
  },
  handler,
  handlerLegacy: () => {},
  name: 'zod',
  output: 'zod',
  tags: ['validator'],
};

/**
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
