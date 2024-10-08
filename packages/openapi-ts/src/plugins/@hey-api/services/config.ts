import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler: () => {},
  handler_experimental: () => {},
  name: '@hey-api/services',
  output: 'services',
};
