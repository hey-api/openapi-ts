import type { Plugin } from '../../types';
import { handler } from './plugin';
import type { Config } from './types';

export const PluginName = '@pinia/colada';

/**
 * Default options for the Pinia Colada plugin
 */
export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  enableCaching: false,
  enablePaginationOnKey: undefined,
  errorHandling: 'specific',
  exportFromIndex: true,
  groupByTag: false,
  importPath: PluginName,
  includeTypes: true,
  name: PluginName,
  output: PluginName,
  resolveQuery: undefined,
  resolveQueryKey: undefined,
  useInfiniteQueries: false,
};

/**
 * Type helper for `@pinia-colada` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (
  config?: Partial<Config>,
) => ({
  ...defaultConfig,
  ...config,
});
