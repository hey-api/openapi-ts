import type { DefinePlugin, Plugin } from '../../types';
import type { ExpressionTransformer } from './expressions';

export type Config = Plugin.Name<'@hey-api/transformers'> & {
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
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'transformers'
   */
  output?: string;
  /**
   * Custom transforms to apply to the generated code.
   */
  transformers?: ReadonlyArray<ExpressionTransformer>;
};

export type HeyApiTransformersPlugin = DefinePlugin<Config>;
