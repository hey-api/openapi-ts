export interface UserConfig {
  /**
   * Manually set base in OpenAPI config instead of inferring from server value
   */
  base?: string
  /**
   * The selected HTTP client (fetch, xhr, node or axios)
   * @default 'fetch'
   */
  client?: 'angular' | 'axios' | 'fetch' | 'node' | 'xhr'
  /**
   * Run in debug mode?
   * @default false
   */
  debug?: boolean
  /**
   * Skip writing files to disk?
   * @default false
   */
  dryRun?: boolean
  /**
   * Export enum definitions?
   * @default false
   */
  enums?: 'javascript' | 'typescript' | false
  /**
   * Generate core client classes?
   * @default true
   */
  exportCore?: boolean
  /**
   * Generate services?
   * @default true
   */
  exportServices?: boolean | string
  /**
   * Process output folder with formatter?
   * @default true
   */
  format?: boolean
  /**
   * The relative location of the OpenAPI spec
   */
  input: string | Record<string, unknown>
  /**
   * Process output folder with linter?
   * @default false
   */
  lint?: boolean
  /**
   * Custom client class name
   */
  name?: string
  /**
   * Use operation ID to generate operation names?
   * @default true
   */
  operationId?: boolean
  /**
   * The relative location of the output directory
   */
  output: string
  /**
   * Service name postfix
   * @default 'Service'
   */
  postfixServices?: string
  /**
   * Path to custom request file
   */
  request?: string
  /**
   * Export JSON schemas?
   * @default true
   */
  schemas?: boolean
  /**
   * Define shape of returned value from service calls
   * @default 'body'
   */
  serviceResponse?: 'body' | 'response'
  /**
   * Generate types?
   * @default true
   */
  types?:
    | boolean
    | string
    | {
        /**
         * Generate types?
         * @default true
         */
        export?: boolean
        /**
         * Include only types matching regular expression
         */
        include?: string
        /**
         * Use your preferred naming pattern
         * @default 'preserve'
         */
        name?: 'PascalCase' | 'preserve'
      }
  /**
   * Output Date instead of string for the format "date-time" in the models
   * @default false
   */
  useDateType?: boolean
  /**
   * Use options or arguments functions
   * @default true
   */
  useOptions?: boolean
}

export type Config = Omit<
  Required<UserConfig>,
  'base' | 'name' | 'request' | 'types'
> &
  Pick<UserConfig, 'base' | 'name' | 'request'> & {
    types: Extract<Required<UserConfig>['types'], object>
  }
