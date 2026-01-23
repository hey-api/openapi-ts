import type {
  Casing,
  FeatureToggle,
  IndexExportOption,
  NameTransformer,
  NamingOptions,
} from '@hey-api/shared';
import type { DefinePlugin, Plugin } from '@hey-api/shared';

import type { IApi } from './api';

export type UserConfig = Plugin.Name<'arktype'> &
  Plugin.Hooks & {
    /**
     * Casing convention for generated names.
     *
     * @default 'PascalCase'
     */
    case?: Casing;
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
           * @default '{{name}}'
           */
          name?: NameTransformer;
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
                   * @default '{{name}}'
                   */
                  name?: NameTransformer;
                };
          };
        };
    /**
     * Whether exports should be re-exported in the index file.
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
           * @default '{{name}}Data'
           */
          name?: NameTransformer;
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
                   * @default '{{name}}Data'
                   */
                  name?: NameTransformer;
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
           * @default '{{name}}Response'
           */
          name?: NameTransformer;
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
                   * @default '{{name}}Response'
                   */
                  name?: NameTransformer;
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
           * @default '{{name}}WebhookRequest'
           */
          name?: NameTransformer;
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
                   * @default '{{name}}WebhookRequest'
                   */
                  name?: NameTransformer;
                };
          };
        };
  };

export type Config = Plugin.Name<'arktype'> &
  Plugin.Hooks &
  IndexExportOption & {
    /**
     * Casing convention for generated names.
     */
    case: Casing;
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
    definitions: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Arktype schemas.
         *
         * Controls generation of TypeScript types based on the generated Arktype schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
        };
      };
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
    requests: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Arktype schemas.
         *
         * Controls generation of TypeScript types based on the generated Arktype schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
        };
      };
    /**
     * Configuration for response-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for response bodies, error responses,
     * and status codes.
     */
    responses: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Arktype schemas.
         *
         * Controls generation of TypeScript types based on the generated Arktype schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
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
      infer: FeatureToggle & {
        /**
         * Casing convention for generated names.
         */
        case: Casing;
      };
    };
    /**
     * Configuration for webhook-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for webhook payloads.
     */
    webhooks: NamingOptions &
      FeatureToggle & {
        /**
         * Configuration for TypeScript type generation from Arktype schemas.
         *
         * Controls generation of TypeScript types based on the generated Arktype schemas.
         */
        types: {
          /**
           * Configuration for `infer` types.
           */
          infer: NamingOptions & FeatureToggle;
        };
      };
  };

export type ArktypePlugin = DefinePlugin<UserConfig, Config, IApi>;
