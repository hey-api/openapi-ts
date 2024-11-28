import type { ClientPlugins, UserPlugins } from '../plugins/';
import type {
  ArrayOfObjectsToObjectMap,
  ExtractArrayOfObjects,
  ExtractWithDiscriminator,
} from './utils';

export const CLIENTS = [
  '@hey-api/client-axios',
  '@hey-api/client-fetch',
  'legacy/angular',
  'legacy/axios',
  'legacy/fetch',
  'legacy/node',
  'legacy/xhr',
] as const;

type Client = (typeof CLIENTS)[number];

export type Formatters = 'biome' | 'prettier';

export type Linters = 'biome' | 'eslint' | 'oxlint';

export type StringCase =
  | 'camelCase'
  | 'PascalCase'
  | 'preserve'
  | 'snake_case'
  | 'SCREAMING_SNAKE_CASE';

export interface ClientConfig {
  /**
   * Manually set base in OpenAPI config instead of inferring from server value
   *
   * @deprecated
   */
  base?: string;
  /**
   * HTTP client to generate
   */
  client?:
    | Client
    | false
    | {
        /**
         * Bundle the client module? Set this to true if you're using a client
         * package and don't want to declare it as a separate dependency.
         * When true, the client module will be generated from the client
         * package and bundled with the rest of the generated output. This is
         * useful if you're repackaging the output, publishing it to other users,
         * and you don't want them to install any dependencies.
         *
         * @default false
         */
        bundle?: boolean;
        /**
         * HTTP client to generate
         */
        name: Client;
      };
  /**
   * Path to the config file. Set this value if you don't use the default
   * config file name, or it's not located in the project root.
   */
  configFile?: string;
  /**
   * Run in debug mode?
   *
   * @default false
   */
  debug?: boolean;
  /**
   * Skip writing files to disk?
   *
   * @default false
   */
  dryRun?: boolean;
  /**
   * Opt in to the experimental parser?
   *
   * @default false
   */
  experimentalParser?: boolean;
  /**
   * Generate core client classes?
   *
   * @default true
   */
  exportCore?: boolean;
  /**
   * Path to the OpenAPI specification. This can be either local or remote path.
   * Both JSON and YAML file formats are supported. You can also pass the parsed
   * object directly if you're fetching the file yourself.
   *
   * Alternatively, you can define a configuration object with more options.
   */
  input:
    | string
    | Record<string, unknown>
    | {
        /**
         * **This feature works only with the experimental parser**
         *
         * Prevent parts matching the regular expression from being processed.
         * You can select both operations and components by reference within
         * the bundled input. In case of conflicts, `exclude` takes precedence
         * over `include`.
         *
         * @example
         * operation: '^#/paths/api/v1/foo/get$'
         * schema: '^#/components/schemas/Foo$'
         */
        exclude?: string;
        /**
         * **This feature works only with the experimental parser**

         * Process only parts matching the regular expression. You can select both
         * operations and components by reference within the bundled input. In
         * case of conflicts, `exclude` takes precedence over `include`.
         *
         * @example
         * operation: '^#/paths/api/v1/foo/get$'
         * schema: '^#/components/schemas/Foo$'
         */
        include?: string;
        /**
         * Path to the OpenAPI specification. This can be either local or remote path.
         * Both JSON and YAML file formats are supported. You can also pass the parsed
         * object directly if you're fetching the file yourself.
         */
        path: string | Record<string, unknown>;
      };
  /**
   * Custom client class name. Please note this option is deprecated and
   * will be removed in favor of clients.
   *
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-name
   *
   * @deprecated
   */
  name?: string;
  /**
   * The relative location of the output folder
   */
  output:
    | string
    | {
        /**
         * **This feature works only with the experimental parser**
         *
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
         * Process output folder with linter?
         *
         * @default false
         */
        lint?: Linters | false;
        /**
         * The relative location of the output folder
         */
        path: string;
      };
  /**
   * Plugins are used to generate artifacts from provided input.
   */
  plugins?: ReadonlyArray<UserPlugins['name'] | UserPlugins>;
  /**
   * Path to custom request file. Please note this option is deprecated and
   * will be removed in favor of clients.
   *
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-request
   *
   * @deprecated
   */
  request?: string;
  /**
   * Use options or arguments functions. Please note this option is deprecated and
   * will be removed in favor of clients.
   *
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-useoptions
   *
   * @deprecated
   *
   * @default true
   */
  useOptions?: boolean;
}

export interface UserConfig extends ClientConfig {}

export type Config = Omit<
  Required<ClientConfig>,
  'base' | 'client' | 'input' | 'name' | 'output' | 'plugins' | 'request'
> &
  Pick<ClientConfig, 'base' | 'name' | 'request'> & {
    client: Extract<Required<ClientConfig>['client'], object>;
    input: ExtractWithDiscriminator<ClientConfig['input'], { path: unknown }>;
    output: Extract<ClientConfig['output'], object>;
    pluginOrder: ReadonlyArray<ClientPlugins['name']>;
    plugins: ArrayOfObjectsToObjectMap<
      ExtractArrayOfObjects<ReadonlyArray<ClientPlugins>, { name: string }>,
      'name'
    >;
  };
