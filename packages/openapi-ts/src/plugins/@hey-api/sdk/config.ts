import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
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
  dependencies: ['@hey-api/typescript'],
  handler,
  handlerLegacy,
  name: '@hey-api/sdk',
  output: 'sdk',
  resolveConfig: (plugin, context) => {
    if (plugin.config.client) {
      if (typeof plugin.config.client === 'boolean') {
        plugin.config.client = context.pluginByTag('client', {
          defaultPlugin: '@hey-api/client-fetch',
        });
      }

      plugin.dependencies.add(plugin.config.client!);
    }

    if (plugin.config.transformer) {
      if (typeof plugin.config.transformer === 'boolean') {
        plugin.config.transformer = context.pluginByTag('transformer');
      }

      plugin.dependencies.add(plugin.config.transformer!);
    }

    if (plugin.config.validator) {
      if (typeof plugin.config.validator === 'boolean') {
        plugin.config.validator = context.pluginByTag('validator');
      }

      plugin.dependencies.add(plugin.config.validator!);
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
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
