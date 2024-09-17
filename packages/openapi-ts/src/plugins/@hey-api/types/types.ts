import type { PluginDefinition } from '../../types';

export interface PluginConfig extends PluginDefinition {
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

export interface UserConfig extends Pick<PluginConfig, 'output'> {}
