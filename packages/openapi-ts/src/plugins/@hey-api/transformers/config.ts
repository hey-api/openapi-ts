import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiTransformersPlugin } from './types';

export const defaultConfig: Plugin.Config<HeyApiTransformersPlugin> = {
  config: {
    bigInt: true,
    dates: true,
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  handlerLegacy,
  name: '@hey-api/transformers',
  output: 'transformers',
  tags: ['transformer'],
};

/**
 * Type helper for `@hey-api/transformers`, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
