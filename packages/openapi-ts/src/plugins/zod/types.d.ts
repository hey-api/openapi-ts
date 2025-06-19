import type { StringCase } from '../../types/config';
import type { Plugin } from '../types';

export interface Config extends Plugin.Name<'zod'> {
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
   * Configuration for reusable schema definitions. Controls generation of
   * shared Zod schemas that can be referenced across requests and responses.
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  definitions?:
    | boolean
    | string
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
         * Custom naming pattern for generated schema names. The name variable is
         * obtained from the schema name.
         *
         * @default 'z{{name}}'
         */
        name?: string | ((name: string) => string);
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
   * Controls generation of Zod schemas for request bodies, query parameters, path parameters, and headers.
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  requests?:
    | boolean
    | string
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
         * Custom naming pattern for generated schema names. The name variable is
         * obtained from the operation name.
         *
         * @default 'z{{name}}Data'
         */
        name?: string | ((name: string) => string);
      };
  /**
   * Configuration for response-specific Zod schemas.
   * Controls generation of Zod schemas for response bodies, error responses, and status codes.
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string`: Shorthand for `{ enabled: true; name: string }`
   * - `object`: Full configuration object
   */
  responses?:
    | boolean
    | string
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
         * Custom naming pattern for generated schema names. The name variable is
         * obtained from the operation name.
         *
         * @default 'z{{name}}Response'
         */
        name?: string | ((name: string) => string);
      };
}

export interface ResolvedConfig extends Plugin.Name<'zod'> {
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
   * Configuration for reusable schema definitions. Controls generation of
   * shared Zod schemas that can be referenced across requests and responses.
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
    name: string | ((name: string) => string);
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
   * Controls generation of Zod schemas for request bodies, query parameters, path parameters, and headers.
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
    name: string | ((name: string) => string);
  };
  /**
   * Configuration for response-specific Zod schemas.
   * Controls generation of Zod schemas for response bodies, error responses, and status codes.
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
    name: string | ((name: string) => string);
  };
}
