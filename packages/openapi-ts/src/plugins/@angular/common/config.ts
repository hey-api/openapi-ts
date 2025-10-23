import { definePluginConfig } from '~/plugins/shared/utils/config';

import { Api } from './api';
import { handler } from './plugin';
import type { AngularCommonPlugin } from './types';

export const defaultConfig: AngularCommonPlugin['Config'] = {
  api: new Api({
    name: '@angular/common',
  }),
  config: {
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/client-angular', '@hey-api/sdk'],
  handler,
  name: '@angular/common',
  output: '@angular/common',
  resolveConfig: (plugin, context) => {
    plugin.config.httpRequests = context.valueToObject({
      defaultValue: {
        asClass: false,
        classNameBuilder: '{{name}}Requests',
        enabled: true,
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
      },
      value: plugin.config.httpRequests,
    });

    if (!plugin.config.httpRequests.methodNameBuilder) {
      const { asClass } = plugin.config.httpRequests;
      plugin.config.httpRequests.methodNameBuilder = (operation) =>
        asClass ? String(operation.id) : `${String(operation.id)}Request`;
    }

    plugin.config.httpResources = context.valueToObject({
      defaultValue: {
        asClass: false,
        classNameBuilder: '{{name}}Resources',
        enabled: true,
      },
      mappers: {
        boolean: (enabled) => ({ enabled }),
      },
      value: plugin.config.httpResources,
    });

    if (!plugin.config.httpResources.methodNameBuilder) {
      const { asClass } = plugin.config.httpResources;
      plugin.config.httpResources.methodNameBuilder = (operation) =>
        asClass ? String(operation.id) : `${String(operation.id)}Resource`;
    }
  },
};

/**
 * Type helper for `@angular/common` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
