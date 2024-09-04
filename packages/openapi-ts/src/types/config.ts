import type { Operation } from '../openApi';
import type { OpenApiSchema as OpenApiV2Schema } from '../openApi/v2/interfaces/OpenApiSchema';
import type { OpenApiSchema as OpenApiV3Schema } from '../openApi/v3/interfaces/OpenApiSchema';
import type { Plugins } from '../plugins/';
import type { ExtractArrayOfObjects } from './utils';

type Client =
  | '@hey-api/client-axios'
  | '@hey-api/client-fetch'
  | 'legacy/angular'
  | 'legacy/axios'
  | 'legacy/fetch'
  | 'legacy/node'
  | 'legacy/xhr'
  | '';

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
    | {
        /**
         * Bundle the client module? Set this to true if you're using a standalone
         * client package and don't want to declare it as a separate dependency.
         * When true, the client module will be generated from the standalone
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
   * Use the experimental parser?
   * @default false
   */
  experimental_parser?: boolean;
  /**
   * Generate core client classes?
   * @default true
   */
  exportCore?: boolean;
  /**
   * The relative location of the OpenAPI spec
   */
  input: string | Record<string, unknown>;
  /**
   * Custom client class name
   * @deprecated
   */
  name?: string;
  /**
   * The relative location of the output directory
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
         * The relative location of the output directory
         */
        path: string;
      };
  /**
   * Plugins are used to generate additional output files from provided input.
   */
  plugins?: ReadonlyArray<Plugins['name'] | Plugins>;
  /**
   * Path to custom request file
   * @deprecated
   */
  request?: string;
  /**
   * Generate JSON schemas?
   * @default true
   */
  schemas?:
    | boolean
    | {
        /**
         * Generate JSON schemas?
         * @default true
         */
        export?: boolean;
        /**
         * Customise the schema name. By default, `{{name}}Schema` is used. `name` is a
         * valid JavaScript/TypeScript identifier, e.g. if your schema name is
         * "Foo-Bar", `name` value would be "FooBar".
         */
        name?: (
          name: string,
          schema: OpenApiV2Schema | OpenApiV3Schema,
        ) => string;
        /**
         * Choose schema type to generate. Select 'form' if you don't want
         * descriptions to reduce bundle size and you plan to use schemas
         * for form validation
         * @default 'json'
         */
        type?: 'form' | 'json';
      };
  /**
   * Generate services?
   * @default true
   */
  services?:
    | boolean
    | string
    | {
        /**
         * Group operation methods into service classes? When enabled, you can
         * select which classes to export with `services.include` and/or
         * transform their names with `services.name`.
         *
         * Note that by enabling this option, your services will **NOT**
         * support {@link https://developer.mozilla.org/docs/Glossary/Tree_shaking tree-shaking}.
         * For this reason, it is disabled by default.
         * @default false
         */
        asClass?: boolean;
        /**
         * Generate services?
         * @default true
         */
        export?: boolean;
        /**
         * Filter endpoints to be included in the generated services.
         * The provided string should be a regular expression where matched
         * results will be included in the output. The input pattern this
         * string will be tested against is `{method} {path}`. For example,
         * you can match `POST /api/v1/foo` with `^POST /api/v1/foo$`.
         */
        filter?: string;
        /**
         * Include only service classes with names matching regular expression
         *
         * This option has no effect if `services.asClass` is `false`.
         */
        include?: string;
        /**
         * Customise the name of methods within the service. By default, {@link Operation.name} is used.
         */
        methodNameBuilder?: (operation: Operation) => string;
        /**
         * Customize the generated service class names. The name variable is
         * obtained from your OpenAPI specification tags.
         *
         * This option has no effect if `services.asClass` is `false`.
         * @default '{{name}}Service'
         */
        name?: string;
        /**
         * Use operation ID to generate operation names?
         * @default true
         */
        operationId?: boolean;
        /**
         * Define shape of returned value from service calls
         * @default 'body'
         * @deprecated
         */
        response?: 'body' | 'response';
      };
  /**
   * Generate types?
   * @default true
   */
  types?:
    | boolean
    | string
    | {
        /**
         * Output Date type and possibly runtime transform instead of string for format "date-time"
         * @default false
         */
        dates?: boolean | 'types+transform' | 'types';
        /**
         * Generate enum definitions?
         * @default false
         */
        enums?: 'javascript' | 'typescript' | 'typescript+namespace' | false;
        /**
         * Generate types?
         * @default true
         */
        export?: boolean;
        /**
         * Include only types matching regular expression
         */
        include?: string;
        /**
         * Use your preferred naming pattern
         * @default 'preserve'
         */
        name?: 'PascalCase' | 'preserve';
        /**
         * Generate a tree of types containing all operations? It will be named
         * $OpenApiTs and is generated by default only when not using services.
         */
        tree?: boolean;
      };
  /**
   * Use options or arguments functions
   * @deprecated
   * @default true
   */
  useOptions?: boolean;
}

export interface UserConfig extends ClientConfig {}

export type Config = Omit<
  Required<ClientConfig>,
  | 'base'
  | 'client'
  | 'name'
  | 'output'
  | 'plugins'
  | 'request'
  | 'schemas'
  | 'services'
  | 'types'
> &
  Pick<ClientConfig, 'base' | 'name' | 'request'> & {
    client: Extract<Required<ClientConfig>['client'], object>;
    output: Extract<Required<ClientConfig>['output'], object>;
    plugins: ExtractArrayOfObjects<
      Required<ClientConfig>['plugins'],
      { name: string }
    >;
    schemas: Extract<Required<ClientConfig>['schemas'], object>;
    services: Extract<Required<ClientConfig>['services'], object>;
    types: Extract<Required<ClientConfig>['types'], object>;
  };
