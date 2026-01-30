import type {
  Casing,
  DefinePlugin,
  FeatureToggle,
  NameTransformer,
  NamingOptions,
  Plugin,
} from '@hey-api/shared';

import type { IApi } from './api';
import type { Resolvers } from './resolvers';

export type UserConfig = Plugin.Name<'zod'> &
  Plugin.Hooks &
  Plugin.UserExports &
  Resolvers & {
    /**
     * Casing convention for generated names.
     *
     * @default 'camelCase'
     */
    case?: Casing;
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
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
           *
           * @default 'z{{name}}'
           */
          name?: NameTransformer;
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
              | NameTransformer
              | {
                  /**
                   * Casing convention for generated names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: Casing;
                  /**
                   * Whether this feature is enabled.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Naming pattern for generated names.
                   *
                   * @default '{{name}}ZodType'
                   */
                  name?: NameTransformer;
                };
          };
        };
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
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
           *
           * @default 'z{{name}}Data'
           */
          name?: NameTransformer;
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
              | NameTransformer
              | {
                  /**
                   * Casing convention for generated names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: Casing;
                  /**
                   * Whether this feature is enabled.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Naming pattern for generated names.
                   *
                   * @default '{{name}}DataZodType'
                   */
                  name?: NameTransformer;
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
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
           *
           * @default 'z{{name}}Response'
           */
          name?: NameTransformer;
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
              | NameTransformer
              | {
                  /**
                   * Casing convention for generated names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: Casing;
                  /**
                   * Whether this feature is enabled.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Naming pattern for generated names.
                   *
                   * @default '{{name}}ResponseZodType'
                   */
                  name?: NameTransformer;
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
        | NameTransformer
        | {
            /**
             * Casing convention for generated names.
             *
             * @default 'PascalCase'
             */
            case?: Casing;
            /**
             * Whether this feature is enabled.
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
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'camelCase'
           */
          case?: Casing;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Naming pattern for generated names.
           *
           * @default 'z{{name}}WebhookRequest'
           */
          name?: NameTransformer;
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
              | NameTransformer
              | {
                  /**
                   * Casing convention for generated names.
                   *
                   * @default 'PascalCase'
                   */
                  case?: Casing;
                  /**
                   * Whether this feature is enabled.
                   *
                   * @default true
                   */
                  enabled?: boolean;
                  /**
                   * Naming pattern for generated names.
                   *
                   * @default '{{name}}WebhookRequestZodType'
                   */
                  name?: NameTransformer;
                };
          };
        };
  };

export type Config = Plugin.Name<'zod'> &
  Plugin.Hooks &
  Plugin.Exports &
  Resolvers & {
    /**
     * Casing convention for generated names.
     */
    case: Casing;
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
    definitions: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Zod schemas.
         *
         * Controls generation of TypeScript types based on the generated Zod schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
        };
      };
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
    requests: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Zod schemas.
         *
         * Controls generation of TypeScript types based on the generated Zod schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
        };
      };
    /**
     * Configuration for response-specific Zod schemas.
     *
     * Controls generation of Zod schemas for response bodies, error responses,
     * and status codes.
     */
    responses: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Zod schemas.
         *
         * Controls generation of TypeScript types based on the generated Zod schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
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
      infer: FeatureToggle & {
        /**
         * Casing convention for generated names.
         */
        case: Casing;
      };
    };
    /**
     * Configuration for webhook-specific Zod schemas.
     *
     * Controls generation of Zod schemas for webhook payloads.
     */
    webhooks: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Zod schemas.
         *
         * Controls generation of TypeScript types based on the generated Zod schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
        };
      };
  };

export type ZodPlugin = DefinePlugin<UserConfig, Config, IApi>;
