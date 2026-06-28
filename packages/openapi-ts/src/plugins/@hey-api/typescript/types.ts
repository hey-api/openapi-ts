import type { Casing, FeatureToggle, NameTransformer, NamingOptions } from '@hey-api/shared';
import type { DefinePlugin, Plugin } from '@hey-api/shared';
import type { MaybeFunc } from '@hey-api/types';

import type { IApi } from './api';
import type { TypeScriptImports } from './imports';
import type { HeyApiTypeScriptResolvers } from './resolvers';

export type EnumsType = 'javascript' | 'typescript' | 'typescript-const';

export type UserConfig = Plugin.Name<'@hey-api/typescript'> &
  Plugin.Hooks &
  Plugin.UserComments &
  Plugin.UserExports &
  HeyApiTypeScriptResolvers & {
    /**
     * Brand primitive types for nominal type safety.
     *
     * Can be:
     * - `boolean`: brand all named primitive schemas using the schema name
     * - `string`: template pattern (e.g., `'{{name}}'`) for the brand name
     * - `function`: called for each named primitive schema, return a brand
     *   name string, `true` to brand with the default name, or `false`
     *   to skip
     *
     * @default false
     */
    brand?: MaybeFunc<(name: string) => string | boolean>;
    /**
     * Casing convention for generated names.
     *
     * @default 'PascalCase'
     */
    case?: Exclude<Casing, 'SCREAMING_SNAKE_CASE'>;
    /**
     * Configuration for reusable schema definitions.
     *
     * Controls generation of shared types that can be referenced across
     * requests and responses.
     *
     * Can be:
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default '{{name}}'
     */
    definitions?:
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'PascalCase'
           */
          case?: Casing;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}'
           */
          name?: NameTransformer;
        };
    /**
     * By default, enums are emitted as types to preserve runtime-free output.
     *
     * However, you may want to generate enums as JavaScript objects or
     * TypeScript enums for runtime usage, interoperability, or integration with
     * other tools.
     *
     * @default false
     */
    enums?:
      | boolean
      | EnumsType
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'SCREAMING_SNAKE_CASE'
           */
          case?: Casing;
          /**
           * When generating enums as JavaScript objects, they'll contain a null
           * value if they're nullable. This might be undesirable if you want to do
           * `Object.values(Foo)` and have all values be of the same type.
           *
           * This setting is disabled by default to preserve the source schemas.
           *
           * @default false
           */
          constantsIgnoreNull?: boolean;
          /**
           * Whether this feature is enabled.
           *
           * @default true
           */
          enabled?: boolean;
          /**
           * Specifies the output mode for generated enums.
           *
           * Can be:
           * - `javascript`: Generates JavaScript objects
           * - `typescript`: Generates TypeScript enums
           * - `typescript-const`: Generates TypeScript const enums
           *
           * @default 'javascript'
           */
          mode?: EnumsType;
        };
    /**
     * Configuration for error-specific types.
     *
     * Controls generation of types for error response bodies and status codes.
     *
     * Can be:
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default '{{name}}Errors'
     */
    errors?:
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'PascalCase'
           */
          case?: Casing;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}Error'
           */
          error?: NameTransformer;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}Errors'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for request-specific types.
     *
     * Controls generation of types for request bodies, query parameters, path
     * parameters, and headers.
     *
     * Can be:
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default '{{name}}Data'
     */
    requests?:
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'PascalCase'
           */
          case?: Casing;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}Data'
           */
          name?: NameTransformer;
        };
    /**
     * Configuration for response-specific types.
     *
     * Controls generation of types for response bodies and status codes.
     *
     * Can be:
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default '{{name}}Responses'
     */
    responses?:
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'PascalCase'
           */
          case?: Casing;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}Responses'
           */
          name?: NameTransformer;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}Response'
           */
          response?: NameTransformer;
        };
    /**
     * The top type to use for untyped or unspecified schema values.
     *
     * Can be:
     * - `unknown` (default): safe top type, you must narrow before use
     * - `any`: disables type checking, can be used anywhere
     *
     * @default 'unknown'
     */
    topType?: 'any' | 'unknown';
    /**
     * Configuration for webhook-specific types.
     *
     * Controls generation of types for webhook payloads and webhook requests.
     *
     * Can be:
     * - `string` or `function`: Shorthand for `{ name: string | function }`
     * - `object`: Full configuration object
     *
     * @default '{{name}}WebhookRequest'
     */
    webhooks?:
      | NameTransformer
      | {
          /**
           * Casing convention for generated names.
           *
           * @default 'PascalCase'
           */
          case?: Casing;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}WebhookRequest'
           */
          name?: NameTransformer;
          /**
           * Naming pattern for generated names.
           *
           * @default '{{name}}WebhookPayload'
           */
          payload?: NameTransformer;
        };
  };

export type Config = Plugin.Name<'@hey-api/typescript'> &
  Plugin.Hooks &
  Plugin.Comments &
  Plugin.Exports &
  HeyApiTypeScriptResolvers & {
    /** Brand primitive types for nominal type safety. */
    brand: (name: string) => string | boolean;
    /** Casing convention for generated names. */
    case: Exclude<Casing, 'SCREAMING_SNAKE_CASE'>;
    /** Configuration for reusable schema definitions. */
    definitions: NamingOptions;
    /** By default, enums are emitted as types to preserve runtime-free output. */
    enums: FeatureToggle & {
      /** Casing convention for generated names. */
      case: Casing;
      /** Skip null values when generating enums as JavaScript objects. */
      constantsIgnoreNull: boolean;
      /** Specifies the output mode for generated enums. */
      mode: EnumsType;
    };
    /** Configuration for error-specific types. */
    errors: NamingOptions & {
      /** Naming pattern for generated names. */
      error: NameTransformer;
    };
    /** Configuration for request-specific types. */
    requests: NamingOptions;
    /** Configuration for response-specific types. */
    responses: NamingOptions & {
      /** Naming pattern for generated names. */
      response: NameTransformer;
    };
    /** The top type to use for untyped or unspecified schema values. */
    topType: 'any' | 'unknown';
    /** Configuration for webhook-specific types. */
    webhooks: NamingOptions & {
      /** Naming pattern for generated names. */
      payload: NameTransformer;
    };
  };

export type HeyApiTypeScriptPlugin = DefinePlugin<UserConfig, Config, IApi, TypeScriptImports>;
