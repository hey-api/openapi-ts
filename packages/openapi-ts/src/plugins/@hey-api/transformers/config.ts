import { definePluginConfig } from '../../shared/utils/config';
import { Api } from './api';
import { bigIntExpressions, dateExpressions } from './expressions';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiTransformersPlugin } from './types';

export const defaultConfig: HeyApiTransformersPlugin['Config'] = {
  api: new Api({
    name: '@hey-api/transformers',
  }),
  config: {
    bigInt: true,
    dates: true,
    exportFromIndex: false,
    transformers: [],
    typeTransformers: [],
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  handlerLegacy,
  name: '@hey-api/transformers',
  output: 'transformers',
  resolveConfig: (plugin) => {
    if (!plugin.config.transformers) {
      plugin.config.transformers = [];
    }

    if (plugin.config.dates) {
      plugin.config.transformers = [
        ...plugin.config.transformers,
        dateExpressions,
      ];
    }

    if (plugin.config.bigInt) {
      plugin.config.transformers = [
        ...plugin.config.transformers,
        bigIntExpressions,
      ];
    }
  },
  tags: ['transformer'],
};

/**
 * Type helper for `@hey-api/transformers`, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
