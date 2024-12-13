import type { Plugin } from '../types';
import { handler } from './plugin';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: handler,
  _handlerLegacy: () => {},
  _tags: ['validator'],
  name: 'zod',
  output: 'zod',
};

/**
 * Type helper for Zod plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
