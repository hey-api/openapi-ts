import { definePluginConfig } from '../../shared/utils/config';
import { angularResourcePluginHandler } from './plugin';
import type { HeyApiAngularResourcePlugin } from './types';

export const defaultConfig: HeyApiAngularResourcePlugin['Config'] = {
  config: {
    asClass: false,
  },
  dependencies: [
    '@hey-api/client-angular',
    '@hey-api/sdk',
    '@hey-api/typescript',
  ],
  handler: angularResourcePluginHandler,
  name: '@hey-api/angular-resource',
  output: '@hey-api/angular-resource',
};

/**
 * Type helper for `@hey-api/angular-resource` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
