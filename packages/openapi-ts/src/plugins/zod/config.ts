import type { DefineConfig, PluginConfig } from '../types';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: PluginConfig<Config> = {
  _handler: () => {},
  _handlerLegacy: handlerLegacy,
  name: 'zod',
  output: 'zod',
};

/**
 * Type helper for Zod plugin, returns {@link PluginConfig} object
 */
export const defineConfig: DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
