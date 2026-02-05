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

export type UserConfig = Plugin.Name<'valibot'> &
  Plugin.Hooks &
  Plugin.UserComments &
  Plugin.UserExports &
  Resolvers & {
    /**
     * Casing convention for generated names.
     *
     * @default 'camelCase'
     */
    case?: Casing;
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
           * @default 'v{{name}}'
           */
          name?: NameTransformer;
        };
    /**
     * Enable Valibot metadata support? It's often useful to associate a schema
     * with some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * @default false
     */
    metadata?: boolean;
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
           * @default 'v{{name}}Data'
           */
          name?: NameTransformer;
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
           * @default 'v{{name}}Response'
           */
          name?: NameTransformer;
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
           * @default 'v{{name}}WebhookRequest'
           */
          name?: NameTransformer;
        };
  };

export type Config = Plugin.Name<'valibot'> &
  Plugin.Hooks &
  Plugin.Comments &
  Plugin.Exports &
  Resolvers & {
    /**
     * Casing convention for generated names.
     */
    case: Casing;
    /**
     * Configuration for reusable schema definitions.
     *
     * Controls generation of shared Valibot schemas that can be referenced
     * across requests and responses.
     */
    definitions: NamingOptions & FeatureToggle;
    /**
     * Enable Valibot metadata support? It's often useful to associate a schema
     * with some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * @default false
     */
    metadata: boolean;
    /**
     * Configuration for request-specific Valibot schemas.
     *
     * Controls generation of Valibot schemas for request bodies, query
     * parameters, path parameters, and headers.
     */
    requests: NamingOptions & FeatureToggle;
    /**
     * Configuration for response-specific Valibot schemas.
     *
     * Controls generation of Valibot schemas for response bodies, error
     * responses, and status codes.
     */
    responses: NamingOptions & FeatureToggle;
    /**
     * Configuration for webhook-specific Valibot schemas.
     *
     * Controls generation of Valibot schemas for webhook payloads.
     */
    webhooks: NamingOptions & FeatureToggle;
  };

export type ValibotPlugin = DefinePlugin<UserConfig, Config, IApi>;
