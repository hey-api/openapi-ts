import { definePluginConfig } from '../../shared/utils/config';
import { Api } from './api';
import { handler } from './plugin';
import { handlerLegacy } from './plugin-legacy';
import type { HeyApiSdkPlugin } from './types';

export const defaultConfig: HeyApiSdkPlugin['Config'] = {
  api: new Api({
    name: '@hey-api/sdk',
  }),
  config: {
    asClass: false,
    auth: true,
    classNameBuilder: '{{name}}',
    classStructure: 'auto',
    client: true,
    exportFromIndex: true,
    instance: false,
    operationId: true,
    params_EXPERIMENTAL: 'default',
    response: 'body',
    responseStyle: 'fields',
    transformer: false,
    validator: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  handlerLegacy,
  name: '@hey-api/sdk',
  resolveConfig: (plugin, context) => {
    if (plugin.config.client) {
      if (typeof plugin.config.client === 'boolean') {
        plugin.config.client = context.pluginByTag('client', {
          defaultPlugin: '@hey-api/client-fetch',
        });
      }

      plugin.dependencies.add(plugin.config.client!);
    } else {
      plugin.config.client = false;
    }

    if (plugin.config.transformer) {
      if (typeof plugin.config.transformer === 'boolean') {
        plugin.config.transformer = context.pluginByTag('transformer');
      }

      plugin.dependencies.add(plugin.config.transformer!);
    } else {
      plugin.config.transformer = false;
    }

    if (typeof plugin.config.validator !== 'object') {
      plugin.config.validator = {
        request: plugin.config.validator,
        response: plugin.config.validator,
      };
    }

    if (plugin.config.validator.request) {
      if (typeof plugin.config.validator.request === 'boolean') {
        plugin.config.validator.request = context.pluginByTag('validator');
      }

      plugin.dependencies.add(plugin.config.validator.request!);
    } else {
      plugin.config.validator.request = false;
    }

    if (plugin.config.validator.response) {
      if (typeof plugin.config.validator.response === 'boolean') {
        plugin.config.validator.response = context.pluginByTag('validator');
      }

      plugin.dependencies.add(plugin.config.validator.response!);
    } else {
      plugin.config.validator.response = false;
    }

    if (plugin.config.instance) {
      if (typeof plugin.config.instance !== 'string') {
        plugin.config.instance = 'Sdk';
      }

      plugin.config.asClass = true;
    } else {
      plugin.config.instance = false;
    }

    // Set default classNameBuilder based on client type
    if (plugin.config.classNameBuilder === '{{name}}') {
      if (plugin.config.client === '@hey-api/client-angular') {
        plugin.config.classNameBuilder = '{{name}}Service';
      }
    }
  },
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
