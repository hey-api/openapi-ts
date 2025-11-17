import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin } from '~/plugins';
import type { $, DollarTsDsl, TsDsl } from '~/ts-dsl';
import type { StringCase, StringName } from '~/types/case';
import type { MaybeArray } from '~/types/utils';

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

type SharedResolverArgs = DollarTsDsl & {
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
  pipes: Array<ReturnType<typeof $.call>>;
  plugin: ValibotPlugin['Instance'];
};

export type FormatResolverArgs = SharedResolverArgs & {
  schema: IR.SchemaObject;
};

export type ObjectBaseResolverArgs = SharedResolverArgs & {
  /** Null = never */
  additional?: ReturnType<typeof $.call | typeof $.expr> | null;
  schema: IR.SchemaObject;
  shape: ReturnType<typeof $.object>;
};

export type ValidatorResolverArgs = SharedResolverArgs & {
  operation: IR.Operation;
  schema: Symbol;
  v: Symbol;
};

type ValidatorResolver = (
  args: ValidatorResolverArgs,
) => MaybeArray<TsDsl<ts.Statement>> | null | undefined;

type Resolvers = Plugin.Resolvers<{
  /**
   * Resolvers for object schemas.
   *
   * Allows customization of how object types are rendered.
   *
   * Example path: `~resolvers.object.base`
   *
   * Returning `undefined` from a resolver will apply the default
   * generation behavior for the object schema.
   */
  object?: {
    /**
     * Controls how object schemas are constructed.
     *
     * Called with the fully assembled shape (properties) and any additional
     * property schema, allowing the resolver to choose the correct Valibot
     * base constructor and modify the schema chain if needed.
     *
     * Returning `undefined` will execute the default resolver logic.
     */
    base?: (
      args: ObjectBaseResolverArgs,
    ) => ReturnType<typeof $.call> | undefined;
  };
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
  /**
   * Resolvers for request and response validators.
   *
   * Allow customization of validator function bodies.
   *
   * Example path: `~resolvers.validator.request` or `~resolvers.validator.response`
   *
   * Returning `undefined` from a resolver will apply the default generation logic.
   */
  validator?:
    | ValidatorResolver
    | {
        /**
         * Controls how the request validator function body is generated.
         *
         * Returning `undefined` will fall back to the default `.await().return()` logic.
         */
        request?: ValidatorResolver;
        /**
         * Controls how the response validator function body is generated.
         *
         * Returning `undefined` will fall back to the default `.await().return()` logic.
         */
        response?: ValidatorResolver;
      };
}>;

export type ValibotPlugin = DefinePlugin<UserConfig, Config, IApi>;
