import { handler } from '../query-core/plugin';
import { handlerLegacy } from '../query-core/plugin-legacy';
import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler,
  handlerLegacy,
  infiniteQueryOptions: true,
  mutationOptions: true,
  name: '@tanstack/react-query',
  output: '@tanstack/react-query',
  queryOptions: true,
};
