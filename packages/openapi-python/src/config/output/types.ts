import type {
  BaseOutput,
  BaseUserOutput,
  UserPostProcessor,
} from '@hey-api/shared';
import type { AnyString } from '@hey-api/types';

import type { PostProcessorPreset } from './postprocess';

type ImportFileExtensions = '.py';

export type UserOutput = BaseUserOutput & {
  /**
   * If specified, this will be the file extension used when importing
   * other modules. By default, we don't add a file extension and let the
   * runtime resolve it. If you're using moduleResolution `nodenext` or
   * `node16`, we default to `.js`.
   *
   * @default undefined
   */
  importFileExtension?: ImportFileExtensions | AnyString | null;
  /**
   * Post-processing commands to run on the output folder, executed in order.
   *
   * Use preset strings for common tools, or provide custom configurations.
   *
   * @example ['biome:lint', 'prettier']
   * @example [{ command: 'dprint', args: ['fmt', '{{path}}'] }]
   * @example ['eslint', { command: 'prettier', args: ['{{path}}', '--write'] }]
   *
   * @default []
   */
  postProcess?: ReadonlyArray<PostProcessorPreset | UserPostProcessor>;
  /**
   * Whether `export * from 'module'` should be used when possible
   * instead of named exports.
   *
   * @default false
   */
  preferExportAll?: boolean;
};

export type Output = BaseOutput & {
  /**
   * If specified, this will be the file extension used when importing
   * other modules. By default, we don't add a file extension and let the
   * runtime resolve it. If you're using moduleResolution `nodenext` or
   * `node16`, we default to `.js`.
   */
  importFileExtension: ImportFileExtensions | AnyString | null | undefined;
  /**
   * Whether `export * from 'module'` should be used when possible
   * instead of named exports.
   */
  preferExportAll: boolean;
};
