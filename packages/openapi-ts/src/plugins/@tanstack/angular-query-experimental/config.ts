import { definePluginConfig } from '../../shared/utils/config';
import type { Plugin } from '../../types';
import { defaultTanStackQueryConfig } from '../query-core/config';
import { handler } from '../query-core/plugin';
import { handlerLegacy } from '../query-core/plugin-legacy';
import type { Config } from './types';

export const defaultConfig: Plugin.Config<Config> = {
  config: defaultTanStackQueryConfig,
  dependencies: ['@hey-api/sdk', '@hey-api/typescript'],
  handler,
  handlerLegacy,
  name: '@tanstack/angular-query-experimental',
  output: '@tanstack/angular-query-experimental',
};

/**
 * Type helper for `@tanstack/angular-query-experimental` plugin, returns {@link Plugin.Config} object
 */
export const defineConfig = definePluginConfig(defaultConfig);
