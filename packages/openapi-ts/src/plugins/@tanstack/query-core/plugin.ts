import type { PluginHandler } from './types';
import { handlerV5 } from './v5/plugin';

export const handler: PluginHandler = (args) =>
  handlerV5(args as Parameters<PluginHandler>[0]);
