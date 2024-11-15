import type { DefineConfig, PluginConfig } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: PluginConfig<Config> = {
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  name: '@hey-api/schemas',
  nameBuilder: (name) => `${name}Schema`,
  output: 'schemas',
  type: 'json',
};

/**
 * Type helper for `@hey-api/schemas` plugin, returns {@link PluginConfig} object
 */
export const defineConfig: DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
