import type { Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin } from '~/plugins';
import type { $, DollarTsDsl, TsDsl } from '~/ts-dsl';
import type { StringCase, StringName } from '~/types/case';
import type { MaybeArray } from '~/types/utils';

import type { IApi } from './api';

export type UserConfig = Plugin.Name<'zod'> &
  Plugin.Hooks &
  Resolvers & {
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
     * Can be:
     * - `false` or `undefined`: No metadata generation (default)
     * - `true` or `'global'`: Use `.register(z.globalRegistry, {...})` for backwards compatibility
     * - `'local'`: Use `.meta({...})` method (Zod v4 only)
     *
     * Metadata includes: description, title, deprecated, and examples from OpenAPI spec.
     *
     * @default false
     */
    metadata?: boolean | 'global' | 'local';
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
  Plugin.Hooks &
  Resolvers & {
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
     * Can be:
     * - `false`: No metadata generation (default)
     * - `true` or `'global'`: Use `.register(z.globalRegistry, {...})` for backwards compatibility
     * - `'local'`: Use `.meta({...})` method (Zod v4 only)
     *
     * Metadata includes: description, title, deprecated, and examples from OpenAPI spec.
     *
     * @default false
     */
    metadata: boolean | 'global' | 'local';
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

type SharedResolverArgs = DollarTsDsl & {
  /**
   * The current fluent builder chain under construction for this resolver.
   *
   * Represents the in-progress call sequence (e.g., a Zod or DSL chain)
   * that defines the current schema or expression being generated.
   *
   * This chain can be extended, transformed, or replaced entirely to customize
   * the resulting output of the resolver.
   */
  chain?: ReturnType<typeof $.call>;
  plugin: ZodPlugin['Instance'];
};

export type FormatResolverArgs = Required<SharedResolverArgs> & {
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
     * property schema, allowing the resolver to choose the correct Zod
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
     * generation logic for that format.
     */
    formats?: Record<
      string,
      (args: FormatResolverArgs) => ReturnType<typeof $.call> | undefined
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

export type ZodPlugin = DefinePlugin<UserConfig, Config, IApi>;
