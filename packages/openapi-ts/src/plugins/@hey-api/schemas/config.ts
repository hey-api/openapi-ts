import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  config: {
    exportFromIndex: false,
    nameBuilder: (name) => `${name}Schema`,
    type: 'json',
  },
  handler,
  handlerLegacy,
  name: '@hey-api/schemas',
  output: 'schemas',
};

/**
 * Type helper for `@hey-api/schemas` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
