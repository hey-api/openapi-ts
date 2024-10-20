import type { PluginHandler, PluginLegacyHandler } from '../types';

interface Config {
  /**
   * Generate Zod output from the provided input.
   */
  name: 'zod';
  /**
   * Name of the generated file.
   * @default 'zod'
   */
  output?: string;
}

export interface PluginConfig extends Config {
  handler: PluginHandler<Config>;
  handlerLegacy: PluginLegacyHandler<Config>;
}

export interface UserConfig extends Omit<Config, 'output'> {}
