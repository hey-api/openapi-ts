import type { StringCase, StringName } from '../../types/case';
import type { DefinePlugin, Plugin } from '../types';
import type { Api } from './api';

export type UserConfig = Plugin.Name<'valibot'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case?: StringCase;
  /**
   * Add comments from input to the generated Valibot schemas?
   *
   * @default true
   */
  comments?: boolean;
  /**
   * Configuration for reusable schema definitions.
   *
   * Controls generation of shared Valibot schemas that can be referenced
   * across requests and responses.
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
         * Whether to generate Valibot schemas for reusable definitions.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated schema names. The name variable
         * is obtained from the schema name.
         *
         * @default 'v{{name}}'
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
   * Enable Valibot metadata support? It's often useful to associate a schema
   * with some additional metadata for documentation, code generation, AI
   * structured outputs, form validation, and other purposes.
   *
   * @default false
   */
  metadata?: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'valibot'
   */
  output?: string;
  /**
   * Configuration for request-specific Valibot schemas.
   *
   * Controls generation of Valibot schemas for request bodies, query
   * parameters, path parameters, and headers.
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
         * Whether to generate Valibot schemas for request definitions.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated schema names. The name variable
         * is obtained from the operation name.
         *
         * @default 'v{{name}}Data'
         */
        name?: StringName;
      };
  /**
   * Configuration for response-specific Valibot schemas.
   *
   * Controls generation of Valibot schemas for response bodies, error
   * responses, and status codes.
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
         * Whether to generate Valibot schemas for response definitions.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated schema names. The name variable
         * is obtained from the operation name.
         *
         * @default 'v{{name}}Response'
         */
        name?: StringName;
      };
  /**
   * Configuration for webhook-specific Valibot schemas.
   *
   * Controls generation of Valibot schemas for webhook payloads.
   *
   * Can be:
   * - `boolean`: Shorthand for `{ enabled: boolean }`
   * - `string` or `function`: Shorthand for `{ name: string | function }`
   * - `object`: Full configuration object
   *
   * @default true
   */
  webhooks?:
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
         * Whether to generate Valibot schemas for webhook definitions.
         *
         * @default true
         */
        enabled?: boolean;
        /**
         * Custom naming pattern for generated schema names. The name variable
         * is obtained from the webhook key.
         *
         * @default 'v{{name}}WebhookRequest'
         */
        name?: StringName;
      };
};

export type Config = Plugin.Name<'valibot'> & {
  /**
   * The casing convention to use for generated names.
   *
   * @default 'camelCase'
   */
  case: StringCase;
  /**
   * Add comments from input to the generated Valibot schemas?
   *
   * @default true
   */
  comments: boolean;
  /**
   * Configuration for reusable schema definitions.
   *
   * Controls generation of shared Valibot schemas that can be referenced
   * across requests and responses.
   */
  definitions: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate Valibot schemas for reusable definitions.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated schema names. The name variable is
     * obtained from the schema name.
     *
     * @default 'v{{name}}'
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
   * Enable Valibot metadata support? It's often useful to associate a schema
   * with some additional metadata for documentation, code generation, AI
   * structured outputs, form validation, and other purposes.
   *
   * @default false
   */
  metadata: boolean;
  /**
   * Name of the generated file.
   *
   * @default 'valibot'
   */
  output: string;
  /**
   * Configuration for request-specific Valibot schemas.
   *
   * Controls generation of Valibot schemas for request bodies, query
   * parameters, path parameters, and headers.
   */
  requests: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate Valibot schemas for request definitions.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated schema names. The name variable is
     * obtained from the operation name.
     *
     * @default 'v{{name}}Data'
     */
    name: StringName;
  };
  /**
   * Configuration for response-specific Valibot schemas.
   *
   * Controls generation of Valibot schemas for response bodies, error
   * responses, and status codes.
   */
  responses: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate Valibot schemas for response definitions.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated schema names. The name variable is
     * obtained from the operation name.
     *
     * @default 'v{{name}}Response'
     */
    name: StringName;
  };
  /**
   * Configuration for webhook-specific Valibot schemas.
   *
   * Controls generation of Valibot schemas for webhook payloads.
   */
  webhooks: {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'camelCase'
     */
    case: StringCase;
    /**
     * Whether to generate Valibot schemas for webhook definitions.
     *
     * @default true
     */
    enabled: boolean;
    /**
     * Custom naming pattern for generated schema names. The name variable
     * is obtained from the webhook key.
     *
     * @default 'v{{name}}WebhookRequest'
     */
    name: StringName;
  };
};

export type ValibotPlugin = DefinePlugin<UserConfig, Config, Api>;
