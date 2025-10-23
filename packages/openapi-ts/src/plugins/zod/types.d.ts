import type { DefinePlugin, Plugin } from '~/plugins/types';
import type { StringCase, StringName } from '~/types/case';

import type { IApi } from './api';

export type UserConfig = Plugin.Name<'zod'> &
  Plugin.Hooks & {
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
     * The compatibility version to target for generated output.
     *
     * Can be:
     * - `4`: [Zod 4](https://zod.dev/packages/zod) (default).
     * - `3`: [Zod 3](https://v3.zod.dev/).
     * - `'mini'`: [Zod Mini](https://zod.dev/packages/mini).
     *
     * @default 4
     */
    compatibilityVersion?: 3 | 4 | 'mini';
    /**
     * Configuration for date handling in generated Zod schemas.
     *
     * Controls how date values are processed and validated using Zod's
     * date validation features.
     */
    dates?: {
      /**
       * Whether to allow unqualified (timezone-less) datetimes:
       *
       * When enabled, Zod will accept datetime strings without timezone information.
       * When disabled, Zod will require timezone information in datetime strings.
       *
       * @default false
       */
      local?: boolean;
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
     *
     * @default true
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
          /**
           * Configuration for TypeScript type generation from Zod schemas.
           *
           * Controls generation of TypeScript types based on the generated Zod schemas.
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
                   * Whether to generate TypeScript types from Zod schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Zod schema name.
                   *
                   * @default '{{name}}ZodType'
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
     * Enable Zod metadata support? It's often useful to associate a schema with
     * some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * @default false
     */
    metadata?: boolean;
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
          /**
           * Configuration for TypeScript type generation from Zod schemas.
           *
           * Controls generation of TypeScript types based on the generated Zod schemas.
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
                   * Whether to generate TypeScript types from Zod schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Zod schema name.
                   *
                   * @default '{{name}}DataZodType'
                   */
                  name?: StringName;
                };
          };
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
          /**
           * Configuration for TypeScript type generation from Zod schemas.
           *
           * Controls generation of TypeScript types based on the generated Zod schemas.
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
                   * Whether to generate TypeScript types from Zod schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Zod schema name.
                   *
                   * @default '{{name}}ResponseZodType'
                   */
                  name?: StringName;
                };
          };
        };
    /**
     * Configuration for TypeScript type generation from Zod schemas.
     *
     * Controls generation of TypeScript types based on the generated Zod schemas.
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
             * Whether to generate TypeScript types from Zod schemas.
             *
             * @default true
             */
            enabled?: boolean;
          };
    };
    /**
     * Configuration for webhook-specific Zod schemas.
     *
     * Controls generation of Zod schemas for webhook payloads.
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
           * Whether to generate Zod schemas for webhook definitions.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Custom naming pattern for generated schema names. The name variable
           * is obtained from the webhook key.
           *
           * @default 'z{{name}}WebhookRequest'
           */
          name?: StringName;
          /**
           * Configuration for TypeScript type generation from Zod schemas.
           *
           * Controls generation of TypeScript types based on the generated Zod schemas.
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
                   * Whether to generate TypeScript types from Zod schemas.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Custom naming pattern for generated type names. The name variable is
                   * obtained from the Zod schema name.
                   *
                   * @default '{{name}}WebhookRequestZodType'
                   */
                  name?: StringName;
                };
          };
        };
  };

export type Config = Plugin.Name<'zod'> &
  Plugin.Hooks & {
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
     * The compatibility version to target for generated output.
     *
     * Can be:
     * - `4`: [Zod 4](https://zod.dev/packages/zod) (default).
     * - `3`: [Zod 3](https://v3.zod.dev/).
     * - `'mini'`: [Zod Mini](https://zod.dev/packages/mini).
     *
     * @default 4
     */
    compatibilityVersion: 3 | 4 | 'mini';
    /**
     * Configuration for date handling in generated Zod schemas.
     *
     * Controls how date values are processed and validated using Zod's
     * date validation features.
     */
    dates: {
      /**
       * Whether to allow unqualified (timezone-less) datetimes:
       *
       * When enabled, Zod will accept datetime strings without timezone information.
       * When disabled, Zod will require timezone information in datetime strings.
       *
       * @default false
       */
      local: boolean;
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
      /**
       * Configuration for TypeScript type generation from Zod schemas.
       *
       * Controls generation of TypeScript types based on the generated Zod schemas.
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
           * Whether to generate TypeScript types from Zod schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Zod schema name.
           *
           * @default '{{name}}ZodType'
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
     * Enable Zod metadata support? It's often useful to associate a schema with
     * some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * @default false
     */
    metadata: boolean;
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
      /**
       * Configuration for TypeScript type generation from Zod schemas.
       *
       * Controls generation of TypeScript types based on the generated Zod schemas.
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
           * Whether to generate TypeScript types from Zod schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Zod schema name.
           *
           * @default '{{name}}DataZodType'
           */
          name: StringName;
        };
      };
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
      /**
       * Configuration for TypeScript type generation from Zod schemas.
       *
       * Controls generation of TypeScript types based on the generated Zod schemas.
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
           * Whether to generate TypeScript types from Zod schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Zod schema name.
           *
           * @default '{{name}}ResponseZodType'
           */
          name: StringName;
        };
      };
    };
    /**
     * Configuration for TypeScript type generation from Zod schemas.
     *
     * Controls generation of TypeScript types based on the generated Zod schemas.
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
         * Whether to generate TypeScript types from Zod schemas.
         *
         * @default true
         */
        enabled: boolean;
      };
    };
    /**
     * Configuration for webhook-specific Zod schemas.
     *
     * Controls generation of Zod schemas for webhook payloads.
     */
    webhooks: {
      /**
       * The casing convention to use for generated names.
       *
       * @default 'camelCase'
       */
      case: StringCase;
      /**
       * Whether to generate Zod schemas for webhook definitions.
       *
       * @default true
       */
      enabled: boolean;
      /**
       * Custom naming pattern for generated schema names. The name variable is
       * is obtained from the webhook key.
       *
       * @default 'z{{name}}WebhookRequest'
       */
      name: StringName;
      /**
       * Configuration for TypeScript type generation from Zod schemas.
       *
       * Controls generation of TypeScript types based on the generated Zod schemas.
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
           * Whether to generate TypeScript types from Zod schemas.
           *
           * @default true
           */
          enabled: boolean;
          /**
           * Custom naming pattern for generated type names. The name variable is
           * obtained from the Zod schema name.
           *
           * @default '{{name}}WebhookRequestZodType'
           */
          name: StringName;
        };
      };
    };
  };

export type ZodPlugin = DefinePlugin<UserConfig, Config, IApi>;
