import { definePluginConfig } from '../shared/utils/config';
import type { Plugin } from '../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  config: {
    comments: true,
    exportFromIndex: false,
  },
  handler,
  handlerLegacy: () => {},
  name: 'valibot',
  output: 'valibot',
  tags: ['validator'],
};

/**
 * Type helper for Valibot plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
