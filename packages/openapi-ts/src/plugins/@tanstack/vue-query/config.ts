import { handler, handlerLegacy } from '../query-core/plugin';
import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler,
  handlerLegacy,
  infiniteQueryOptions: true,
  mutationOptions: true,
  name: '@tanstack/vue-query',
  output: '@tanstack/vue-query',
  queryOptions: true,
};
