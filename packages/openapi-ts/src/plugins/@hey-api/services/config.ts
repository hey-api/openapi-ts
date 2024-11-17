import type { DefineConfig, PluginConfig } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: PluginConfig<Config> = {
  _dependencies: ['@hey-api/types'],
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  _optionalDependencies: ['@hey-api/transformers'],
  asClass: false,
  name: '@hey-api/services',
  operationId: true,
  output: 'services',
  response: 'body',
  serviceNameBuilder: '{{name}}Service',
};

/**
 * Type helper for `@hey-api/services` plugin, returns {@link PluginConfig} object
 */
export const defineConfig: DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
