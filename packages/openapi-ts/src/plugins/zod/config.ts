import { handler } from './plugin';
import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler,
  handler_experimental: () => {},
  name: 'zod',
  output: 'zod',
};
