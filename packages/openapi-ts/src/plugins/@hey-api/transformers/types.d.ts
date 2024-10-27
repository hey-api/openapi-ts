import type { PluginName } from '../../types';

export interface Config extends PluginName<'@hey-api/transformers'> {
  /**
   * Convert date strings into Date objects?
   * @default false
   */
  dates?: boolean;
  /**
   * Name of the generated file.
   * @default 'transformers'
   */
  output?: string;
}
