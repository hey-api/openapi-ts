import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  enums: false,
  enumsCase: 'SCREAMING_SNAKE_CASE',
  exportFromIndex: true,
  exportInlineEnums: false,
  identifierCase: 'PascalCase',
  name: '@hey-api/typescript',
  output: 'types',
  style: 'preserve',
  tree: false,
};

/**
 * Type helper for `@hey-api/typescript` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
