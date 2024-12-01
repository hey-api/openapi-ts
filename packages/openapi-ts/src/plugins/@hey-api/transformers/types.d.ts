import type { Plugin } from '../../types';

export interface Config extends Plugin.Name<'@hey-api/transformers'> {
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
