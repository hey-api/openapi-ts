import { definePluginConfig } from '@hey-api/shared';

// import { resolveExamples } from './examples';
// import { resolveOperations } from './operations';
import { handler } from './plugin';
import type { HeyApiSdkPlugin } from './types';

export const defaultConfig: HeyApiSdkPlugin['Config'] = {
  config: {
    auth: true,
    client: true,
    exportFromIndex: true,
    paramsStructure: 'grouped',
    responseStyle: 'fields',
    transformer: false,
    validator: false,

    // Deprecated - kept for backward compatibility
    // eslint-disable-next-line sort-keys-fix/sort-keys-fix
    response: 'body',
  },
  dependencies: ['@hey-api/typescript'],
  handler,
  name: '@hey-api/sdk',
  resolveConfig: (plugin, context) => {
    if (plugin.config.client) {
      if (typeof plugin.config.client === 'boolean') {
        plugin.config.client = context.pluginByTag('client', {
          defaultPlugin: '@hey-api/client-httpx',
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

    // plugin.config.examples = resolveExamples(plugin.config, context);
    // plugin.config.operations = resolveOperations(plugin.config, context);
  },
};

/**
 * Type helper for `@hey-api/sdk` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
