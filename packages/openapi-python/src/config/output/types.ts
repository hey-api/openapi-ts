import type { BaseOutput, BaseUserOutput, UserPostProcessor } from '@hey-api/shared';

import type { PostProcessorPreset } from './postprocess';

export type UserOutput = BaseUserOutput<'.py'> & {
  /**
   * Post-processing commands to run on the output folder, executed in order.
   *
   * Use preset strings for common tools, or provide custom configurations.
   *
   * @example ['ruff:lint', 'ruff:format']
   * @example [{ command: 'flake8', args: ['{{path}}'] }]
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

export type Output = BaseOutput<'.py'> & {
  /**
   * Whether `export * from 'module'` should be used when possible
   * instead of named exports.
   */
  preferExportAll: boolean;
};
