import type {
  Casing,
  DefinePlugin,
  FeatureToggle,
  IR,
  NameTransformer,
  NamingOptions,
  Plugin,
} from '@hey-api/shared';

import type { $, DollarTsDsl } from '../../ts-dsl';
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
           * @default 'v{{name}}'
           */
          name?: NameTransformer;
        };
    /**
     * Enable Valibot metadata support? It's often useful to associate a schema
     * with some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * Can be:
     * - `boolean`: Shorthand for the default metadata builder. When `true`,
     *   attaches `{ description }` from the schema (if present) to the
     *   generated Valibot schema via the metadata action.
     * - `function`: Custom metadata builder. Receives `{ $, node, schema }`,
     *   where `node` is a pre-initialized `$.object()` node. Add properties to
     *   `node` to populate the metadata object. Return value is ignored; an
     *   empty `node` skips metadata for that schema.
     *
     * @default false
     */
    metadata?:
      | boolean
      | ((
          ctx: DollarTsDsl & { node: ReturnType<typeof $.object>; schema: IR.SchemaObject },
        ) => void);
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
    /** Casing convention for generated names. */
    case: Casing;
    /** Configuration for reusable schema definitions. */
    definitions: NamingOptions & FeatureToggle;
    /** Enable Valibot metadata support? */
    metadata:
      | boolean
      | ((
          ctx: DollarTsDsl & { node: ReturnType<typeof $.object>; schema: IR.SchemaObject },
        ) => void);
    /** Configuration for request-specific Valibot schemas. */
    requests: NamingOptions & FeatureToggle;
    /** Configuration for response-specific Valibot schemas. */
    responses: NamingOptions & FeatureToggle;
    /** Configuration for webhook-specific Valibot schemas. */
    webhooks: NamingOptions & FeatureToggle;
  };

export type ValibotPlugin = DefinePlugin<UserConfig, Config, IApi>;
