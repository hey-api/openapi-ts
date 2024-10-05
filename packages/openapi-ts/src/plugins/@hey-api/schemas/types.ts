import type { PluginHandler } from '../../types';

interface Config {
  /**
   * Generate Hey API schemas from the provided input.
   */
  name: '@hey-api/schemas';
  /**
   * Name of the generated file.
   * @default 'schemas'
   */
  output?: string;
}

export interface PluginConfig extends Config {
  handler: PluginHandler<Config>;
}

export interface UserConfig extends Omit<Config, 'output'> {}
