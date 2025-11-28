import type ts from 'typescript';

import type { StringCase, StringName } from './case';

export type Formatters = 'biome' | 'prettier';

export type Linters = 'biome' | 'eslint' | 'oxlint';

type ImportFileExtensions = '.js' | '.ts';

export type UserOutput = {
  /**
   * Defines casing of the output fields. By default, we preserve `input`
   * values as data transforms incur a performance penalty at runtime.
   *
   * @default undefined
   */
  case?: StringCase;
  /**
   * Clean the `output` folder on every run? If disabled, this folder may
   * be used to store additional files. The default option is `true` to
   * reduce the risk of keeping outdated files around when configuration,
   * input, or package version changes.
   *
   * @default true
   */
  clean?: boolean;
  /**
   * Optional function to transform file names before they are used.
   *
   * @param name The original file name.
   * @returns The transformed file name.
   * @default '{{name}}'
   */
  fileName?:
    | StringName
    | {
        /**
         * The casing convention to use for generated file names.
         *
         * @default 'preserve'
         */
        case?: StringCase;
        /**
         * Custom naming pattern for generated file names.
         *
         * @default '{{name}}'
         */
        name?: StringName;
        /**
         * Suffix to append to file names (before the extension). For example,
         * with a suffix of `.gen`, `example.ts` becomes `example.gen.ts`.
         *
         * @default '.gen'
         * @example
         * // Given a suffix of `.gen`
         * 'index.ts' -> 'index.ts' (index files are not renamed)
         * 'user.ts' -> 'user.gen.ts'
         * 'order.gen.ts' -> 'order.gen.ts' (files already containing the suffix are not renamed)
         */
        suffix?: string | null;
      };
  /**
   * Which formatter to use to process output folder?
   *
   * @default null
   */
  format?: Formatters | null;
  /**
   * If specified, this will be the file extension used when importing
   * other modules. By default, we don't add a file extension and let the
   * runtime resolve it. If you're using moduleResolution `nodenext`, we
   * default to `.js`.
   *
   * @default undefined
   */
  importFileExtension?: ImportFileExtensions | (string & {}) | null;
  /**
   * Should the exports from plugin files be re-exported in the index
   * barrel file? By default, this is enabled and only default plugins
   * are re-exported.
   *
   * @default true
   */
  indexFile?: boolean;
  /**
   * Which linter to use to process output folder?
   *
   * @default null
   */
  lint?: Linters | null;
  /**
   * The absolute path to the output folder.
   */
  path: string;
  /**
   * Whether `export * from 'module'` should be used when possible
   * instead of named exports.
   *
   * @default false
   */
  preferExportAll?: boolean;
  /**
   * Optional function to transform module specifiers.
   *
   * @default undefined
   */
  resolveModuleName?: (moduleName: string) => string | undefined;
  /**
   * Relative or absolute path to the tsconfig file we should use to
   * generate the output. If a path to tsconfig file is not provided, we
   * attempt to find one starting from the location of the
   * `@hey-api/openapi-ts` configuration file and traversing up.
   *
   * @default undefined
   */
  tsConfigPath?: (string & {}) | null;
};

export type Output = {
  /**
   * Defines casing of the output fields. By default, we preserve `input`
   * values as data transforms incur a performance penalty at runtime.
   */
  case: StringCase | undefined;
  /**
   * Clean the `output` folder on every run? If disabled, this folder may
   * be used to store additional files. The default option is `true` to
   * reduce the risk of keeping outdated files around when configuration,
   * input, or package version changes.
   */
  clean: boolean;
  /**
   * Optional function to transform file names before they are used.
   *
   * @param name The original file name.
   * @returns The transformed file name.
   */
  fileName: {
    /**
     * The casing convention to use for generated file names.
     */
    case: StringCase;
    /**
     * Custom naming pattern for generated file names.
     */
    name: StringName;
    /**
     * Suffix to append to file names (before the extension). For example,
     * with a suffix of `.gen`, `example.ts` becomes `example.gen.ts`.
     *
     * @example
     * // Given a suffix of `.gen`
     * 'index.ts' -> 'index.ts' (index files are not renamed)
     * 'user.ts' -> 'user.gen.ts'
     * 'order.gen.ts' -> 'order.gen.ts' (files already containing the suffix are not renamed)
     */
    suffix: string | null;
  };
  /**
   * Which formatter to use to process output folder?
   */
  format: Formatters | null;
  /**
   * If specified, this will be the file extension used when importing
   * other modules. By default, we don't add a file extension and let the
   * runtime resolve it. If you're using moduleResolution `nodenext`, we
   * default to `.js`.
   */
  importFileExtension: ImportFileExtensions | (string & {}) | null | undefined;
  /**
   * Should the exports from plugin files be re-exported in the index
   * barrel file? By default, this is enabled and only default plugins
   * are re-exported.
   */
  indexFile: boolean;
  /**
   * Which linter to use to process output folder?
   */
  lint: Linters | null;
  /**
   * The absolute path to the output folder.
   */
  path: string;
  /**
   * Whether `export * from 'module'` should be used when possible
   * instead of named exports.
   */
  preferExportAll: boolean;
  /**
   * Optional function to transform module specifiers.
   */
  resolveModuleName: ((moduleName: string) => string | undefined) | undefined;
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
  tsConfigPath: (string & {}) | null | undefined;
};
