import { handler, handler_experimental } from '../query-core/plugin';
import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler,
  handler_experimental,
  infiniteQueryOptions: true,
  mutationOptions: true,
  name: '@tanstack/react-query',
  output: '@tanstack/react-query',
  queryOptions: true,
};
