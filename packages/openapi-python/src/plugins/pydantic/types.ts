import type {
  Casing,
  DefinePlugin,
  FeatureToggle,
  NameTransformer,
  NamingOptions,
  Plugin,
} from '@hey-api/shared';

export type UserConfig = Plugin.Name<'pydantic'> &
  Plugin.Hooks &
  Plugin.UserComments &
  Plugin.UserExports & {
    /**
     * Casing convention for generated names.
     *
     * @default 'PascalCase'
     */
    case?: Casing;
    /**
     * Configuration for reusable schema definitions.
     *
     * Controls generation of shared Pydantic models that can be referenced
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
        };
    /**
     * How to generate enum types.
     *
     * - `'enum'`: Generate Python Enum classes (e.g., `class Status(str, Enum): ...`)
     * - `'literal'`: Generate Literal type hints (e.g., `Literal["pending", "active"]`)
     *
     * @default 'enum'
     */
    enums?: 'enum' | 'literal';
    /**
     * Configuration for request-specific Pydantic models.
     *
     * Controls generation of Pydantic models for request bodies,
     * query parameters, path parameters, and headers.
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
           * @default '{{name}}Request'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for response-specific Pydantic models.
     *
     * Controls generation of Pydantic models for response bodies,
     * error responses, and status codes.
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
        };
    /**
     * Enable strict mode for Pydantic models?
     *
     * When enabled, extra fields not defined in the schema will be rejected.
     *
     * This adds `model_config = ConfigDict(extra='forbid')`
     * to generated models.
     *
     * @default false
     */
    strict?: boolean;
    /**
     * Configuration for webhook-specific Pydantic models.
     *
     * Controls generation of Pydantic models for webhook payloads.
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
           * @default '{{name}}Webhook'
           */
          name?: NameTransformer;
        };
  };

export type Config = Plugin.Name<'pydantic'> &
  Plugin.Hooks &
  Plugin.Comments &
  Plugin.Exports & {
    /** Casing convention for generated names. */
    case: Casing;
    /** Configuration for reusable schema definitions. */
    definitions: NamingOptions & FeatureToggle;
    /** How to generate enum types. */
    enums: 'enum' | 'literal';
    /** Configuration for request-specific Pydantic models. */
    requests: NamingOptions & FeatureToggle;
    /** Configuration for response-specific Pydantic models. */
    responses: NamingOptions & FeatureToggle;
    /** Enable strict mode for Pydantic models? */
    strict: boolean;
    /** Configuration for webhook-specific Pydantic models. */
    webhooks: NamingOptions & FeatureToggle;
  };

export type PydanticPlugin = DefinePlugin<UserConfig, Config>;
