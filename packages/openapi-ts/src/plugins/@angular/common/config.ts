import { definePluginConfig } from '@hey-api/shared';

import { resolveHttpRequests } from './httpRequests';
import { resolveHttpResources } from './httpResources';
import { handler } from './plugin';
import type { AngularCommonPlugin } from './types';

export const defaultConfig: AngularCommonPlugin['Config'] = {
  config: {
    exportFromIndex: false,
  },
  dependencies: ['@hey-api/client-angular', '@hey-api/sdk'],
  handler,
  name: '@angular/common',
  resolveConfig: (plugin, context) => {
    plugin.config.httpRequests = resolveHttpRequests(plugin.config, context);
    plugin.config.httpResources = resolveHttpResources(plugin.config, context);
  },
};

/**
 * Type helper for `@angular/common` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
