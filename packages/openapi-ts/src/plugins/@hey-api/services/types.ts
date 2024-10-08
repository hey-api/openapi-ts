import type { PluginHandler, PluginHandlerExperimental } from '../../types';

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
  handler_experimental?: PluginHandlerExperimental<Config>;
}

export interface UserConfig extends Omit<Config, 'output'> {}
