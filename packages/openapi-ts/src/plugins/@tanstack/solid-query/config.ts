import { handler } from '../query-core/plugin';
import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler,
  infiniteQueryOptions: true,
  mutationOptions: true,
  name: '@tanstack/solid-query',
  output: '@tanstack/solid-query',
  queryOptions: true,
};
