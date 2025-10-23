import type { DefinePlugin, Plugin } from '~/plugins/types';
import type { StringCase, StringName } from '~/types/case';

import type { IApi } from './api';

export type UserConfig = Plugin.Name<'arktype'> &
  Plugin.Hooks & {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'PascalCase'
     */
    case?: StringCase;
    /**
     * Add comments from input to the generated Arktype schemas?
     *
     * @default true
     */
    comments?: boolean;
    /**
     * Configuration for reusable schema definitions.
     *
     * Controls generation of shared Arktype schemas that can be referenced
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
           * @default 'PascalCase'
           */
          case?: StringCase;
          /**
           * Whether to generate Arktype schemas for reusable definitions.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated schema names. The name variable
           * is obtained from the schema name.
           *
           * @default '{{name}}'
           */
          name?: StringName;
          /**
           * Configuration for TypeScript type generation from Arktype schemas.
           *
           * Controls generation of TypeScript types based on the generated Arktype schemas.
           */
          types?: {
            /**
             * Configuration for `infer` types.
             *
             * Can be:
             * - `boolean`: Shorthand for `{ enabled: boolean }`
             * - `string` or `function`: Shorthand for `{ name: string | function }`
             * - `object`: Full configuration object
             *
             * @default false
             */
            infer?:
              | boolean
              | StringName
              | {
                  /**
                   * The casing convention to use for generated type names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: StringCase;
                  /**
                   * Whether to generate TypeScript types from Arktype schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Arktype schema name.
                   *
                   * @default '{{name}}'
                   */
                  name?: StringName;
                };
          };
        };
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex?: boolean;
    /**
     * Enable Arktype metadata support? It's often useful to associate a schema
     * with some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * @default false
     */
    metadata?: boolean;
    /**
     * Configuration for request-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for request bodies, query parameters, path
     * parameters, and headers.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    requests?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'PascalCase'
           */
          case?: StringCase;
          /**
           * Whether to generate Arktype schemas for request definitions.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated schema names. The name variable
           * is obtained from the operation name.
           *
           * @default '{{name}}Data'
           */
          name?: StringName;
          /**
           * Configuration for TypeScript type generation from Arktype schemas.
           *
           * Controls generation of TypeScript types based on the generated Arktype schemas.
           */
          types?: {
            /**
             * Configuration for `infer` types.
             *
             * Can be:
             * - `boolean`: Shorthand for `{ enabled: boolean }`
             * - `string` or `function`: Shorthand for `{ name: string | function }`
             * - `object`: Full configuration object
             *
             * @default false
             */
            infer?:
              | boolean
              | StringName
              | {
                  /**
                   * The casing convention to use for generated type names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: StringCase;
                  /**
                   * Whether to generate TypeScript types from Arktype schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Arktype schema name.
                   *
                   * @default '{{name}}Data'
                   */
                  name?: StringName;
                };
          };
        };
    /**
     * Configuration for response-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for response bodies, error responses,
     * and status codes.
     *
     * Can be:
     * - `boolean`: Shorthand for `{ enabled: boolean }`
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default true
     */
    responses?:
      | boolean
      | StringName
      | {
          /**
           * The casing convention to use for generated names.
           *
           * @default 'PascalCase'
           */
          case?: StringCase;
          /**
           * Whether to generate Arktype schemas for response definitions.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated schema names. The name variable
           * is obtained from the operation name.
           *
           * @default '{{name}}Response'
           */
          name?: StringName;
          /**
           * Configuration for TypeScript type generation from Arktype schemas.
           *
           * Controls generation of TypeScript types based on the generated Arktype schemas.
           */
          types?: {
            /**
             * Configuration for `infer` types.
             *
             * Can be:
             * - `boolean`: Shorthand for `{ enabled: boolean }`
             * - `string` or `function`: Shorthand for `{ name: string | function }`
             * - `object`: Full configuration object
             *
             * @default false
             */
            infer?:
              | boolean
              | StringName
              | {
                  /**
                   * The casing convention to use for generated type names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: StringCase;
                  /**
                   * Whether to generate TypeScript types from Arktype schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Arktype schema name.
                   *
                   * @default '{{name}}Response'
                   */
                  name?: StringName;
                };
          };
        };
    /**
     * Configuration for TypeScript type generation from Arktype schemas.
     *
     * Controls generation of TypeScript types based on the generated Arktype schemas.
     */
    types?: {
      /**
       * Configuration for `infer` types.
       *
       * Can be:
       * - `boolean`: Shorthand for `{ enabled: boolean }`
       * - `string` or `function`: Shorthand for `{ name: string | function }`
       * - `object`: Full configuration object
       *
       * @default false
       */
      infer?:
        | boolean
        | StringName
        | {
            /**
             * The casing convention to use for generated type names.
             *
             * @default 'PascalCase'
             */
            case?: StringCase;
            /**
             * Whether to generate TypeScript types from Arktype schemas.
             *
             * @default true
             */
            enabled?: boolean;
          };
    };
    /**
     * Configuration for webhook-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for webhook payloads.
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
           * @default 'PascalCase'
           */
          case?: StringCase;
          /**
           * Whether to generate Arktype schemas for webhook definitions.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated schema names. The name variable
           * is obtained from the webhook key.
           *
           * @default '{{name}}WebhookRequest'
           */
          name?: StringName;
          /**
           * Configuration for TypeScript type generation from Arktype schemas.
           *
           * Controls generation of TypeScript types based on the generated Arktype schemas.
           */
          types?: {
            /**
             * Configuration for `infer` types.
             *
             * Can be:
             * - `boolean`: Shorthand for `{ enabled: boolean }`
             * - `string` or `function`: Shorthand for `{ name: string | function }`
             * - `object`: Full configuration object
             *
             * @default false
             */
            infer?:
              | boolean
              | StringName
              | {
                  /**
                   * The casing convention to use for generated type names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: StringCase;
                  /**
                   * Whether to generate TypeScript types from Arktype schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Arktype schema name.
                   *
                   * @default '{{name}}WebhookRequest'
                   */
                  name?: StringName;
                };
          };
        };
  };

export type Config = Plugin.Name<'arktype'> &
  Plugin.Hooks & {
    /**
     * The casing convention to use for generated names.
     *
     * @default 'PascalCase'
     */
    case: StringCase;
    /**
     * Add comments from input to the generated Arktype schemas?
     *
     * @default true
     */
    comments: boolean;
    /**
     * Configuration for reusable schema definitions.
     *
     * Controls generation of shared Arktype schemas that can be referenced across
     * requests and responses.
     */
    definitions: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'PascalCase'
       */
      case: StringCase;
      /**
       * Whether to generate Arktype schemas for reusable definitions.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated schema names. The name variable is
       * obtained from the schema name.
       *
       * @default '{{name}}'
       */
      name: StringName;
      /**
       * Configuration for TypeScript type generation from Arktype schemas.
       *
       * Controls generation of TypeScript types based on the generated Arktype schemas.
       */
      types: {
        /**
         * Configuration for `infer` types.
         */
        infer: {
          /**
           * The casing convention to use for generated type names.
           *
           * @default 'PascalCase'
           */
          case: StringCase;
          /**
           * Whether to generate TypeScript types from Arktype schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Arktype schema name.
           *
           * @default '{{name}}'
           */
          name: StringName;
        };
      };
    };
    /**
     * Should the exports from the generated files be re-exported in the index
     * barrel file?
     *
     * @default false
     */
    exportFromIndex: boolean;
    /**
     * Enable Arktype metadata support? It's often useful to associate a schema with
     * some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * @default false
     */
    metadata: boolean;
    /**
     * Configuration for request-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for request bodies, query parameters, path
     * parameters, and headers.
     */
    requests: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'PascalCase'
       */
      case: StringCase;
      /**
       * Whether to generate Arktype schemas for request definitions.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated schema names. The name variable is
       * obtained from the operation name.
       *
       * @default '{{name}}Data'
       */
      name: StringName;
      /**
       * Configuration for TypeScript type generation from Arktype schemas.
       *
       * Controls generation of TypeScript types based on the generated Arktype schemas.
       */
      types: {
        /**
         * Configuration for `infer` types.
         */
        infer: {
          /**
           * The casing convention to use for generated type names.
           *
           * @default 'PascalCase'
           */
          case: StringCase;
          /**
           * Whether to generate TypeScript types from Arktype schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Arktype schema name.
           *
           * @default '{{name}}Data'
           */
          name: StringName;
        };
      };
    };
    /**
     * Configuration for response-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for response bodies, error responses,
     * and status codes.
     */
    responses: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'PascalCase'
       */
      case: StringCase;
      /**
       * Whether to generate Arktype schemas for response definitions.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated schema names. The name variable is
       * obtained from the operation name.
       *
       * @default '{{name}}Response'
       */
      name: StringName;
      /**
       * Configuration for TypeScript type generation from Arktype schemas.
       *
       * Controls generation of TypeScript types based on the generated Arktype schemas.
       */
      types: {
        /**
         * Configuration for `infer` types.
         */
        infer: {
          /**
           * The casing convention to use for generated type names.
           *
           * @default 'PascalCase'
           */
          case: StringCase;
          /**
           * Whether to generate TypeScript types from Arktype schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Arktype schema name.
           *
           * @default '{{name}}Response'
           */
          name: StringName;
        };
      };
    };
    /**
     * Configuration for TypeScript type generation from Arktype schemas.
     *
     * Controls generation of TypeScript types based on the generated Arktype schemas.
     */
    types: {
      /**
       * Configuration for `infer` types.
       */
      infer: {
        /**
         * The casing convention to use for generated type names.
         *
         * @default 'PascalCase'
         */
        case: StringCase;
        /**
         * Whether to generate TypeScript types from Arktype schemas.
         *
         * @default true
         */
        enabled: boolean;
      };
    };
    /**
     * Configuration for webhook-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for webhook payloads.
     */
    webhooks: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'PascalCase'
       */
      case: StringCase;
      /**
       * Whether to generate Arktype schemas for webhook definitions.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated schema names. The name variable is
       * is obtained from the webhook key.
       *
       * @default '{{name}}WebhookRequest'
       */
      name: StringName;
      /**
       * Configuration for TypeScript type generation from Arktype schemas.
       *
       * Controls generation of TypeScript types based on the generated Arktype schemas.
       */
      types: {
        /**
         * Configuration for `infer` types.
         */
        infer: {
          /**
           * The casing convention to use for generated type names.
           *
           * @default 'PascalCase'
           */
          case: StringCase;
          /**
           * Whether to generate TypeScript types from Arktype schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Arktype schema name.
           *
           * @default '{{name}}WebhookRequest'
           */
          name: StringName;
        };
      };
    };
  };

export type ArktypePlugin = DefinePlugin<UserConfig, Config, IApi>;
