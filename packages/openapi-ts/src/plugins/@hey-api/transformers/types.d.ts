import type { Plugin } from '../../types';

export interface Config extends Plugin.Name<'@hey-api/transformers'> {
  /**
   * Convert long integers into BigInt values?
   *
   * @default true
   */
  bigInt?: boolean;
  /**
   * Convert date strings into Date objects?
   *
   * @default true
   */
  dates?: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'transformers'
   */
  output?: string;
}
