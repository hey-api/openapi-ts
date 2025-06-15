import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  _tags: ['transformer'],
  config: {
    bigInt: true,
    dates: true,
    exportFromIndex: false,
  },
  name: '@hey-api/transformers',
  output: 'transformers',
};

/**
 * Type helper for `@hey-api/transformers`, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
