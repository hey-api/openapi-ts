import type { PluginHandler, PluginHandlerExperimental } from '../../types';

interface Config {
  /**
   * Generate Hey API types from the provided input.
   */
  name: '@hey-api/types';
  /**
   * Name of the generated file.
   * @default 'types'
   */
  output?: string;
}

export interface PluginConfig extends Config {
  handler: PluginHandler<Config>;
  handler_experimental?: PluginHandlerExperimental<Config>;
}

export interface UserConfig extends Omit<Config, 'output'> {}
