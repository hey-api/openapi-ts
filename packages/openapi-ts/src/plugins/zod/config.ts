import { handler } from './plugin';
import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler,
  name: 'zod',
  output: 'zod',
};
