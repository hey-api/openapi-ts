import type { PluginHandler, PluginLegacyHandler } from '../../types';

interface Config {
  /**
   * Generate Hey API transformers from the provided input.
   */
  name: '@hey-api/transformers';
  /**
   * Name of the generated file.
   * @default 'transformers'
   */
  output?: string;
}

export interface PluginConfig extends Config {
  handler: PluginHandler<Config>;
  handlerLegacy: PluginLegacyHandler<Config>;
}

export interface UserConfig extends Omit<Config, 'output'> {}
