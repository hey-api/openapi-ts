import { handlerLegacy } from './plugin';
import type { PluginConfig } from './types';

export const defaultConfig: Required<PluginConfig> = {
  handler: () => {},
  handlerLegacy,
  name: 'zod',
  output: 'zod',
};
