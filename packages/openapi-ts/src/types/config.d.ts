import type { PluginConfigMap } from '../plugins/config';
import type { Plugin, PluginNames } from '../plugins/types';
import type { StringCase } from './case';
import type { Input, Watch } from './input';

export type Formatters = 'biome' | 'prettier';

export type Linters = 'biome' | 'eslint' | 'oxlint';

export interface UserConfig {
  /**
   * Path to the config file. Set this value if you don't use the default
   * config file name, or it's not located in the project root.
   */
  configFile?: string;
  /**
   * Skip writing files to disk?
   *
   * @default false
   */
  dryRun?: boolean;
  /**
   * Path to the OpenAPI specification. This can be either local or remote path.
   * Both JSON and YAML file formats are supported. You can also pass the parsed
   * object directly if you're fetching the file yourself.
   *
   * Alternatively, you can define a configuration object with more options.
   */
  input:
    | 'https://get.heyapi.dev/<organization>/<project>'
    | (string & {})
    | (Record<string, unknown> & { path?: never })
    | Input;
  /**
   * The relative location of the logs folder
   *
   * @default process.cwd()
   */
  logs?:
    | string
    | {
        /**
         * Whether or not error logs should be written to a file or not
         *
         * @default true
         * */
        file?: boolean;
        /**
         * The logging level to control the verbosity of log output.
         * Determines which messages are logged based on their severity.
         *
         * Available levels (in increasing order of severity):
         * - `trace`: Detailed debug information, primarily for development.
         * - `debug`: Diagnostic information useful during debugging.
         * - `info`: General operational messages that indicate normal application behavior.
         * - `warn`: Potentially problematic situations that require attention.
         * - `error`: Errors that prevent some functionality but do not crash the application.
         * - `fatal`: Critical errors that cause the application to terminate.
         * - `silent`: Disables all logging.
         *
         * Messages with a severity equal to or higher than the specified level will be logged.
         *
         * @default 'info'
         */
        level?:
          | 'debug'
          | 'error'
          | 'fatal'
          | 'info'
          | 'silent'
          | 'trace'
          | 'warn';

        /**
         * The relative location of the logs folder
         *
         * @default process.cwd()
         */
        path?: string;
      };
  /**
   * The relative location of the output folder
   */
  output:
    | string
    | {
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
         * The relative location of the output folder
         */
        path: string;
        /**
         * Relative or absolute path to the tsconfig file we should use to
         * generate the output. If a path to tsconfig file is not provided, we
         * attempt to find one starting from the location of the
         * `@hey-api/openapi-ts` configuration file and traversing up.
         */
        tsConfigPath?: 'off' | (string & {});
      };
  /**
   * Plugins generate artifacts from `input`. By default, we generate SDK
   * functions and TypeScript interfaces. If you manually define `plugins`,
   * you need to include the default plugins if you wish to use them.
   *
   * @default ['@hey-api/typescript', '@hey-api/sdk']
   */
  plugins?: ReadonlyArray<
    | PluginNames
    | {
        [K in PluginNames]: Plugin.UserConfig<PluginConfigMap[K]['config']> & {
          name: K;
        };
      }[PluginNames]
  >;

  // DEPRECATED OPTIONS BELOW

  /**
   * Manually set base in OpenAPI config instead of inferring from server value
   *
   * @deprecated
   */
  // eslint-disable-next-line typescript-sort-keys/interface
  base?: string;
  /**
   * Opt in to the experimental parser?
   *
   * @deprecated
   * @default true
   */
  experimentalParser?: boolean;
  /**
   * Generate core client classes?
   *
   * @deprecated
   * @default true
   */
  exportCore?: boolean;
  /**
   * Custom client class name. Please note this option is deprecated and
   * will be removed in favor of clients.
   *
   * @deprecated
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-name
   */
  name?: string;
  /**
   * Path to custom request file. Please note this option is deprecated and
   * will be removed in favor of clients.
   *
   * @deprecated
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-request
   */
  request?: string;
  /**
   * Use options or arguments functions. Please note this option is deprecated and
   * will be removed in favor of clients.
   *
   * @deprecated
   * @default true
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-useoptions
   */
  useOptions?: boolean;
  /**
   * @deprecated use `input.watch` instead
   */
  watch?: boolean | number | Watch;
}

export type Config = Omit<
  Required<UserConfig>,
  | 'base'
  | 'input'
  | 'logs'
  | 'name'
  | 'output'
  | 'plugins'
  | 'request'
  | 'watch'
> &
  Pick<UserConfig, 'base' | 'name' | 'request'> & {
    input: Omit<Input, 'path' | 'validate_EXPERIMENTAL' | 'watch'> &
      Pick<Required<Input>, 'path' | 'validate_EXPERIMENTAL'> & {
        watch: Extract<Required<Required<Input>['watch']>, object>;
      };
    logs: Extract<Required<UserConfig['logs']>, object>;
    output: Extract<UserConfig['output'], object>;
    pluginOrder: ReadonlyArray<keyof PluginConfigMap>;
    plugins: {
      [K in PluginNames]?: Plugin.ConfigWithName<PluginConfigMap[K]>;
    };
  };
