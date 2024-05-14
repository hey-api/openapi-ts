export interface UserConfig {
  /**
   * Manually set base in OpenAPI config instead of inferring from server value
   * @deprecated
   */
  base?: string;
  /**
   * HTTP client to generate
   * @default 'fetch'
   */
  client?:
    | '@hey-api/client-axios'
    | '@hey-api/client-fetch'
    | 'angular'
    | 'axios'
    | 'fetch'
    | 'node'
    | 'xhr';
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
         * Generate services?
         * @default true
         */
        export?: boolean;
        /**
         * Include only services matching regular expression
         */
        include?: string;
        /**
         * Use your preferred naming pattern
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
         * Output Date instead of string for format "date-time"
         * @default false
         */
        dates?: boolean;
        /**
         * Generate enum definitions?
         * @default false
         */
        enums?: 'javascript' | 'typescript' | false;
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
      };
  /**
   * Use options or arguments functions
   * @deprecated
   * @default true
   */
  useOptions?: boolean;
}

export type Config = Omit<
  Required<UserConfig>,
  'base' | 'name' | 'output' | 'request' | 'schemas' | 'services' | 'types'
> &
  Pick<UserConfig, 'base' | 'name' | 'request'> & {
    output: Extract<Required<UserConfig>['output'], object>;
    schemas: Extract<Required<UserConfig>['schemas'], object>;
    services: Extract<Required<UserConfig>['services'], object>;
    types: Extract<Required<UserConfig>['types'], object>;
  };
