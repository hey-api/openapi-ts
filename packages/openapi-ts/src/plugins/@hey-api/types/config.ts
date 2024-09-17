import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler: () => {},
  name: '@hey-api/types',
  output: 'types',
};
