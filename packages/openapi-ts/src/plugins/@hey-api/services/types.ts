import type { PluginHandler, PluginLegacyHandler } from '../../types';

interface Config {
  /**
   * Generate Hey API services from the provided input.
   */
  name: '@hey-api/services';
  /**
   * Name of the generated file.
   * @default 'services'
   */
  output?: string;
}

export interface PluginConfig extends Config {
  handler: PluginHandler<Config>;
  handlerLegacy: PluginLegacyHandler<Config>;
}

export interface UserConfig extends Omit<Config, 'output'> {}
