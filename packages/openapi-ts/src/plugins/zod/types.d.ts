import type { StringCase, StringName } from '../../types/case';
import type { DefinePlugin, Plugin } from '../types';
import type { Api } from './api';

export type UserConfig = Plugin.Name<'zod'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case?: StringCase;
  /**
   * Add comments from input to the generated Zod schemas?
   *
   * @default true
   */
  comments?: boolean;
  /**
   * Configuration for date handling in generated Zod schemas.
   *
   * Controls how date values are processed and validated using Zod's
   * date validation features.
   */
  dates?: {
    /**
     * Whether to include timezone offset information when handling dates.
     *
     * When enabled, date strings will preserve timezone information.
     * When disabled, dates will be treated as local time.
     *
     * @default false
     */
    offset?: boolean;
  };
  /**
   * Configuration for reusable schema definitions.
   *
   * Controls generation of shared Zod schemas that can be referenced across
   * requests and responses.
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   */
  definitions?:
    | boolean
    | StringName
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate Zod schemas for reusable definitions.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated schema names. The name variable
         * is obtained from the schema name.
         *
         * @default 'z{{name}}'
         */
        name?: StringName;
      };
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex?: boolean;
  /**
   * Enable Zod metadata support? It's often useful to associate a schema with
   * some additional metadata for documentation, code generation, AI
   * structured outputs, form validation, and other purposes.
   *
   * @default false
   */
  metadata?: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'zod'
   */
  output?: string;
  /**
   * Configuration for request-specific Zod schemas.
   *
   * Controls generation of Zod schemas for request bodies, query parameters, path
   * parameters, and headers.
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   */
  requests?:
    | boolean
    | StringName
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate Zod schemas for request definitions.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated schema names. The name variable
         * is obtained from the operation name.
         *
         * @default 'z{{name}}Data'
         */
        name?: StringName;
      };
  /**
   * Configuration for response-specific Zod schemas.
   *
   * Controls generation of Zod schemas for response bodies, error responses,
   * and status codes.
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   */
  responses?:
    | boolean
    | StringName
    | {
        /**
         * The casing convention to use for generated names.
         *
         * @default 'camelCase'
         */
        case?: StringCase;
        /**
         * Whether to generate Zod schemas for response definitions.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated schema names. The name variable
         * is obtained from the operation name.
         *
         * @default 'z{{name}}Response'
         */
        name?: StringName;
      };
};

export type Config = Plugin.Name<'zod'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case: StringCase;
  /**
   * Add comments from input to the generated Zod schemas?
   *
   * @default true
   */
  comments: boolean;
  /**
   * Configuration for date handling in generated Zod schemas.
   *
   * Controls how date values are processed and validated using Zod's
   * date validation features.
   */
  dates: {
    /**
     * Whether to include timezone offset information when handling dates.
     *
     * When enabled, date strings will preserve timezone information.
     * When disabled, dates will be treated as local time.
     *
     * @default false
     */
    offset: boolean;
  };
  /**
   * Configuration for reusable schema definitions.
   *
   * Controls generation of shared Zod schemas that can be referenced across
   * requests and responses.
   */
  definitions: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate Zod schemas for reusable definitions.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated schema names. The name variable is
     * obtained from the schema name.
     *
     * @default 'z{{name}}'
     */
    name: StringName;
  };
  /**
   * Should the exports from the generated files be re-exported in the index
   * barrel file?
   *
   * @default false
   */
  exportFromIndex: boolean;
  /**
   * Enable Zod metadata support? It's often useful to associate a schema with
   * some additional metadata for documentation, code generation, AI
   * structured outputs, form validation, and other purposes.
   *
   * @default false
   */
  metadata: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'zod'
   */
  output: string;
  /**
   * Configuration for request-specific Zod schemas.
   *
   * Controls generation of Zod schemas for request bodies, query parameters, path
   * parameters, and headers.
   */
  requests: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate Zod schemas for request definitions.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated schema names. The name variable is
     * obtained from the operation name.
     *
     * @default 'z{{name}}Data'
     */
    name: StringName;
  };
  /**
   * Configuration for response-specific Zod schemas.
   *
   * Controls generation of Zod schemas for response bodies, error responses,
   * and status codes.
   */
  responses: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate Zod schemas for response definitions.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated schema names. The name variable is
     * obtained from the operation name.
     *
     * @default 'z{{name}}Response'
     */
    name: StringName;
  };
};

export type ZodPlugin = DefinePlugin<UserConfig, Config, Api>;
