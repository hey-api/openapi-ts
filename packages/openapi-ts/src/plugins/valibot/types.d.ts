import type { Refs, Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import type { DefinePlugin, Plugin, SchemaWithType } from '~/plugins';
import type {
  MaybeBigInt,
  ShouldCoerceToBigInt,
} from '~/plugins/shared/utils/coerce';
import type { GetIntegerLimit } from '~/plugins/shared/utils/formats';
import type { $, DollarTsDsl } from '~/ts-dsl';
import type { StringCase, StringName } from '~/types/case';

import type { IApi } from './api';
import type { Pipe, PipeResult, PipesUtils } from './shared/pipes';
import type { Ast, PluginState } from './shared/types';

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

interface BaseResolverContext extends DollarTsDsl {
  /**
   * Functions for working with pipes.
   */
  pipes: PipesUtils & {
    /**
     * The current pipe.
     *
     * In Valibot, this represents a list of call expressions ("pipes")
     * being assembled to form a schema definition.
     *
     * Each pipe can be extended, modified, or replaced to customize
     * the resulting schema.
     */
    current: Pipes;
  };
  /**
   * The plugin instance.
   */
  plugin: ValibotPlugin['Instance'];
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: {
    v: Symbol;
  };
}

export interface NumberResolverContext extends BaseResolverContext {
  /**
   * Nodes used to build different parts of the number schema.
   */
  nodes: {
    base: (ctx: NumberResolverContext) => PipeResult;
    const: (ctx: NumberResolverContext) => PipeResult | undefined;
    max: (ctx: NumberResolverContext) => PipeResult | undefined;
    min: (ctx: NumberResolverContext) => PipeResult | undefined;
  };
  schema: SchemaWithType<'integer' | 'number'>;
  /**
   * Utility functions for number schema processing.
   */
  utils: {
    getIntegerLimit: GetIntegerLimit;
    maybeBigInt: MaybeBigInt;
    shouldCoerceToBigInt: ShouldCoerceToBigInt;
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
    ) => Pipe | null | undefined;
    base: (ctx: ObjectResolverContext) => PipeResult;
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
    base: (ctx: StringResolverContext) => PipeResult;
    const: (ctx: StringResolverContext) => PipeResult | undefined;
    format: (ctx: StringResolverContext) => PipeResult | undefined;
    length: (ctx: StringResolverContext) => PipeResult | undefined;
    maxLength: (ctx: StringResolverContext) => PipeResult | undefined;
    minLength: (ctx: StringResolverContext) => PipeResult | undefined;
    pattern: (ctx: StringResolverContext) => PipeResult | undefined;
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
) => PipeResult | null | undefined;

type Resolvers = Plugin.Resolvers<{
  /**
   * Resolver for number schemas.
   *
   * Allows customization of how number types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  number?: (ctx: NumberResolverContext) => PipeResult | undefined;
  /**
   * Resolver for object schemas.
   *
   * Allows customization of how object types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  object?: (ctx: ObjectResolverContext) => PipeResult | undefined;
  /**
   * Resolver for string schemas.
   *
   * Allows customization of how string types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  string?: (ctx: StringResolverContext) => PipeResult | undefined;
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

export type ValibotPlugin = DefinePlugin<UserConfig, Config, IApi>;
