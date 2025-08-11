import { definePluginConfig } from '../../shared/utils/config';
import { handler } from './plugin';
import type { HeyApiAngularCommonPlugin } from './types';

export const defaultConfig: HeyApiAngularCommonPlugin['Config'] = {
  config: {},
  dependencies: ['@hey-api/client-angular', '@hey-api/sdk'],
  handler,
  name: '@angular/common',
  output: '@angular/common',
  resolveConfig(plugin) {
    plugin.config.httpResource = {
      asClass: false,
      classNameBuilder(className) {
        return className + 'Resources';
      },
      enabled: false,
      methodNameBuilder(operation) {
        if (plugin.config.httpResource?.asClass) {
          return String(operation.id);
        }

        return String(operation.id) + 'Resource';
      },
      ...plugin.config.httpResource,
    };

    plugin.config.httpRequest = {
      asClass: false,
      classNameBuilder(className) {
        return className + 'Requests';
      },
      methodNameBuilder(operation) {
        if (plugin.config.httpRequest?.asClass) {
          return String(operation.id);
        }

        return String(operation.id) + 'Request';
      },
      ...plugin.config.httpRequest,
    };
  },
};

/**
 * Type helper for `@angular/common` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
