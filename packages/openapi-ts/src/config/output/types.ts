import type {
  BaseOutput,
  BaseUserOutput,
  UserPostProcessor,
} from '@hey-api/shared';
import type { AnyString } from '@hey-api/types';
import type ts from 'typescript';

import type { Formatters, Linters, PostProcessorPreset } from './postprocess';

type ImportFileExtensions = '.js' | '.ts';

export type UserOutput = BaseUserOutput & {
  /**
   * Which formatter to use to process output folder?
   *
   * @default null
   * @deprecated Use `postProcess` instead.
   */
  format?: Formatters | null;
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
   * Which linter to use to process output folder?
   *
   * @default null
   * @deprecated Use `postProcess` instead.
   */
  lint?: Linters | null;
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
  /**
   * Relative or absolute path to the tsconfig file we should use to
   * generate the output. If a path to tsconfig file is not provided, we
   * attempt to find one starting from the location of the
   * `@hey-api/openapi-ts` configuration file and traversing up.
   *
   * @default undefined
   */
  tsConfigPath?: AnyString | null;
};

export type Output = BaseOutput & {
  /**
   * Which formatter to use to process output folder?
   */
  format: Formatters | null;
  /**
   * If specified, this will be the file extension used when importing
   * other modules. By default, we don't add a file extension and let the
   * runtime resolve it. If you're using moduleResolution `nodenext` or
   * `node16`, we default to `.js`.
   */
  importFileExtension: ImportFileExtensions | AnyString | null | undefined;
  /**
   * Which linter to use to process output folder?
   */
  lint: Linters | null;
  /**
   * Whether `export * from 'module'` should be used when possible
   * instead of named exports.
   */
  preferExportAll: boolean;
  /**
   * The parsed TypeScript configuration used to generate the output.
   * If no `tsconfig` file path was provided or found, this will be `null`.
   */
  tsConfig: ts.ParsedCommandLine | null;
  /**
   * Relative or absolute path to the tsconfig file we should use to
   * generate the output. If a path to tsconfig file is not provided, we
   * attempt to find one starting from the location of the
   * `@hey-api/openapi-ts` configuration file and traversing up.
   */
  tsConfigPath: AnyString | null | undefined;
};
