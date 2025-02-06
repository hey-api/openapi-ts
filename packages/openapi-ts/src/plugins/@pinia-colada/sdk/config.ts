import type { Plugin } from '../../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  exportFromIndex: true,
  name: '@pinia-colada/sdk',
  output: 'queries',
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
