import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  _dependencies: ['@hey-api/typescript'],
  _handler: handler,
  _handlerLegacy: handlerLegacy,
  _infer: (plugin, context) => {
    if (plugin.config.client) {
      if (typeof plugin.config.client === 'boolean') {
        plugin.config.client = context.pluginByTag({
          defaultPlugin: '@hey-api/client-fetch',
          tag: 'client',
        }) as unknown as typeof plugin.config.client;
      }

      context.ensureDependency(plugin.config.client);
    }

    if (plugin.config.transformer) {
      if (typeof plugin.config.transformer === 'boolean') {
        plugin.config.transformer = context.pluginByTag({
          tag: 'transformer',
        }) as unknown as typeof plugin.config.transformer;
      }

      context.ensureDependency(plugin.config.transformer);
    }

    if (plugin.config.validator) {
      if (typeof plugin.config.validator === 'boolean') {
        plugin.config.validator = context.pluginByTag({
          tag: 'validator',
        }) as unknown as typeof plugin.config.validator;
      }

      context.ensureDependency(plugin.config.validator);
    }

    if (plugin.config.instance) {
      if (typeof plugin.config.instance !== 'string') {
        plugin.config.instance = 'Sdk';
      }

      plugin.config.asClass = true;
    }

    // TODO: add responseStyle field to all clients
    if (plugin.config.client !== '@hey-api/client-fetch') {
      plugin.config.responseStyle = 'fields';
    }
  },
  config: {
    asClass: false,
    auth: true,
    classStructure: 'auto',
    client: true,
    exportFromIndex: true,
    instance: false,
    operationId: true,
    response: 'body',
    responseStyle: 'fields',
  },
  name: '@hey-api/sdk',
  output: 'sdk',
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
