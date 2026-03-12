import type {
  DefinePlugin,
  FeatureToggle,
  IR,
  NameTransformer,
  NamingOptions,
  Plugin,
} from '@hey-api/shared';
import type { Casing } from '@hey-api/shared';

import type { $, DollarTsDsl } from '../../ts-dsl';
import type { IApi } from './api';
import type { Resolvers } from './resolvers';

export type UserConfig = Plugin.Name<'arktype'> &
  Plugin.Hooks &
  Plugin.UserComments &
  Plugin.UserExports &
  Resolvers & {
    /**
     * Casing convention for generated names.
     *
     * @default 'PascalCase'
     */
    case?: Casing;
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
           * Configuration for generating TypeScript type aliases from Arktype schemas.
           *
           * Can be:
           * - `boolean`: Shorthand for `{ enabled: boolean }`
           * - `string` or `function`: Shorthand for `{ name: string | function }`
           * - `object`: Full configuration object
           *
           * @default false
           */
          types?: {
            infer?: boolean | NameTransformer;
          };
        };
    /**
     * Enable Arktype metadata support? It's often useful to associate a schema
     * with some additional metadata for documentation, code generation, AI
     * structured outputs, form validation, and other purposes.
     *
     * Can be:
     * - `boolean`: Shorthand for the default metadata builder. When `true`,
     *   attaches `{ description }` from the schema (if present) to the
     *   generated Arktype schema via the metadata action.
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
     * Configuration for request-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for request bodies, query
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
           * Configuration for generating TypeScript type aliases from Arktype schemas.
           *
           * Can be:
           * - `boolean`: Shorthand for `{ enabled: boolean }`
           * - `string` or `function`: Shorthand for `{ name: string | function }`
           * - `object`: Full configuration object
           *
           * @default false
           */
          types?: {
            infer?: boolean | NameTransformer;
          };
        };
    /**
     * Configuration for response-specific Arktype schemas.
     *
     * Controls generation of Arktype schemas for response bodies, error
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
           * Configuration for generating TypeScript type aliases from Arktype schemas.
           *
           * Can be:
           * - `boolean`: Shorthand for `{ enabled: boolean }`
           * - `string` or `function`: Shorthand for `{ name: string | function }`
           * - `object`: Full configuration object
           *
           * @default false
           */
          types?: {
            infer?: boolean | NameTransformer;
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
           * Configuration for generating TypeScript type aliases from Arktype schemas.
           *
           * Can be:
           * - `boolean`: Shorthand for `{ enabled: boolean }`
           * - `string` or `function`: Shorthand for `{ name: string | function }`
           * - `object`: Full configuration object
           *
           * @default false
           */
          types?: {
            infer?: boolean | NameTransformer;
          };
        };
  };

export type Config = Plugin.Name<'arktype'> &
  Plugin.Hooks &
  Plugin.Comments &
  Plugin.Exports &
  Resolvers & {
    /** Casing convention for generated names. */
    case: Casing;
    /** Configuration for reusable schema definitions. */
    definitions: NamingOptions & FeatureToggle & {
      types?: {
        infer: boolean | NameTransformer;
      };
    };
    /** Enable Arktype metadata support? */
    metadata:
      | boolean
      | ((
          ctx: DollarTsDsl & { node: ReturnType<typeof $.object>; schema: IR.SchemaObject },
        ) => void);
    /** Configuration for request-specific Arktype schemas. */
    requests: NamingOptions & FeatureToggle & {
      types?: {
        infer: boolean | NameTransformer;
      };
    };
    /** Configuration for response-specific Arktype schemas. */
    responses: NamingOptions & FeatureToggle & {
      types?: {
        infer: boolean | NameTransformer;
      };
    };
    /** Configuration for webhook-specific Arktype schemas. */
    webhooks: NamingOptions & FeatureToggle & {
      types?: {
        infer: boolean | NameTransformer;
      };
    };
  };

export type ArktypePlugin = DefinePlugin<UserConfig, Config, IApi>;