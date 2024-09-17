import type { PluginDefinition } from '../../types';

export interface PluginConfig extends PluginDefinition {
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

export interface UserConfig extends Pick<PluginConfig, 'output'> {}
