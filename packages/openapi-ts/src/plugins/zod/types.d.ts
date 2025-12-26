import type { Refs, Symbol } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin, SchemaWithType } from '~/plugins';
import type {
  MaybeBigInt,
  ShouldCoerceToBigInt,
} from '~/plugins/shared/utils/coerce';
import type { GetIntegerLimit } from '~/plugins/shared/utils/formats';
import type { $, DollarTsDsl, TsDsl } from '~/ts-dsl';
import type { StringCase, StringName } from '~/types/case';
import type { MaybeArray } from '~/types/utils';

import type { IApi } from './api';
import type { Chain } from './shared/chain';
import type { Ast, PluginState } from './shared/types';

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
     * @default false
     */
    metadata: boolean;
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

interface BaseResolverContext extends DollarTsDsl {
  /**
   * Functions for working with chains.
   */
  chain: {
    /**
     * The current chain.
     *
     * In Zod, this represents a chain of call expressions ("chains")
     * being assembled to form a schema definition.
     *
     * Each chain can be extended, modified, or replaced to customize
     * the resulting schema.
     */
    current: Chain;
  };
  /**
   * The plugin instance.
   */
  plugin: ZodPlugin['Instance'];
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: {
    z: Symbol;
  };
}

export interface NumberResolverContext extends BaseResolverContext {
  /**
   * Nodes used to build different parts of the number schema.
   */
  nodes: {
    base: (ctx: NumberResolverContext) => Chain;
    const: (ctx: NumberResolverContext) => Chain | undefined;
    max: (ctx: NumberResolverContext) => Chain | undefined;
    min: (ctx: NumberResolverContext) => Chain | undefined;
  };
  schema: SchemaWithType<'integer' | 'number'>;
  /**
   * Utility functions for number schema processing.
   */
  utils: {
    ast: Partial<Omit<Ast, 'typeName'>>;
    getIntegerLimit: GetIntegerLimit;
    maybeBigInt: MaybeBigInt;
    shouldCoerceToBigInt: ShouldCoerceToBigInt;
    state: Refs<PluginState>;
  };
}

export interface ObjectResolverContext extends BaseResolverContext {
  /**
   * Nodes used to build different parts of the object schema.
   */
  nodes: {
    /**
     * If `additionalProperties` is `false` or `{ type: 'never' }`, returns `null`
     * to indicate no additional properties are allowed.
     */
    additionalProperties: (
      ctx: ObjectResolverContext,
    ) => Chain | null | undefined;
    base: (ctx: ObjectResolverContext) => Chain;
    shape: (ctx: ObjectResolverContext) => ReturnType<typeof $.object>;
  };
  schema: SchemaWithType<'object'>;
  /**
   * Utility functions for object schema processing.
   */
  utils: {
    ast: Partial<Omit<Ast, 'typeName'>>;
    state: Refs<PluginState>;
  };
}

export interface StringResolverContext extends BaseResolverContext {
  /**
   * Nodes used to build different parts of the string schema.
   */
  nodes: {
    base: (ctx: StringResolverContext) => Chain;
    const: (ctx: StringResolverContext) => Chain | undefined;
    format: (ctx: StringResolverContext) => Chain | undefined;
    length: (ctx: StringResolverContext) => Chain | undefined;
    maxLength: (ctx: StringResolverContext) => Chain | undefined;
    minLength: (ctx: StringResolverContext) => Chain | undefined;
    pattern: (ctx: StringResolverContext) => Chain | undefined;
  };
  schema: SchemaWithType<'string'>;
}

export interface ValidatorResolverContext extends BaseResolverContext {
  operation: IR.Operation;
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: BaseResolverContext['symbols'] & {
    schema: Symbol;
  };
}

type ValidatorResolver = (
  ctx: ValidatorResolverContext,
) => MaybeArray<TsDsl<ts.Statement>> | null | undefined;

type Resolvers = Plugin.Resolvers<{
  /**
   * Resolver for number schemas.
   *
   * Allows customization of how number types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  number?: (ctx: NumberResolverContext) => Chain | undefined;
  /**
   * Resolver for object schemas.
   *
   * Allows customization of how object types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  object?: (ctx: ObjectResolverContext) => Chain | undefined;
  /**
   * Resolver for string schemas.
   *
   * Allows customization of how string types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  string?: (ctx: StringResolverContext) => Chain | undefined;
  /**
   * Resolvers for request and response validators.
   *
   * Allow customization of validator function bodies.
   *
   * Example path: `~resolvers.validator.request` or `~resolvers.validator.response`
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  validator?:
    | ValidatorResolver
    | {
        /**
         * Controls how the request validator function body is generated.
         *
         * Returning `undefined` will execute the default resolver logic.
         */
        request?: ValidatorResolver;
        /**
         * Controls how the response validator function body is generated.
         *
         * Returning `undefined` will execute the default resolver logic.
         */
        response?: ValidatorResolver;
      };
}>;

export type ZodPlugin = DefinePlugin<UserConfig, Config, IApi>;
