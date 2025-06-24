import { definePluginConfig } from '../../shared/utils/config';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiTransformersPlugin } from './types';

export const defaultConfig: HeyApiTransformersPlugin['Config'] = {
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
