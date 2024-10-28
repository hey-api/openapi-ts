import type { PluginName } from '../types';

export interface Config extends PluginName<'zod'> {
  /**
   * Name of the generated file.
   * @default 'zod'
   */
  output?: string;
}
