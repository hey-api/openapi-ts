import { definePluginConfig } from '../shared/utils/config';
import type { Plugin } from '../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: handler,
  _handlerLegacy: () => {},
  _tags: ['validator'],
  config: {
    comments: true,
    exportFromIndex: false,
    metadata: false,
  },
  name: 'zod',
  output: 'zod',
};

/**
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
