import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  _optionalDependencies: ['@hey-api/transformers'],
  asClass: false,
  auth: true,
  name: '@hey-api/sdk',
  operationId: true,
  output: 'sdk',
  response: 'body',
  serviceNameBuilder: '{{name}}Service',
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig: Plugin.DefineConfig<Config> = (config) => ({
  ...defaultConfig,
  ...config,
});
