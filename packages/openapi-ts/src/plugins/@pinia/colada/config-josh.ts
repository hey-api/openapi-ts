import { definePluginConfig } from '../../shared/utils/config';
import { handler } from './plugin';
import type { PiniaColadaPlugin } from './types';

export const defaultConfig: PiniaColadaPlugin['Config'] = {
  config: {
    enablePaginationOnKey: undefined,
    errorHandling: 'specific',
    exportFromIndex: false,
    groupByTag: false,
    importPath: '@pinia/colada',
    includeTypes: true,
    prefixUse: true,
    suffixQueryMutation: true,
    useInfiniteQueries: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler: handler as PiniaColadaPlugin['Handler'],
  name: '@pinia/colada',
  output: '@pinia/colada',
};

/**
 * Type helper for `@pinia/colada` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
