import type { DefineConfig, PluginConfig } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: PluginConfig<Config> = {
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  enums: false,
  enumsCase: 'SCREAMING_SNAKE_CASE',
  exportInlineEnums: false,
  identifierCase: 'PascalCase',
  name: '@hey-api/typescript',
  output: 'types',
  style: 'preserve',
  tree: false,
};

/**
 * Type helper for `@hey-api/typescript` plugin, returns {@link PluginConfig} object
 */
export const defineConfig: DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
