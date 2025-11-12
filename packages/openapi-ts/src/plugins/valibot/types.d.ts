import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin } from '~/plugins';
import type { CallTsDsl, DollarTsDsl } from '~/ts-dsl';
import type { StringCase, StringName } from '~/types/case';

import type { IApi } from './api';

export type UserConfig = Plugin.Name<'valibot'> &
  Plugin.Hooks &
  Resolvers & {
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

export type Config = Plugin.Name<'valibot'> &
  Plugin.Hooks &
  Resolvers & {
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

export type FormatResolverArgs = DollarTsDsl & {
  /**
   * The current builder state being processed by this resolver.
   *
   * In Valibot, this represents the current list of call expressions ("pipes")
   * being assembled to form a schema definition.
   *
   * Each pipe can be extended, modified, or replaced to customize how the
   * resulting schema is constructed. Returning `undefined` from a resolver will
   * use the default generation behavior.
   */
  pipes: Array<CallTsDsl>;
  plugin: ValibotPlugin['Instance'];
  schema: IR.SchemaObject;
};

type Resolvers = Plugin.Resolvers<{
  /**
   * Resolvers for string schemas.
   *
   * Allows customization of how string types are rendered, including
   * per-format handling.
   */
  string?: {
    /**
     * Resolvers for string formats (e.g., `uuid`, `email`, `date-time`).
     *
     * Each key represents a specific format name with a custom
     * resolver function that controls how that format is rendered.
     *
     * Example path: `~resolvers.string.formats.uuid`
     *
     * Returning `undefined` from a resolver will apply the default
     * generation behavior for that format.
     */
    formats?: Record<
      string,
      (args: FormatResolverArgs) => boolean | number | undefined
    >;
  };
}>;

export type ValibotPlugin = DefinePlugin<UserConfig, Config, IApi>;
