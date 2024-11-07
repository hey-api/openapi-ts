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

export interface ClientConfig {
  /**
   * Manually set base in OpenAPI config instead of inferring from server value
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
   * @default false
   */
  debug?: boolean;
  /**
   * Skip writing files to disk?
   * @default false
   */
  dryRun?: boolean;
  /**
   * Opt-in to the experimental parser?
   * @default false
   */
  experimentalParser?: boolean;
  /**
   * Generate core client classes?
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
         * Process only parts matching the regular expression. You can select both
         * operations and components by reference within the bundled input.
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
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-name
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
         * Process output folder with formatter?
         * @default false
         */
        format?: 'biome' | 'prettier' | false;
        /**
         * Process output folder with linter?
         * @default false
         */
        lint?: 'biome' | 'eslint' | false;
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
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-request
   * @deprecated
   */
  request?: string;
  /**
   * Use options or arguments functions. Please note this option is deprecated and
   * will be removed in favor of clients.
   * @link https://heyapi.dev/openapi-ts/migrating.html#deprecated-useoptions
   * @deprecated
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
