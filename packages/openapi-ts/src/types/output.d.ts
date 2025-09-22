import type { StringCase, StringName } from './case';

export type Formatters = 'biome' | 'prettier';

export type Linters = 'biome' | 'eslint' | 'oxlint';

export type UserOutput = {
  /**
   * Defines casing of the output fields. By default, we preserve `input`
   * values as data transforms incur a performance penalty at runtime.
   *
   * @default undefined
   */
  case?: Exclude<StringCase, 'SCREAMING_SNAKE_CASE'>;
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
   * Process output folder with formatter?
   *
   * @default false
   */
  format?: Formatters | false;
  /**
   * Should the exports from plugin files be re-exported in the index
   * barrel file? By default, this is enabled and only default plugins
   * are re-exported.
   *
   * @default true
   */
  indexFile?: boolean;
  /**
   * Process output folder with linter?
   *
   * @default false
   */
  lint?: Linters | false;
  /**
   * The absolute path to the output folder.
   */
  path: string;
  /**
   * Relative or absolute path to the tsconfig file we should use to
   * generate the output. If a path to tsconfig file is not provided, we
   * attempt to find one starting from the location of the
   * `@hey-api/openapi-ts` configuration file and traversing up.
   *
   * @default ''
   */
  tsConfigPath?: 'off' | (string & {});
};

export type Output = {
  /**
   * Defines casing of the output fields. By default, we preserve `input`
   * values as data transforms incur a performance penalty at runtime.
   *
   * @default undefined
   */
  case?: Exclude<StringCase, 'SCREAMING_SNAKE_CASE'>;
  /**
   * Clean the `output` folder on every run? If disabled, this folder may
   * be used to store additional files. The default option is `true` to
   * reduce the risk of keeping outdated files around when configuration,
   * input, or package version changes.
   *
   * @default true
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
     *
     * @default 'preserve'
     */
    case: StringCase;
    /**
     * Custom naming pattern for generated file names.
     *
     * @default '{{name}}'
     */
    name: StringName;
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
    suffix: string | null;
  };
  /**
   * Process output folder with formatter?
   *
   * @default false
   */
  format: Formatters | false;
  /**
   * Should the exports from plugin files be re-exported in the index
   * barrel file? By default, this is enabled and only default plugins
   * are re-exported.
   *
   * @default true
   */
  indexFile: boolean;
  /**
   * Process output folder with linter?
   *
   * @default false
   */
  lint: Linters | false;
  /**
   * The absolute path to the output folder.
   */
  path: string;
  /**
   * Relative or absolute path to the tsconfig file we should use to
   * generate the output. If a path to tsconfig file is not provided, we
   * attempt to find one starting from the location of the
   * `@hey-api/openapi-ts` configuration file and traversing up.
   *
   * @default ''
   */
  tsConfigPath: 'off' | (string & {});
};
