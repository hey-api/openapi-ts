import type { Refs, Symbol } from '@hey-api/codegen-core';

import type { IR } from '~/ir/types';
import type { Plugin, SchemaWithType } from '~/plugins';
import type {
  MaybeBigInt,
  ShouldCoerceToBigInt,
} from '~/plugins/shared/utils/coerce';
import type { GetIntegerLimit } from '~/plugins/shared/utils/formats';
import type { $, DollarTsDsl } from '~/ts-dsl';

import type { Pipe, PipeResult, Pipes, PipesUtils } from '../shared/pipes';
import type { Ast, PluginState } from '../shared/types';
import type { ValibotPlugin } from '../types';

export type Resolvers = Plugin.Resolvers<{
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

type ValidatorResolver = (
  ctx: ValidatorResolverContext,
) => PipeResult | null | undefined;

interface BaseContext extends DollarTsDsl {
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

export interface NumberResolverContext extends BaseContext {
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

export interface ObjectResolverContext extends BaseContext {
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

export interface StringResolverContext extends BaseContext {
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

export interface ValidatorResolverContext extends BaseContext {
  operation: IR.Operation;
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: BaseContext['symbols'] & {
    schema: Symbol;
  };
}
