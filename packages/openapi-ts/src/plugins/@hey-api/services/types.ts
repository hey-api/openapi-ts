import type { PluginDefinition } from '../../types';

export interface PluginConfig extends PluginDefinition {
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

export interface UserConfig extends Pick<PluginConfig, 'name'> {}
