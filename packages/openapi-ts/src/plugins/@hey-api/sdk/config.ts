import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  _infer: (config, context) => {
    if (config.client) {
      if (typeof config.client === 'boolean') {
        config.client = context.pluginByTag(
          'client',
          '🚫 client needs to be set to generate SDKs - which HTTP client do you want to use?',
        ) as unknown as typeof config.client;
      }

      context.ensureDependency(config.client);
    }

    if (config.transformer) {
      if (typeof config.transformer === 'boolean') {
        config.transformer = context.pluginByTag(
          'transformer',
        ) as unknown as typeof config.transformer;
      }

      context.ensureDependency(config.transformer);
    }

    if (config.validator) {
      if (typeof config.validator === 'boolean') {
        config.validator = context.pluginByTag(
          'validator',
        ) as unknown as typeof config.validator;
      }

      context.ensureDependency(config.validator);
    }
  },
  asClass: false,
  auth: true,
  client: true,
  exportFromIndex: true,
  name: '@hey-api/sdk',
  operationId: true,
  output: 'sdk',
  params: 'namespaced',
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
