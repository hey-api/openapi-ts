import { definePluginConfig } from '~/plugins/shared/utils/config';
import type { PluginValidatorNames } from '~/plugins/types';

import { Api } from './api';
import { handler } from './plugin';
import type { HeyApiSdkPlugin } from './types';

export const defaultConfig: HeyApiSdkPlugin['Config'] = {
  api: new Api(),
  config: {
    asClass: false,
    auth: true,
    classNameBuilder: '{{name}}',
    classStructure: 'auto',
    client: true,
    exportFromIndex: true,
    instance: false,
    operationId: true,
    paramsStructure: 'grouped',
    response: 'body',
    responseStyle: 'fields',
    transformer: false,
    validator: false,
  },
  dependencies: ['@hey-api/typescript'],
  handler,
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

    const { validator } = plugin.config;
    plugin.config.validator = ((operation) => {
      if (typeof validator === 'boolean') {
        const validatorPlugin = validator
          ? context.pluginByTag('validator')
          : undefined;
        const validatorValue = validatorPlugin
          ? (validatorPlugin as PluginValidatorNames)
          : false;
        return {
          request: validatorValue,
          response: validatorValue,
        };
      }

      if (typeof validator === 'string') {
        return {
          request: validator,
          response: validator,
        };
      }

      if (typeof validator === 'function') {
        const result = validator(operation);
        if (typeof result === 'object') {
          // result.request
        }
      }

      return {
        request: false,
        response: false,
      };
    }) satisfies HeyApiSdkPlugin['Types']['resolvedConfig']['validator'];

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
  tags: ['sdk'],
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
