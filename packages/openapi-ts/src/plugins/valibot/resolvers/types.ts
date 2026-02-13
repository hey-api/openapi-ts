import type { Refs, Symbol } from '@hey-api/codegen-core';
import type { IR, Plugin, SchemaWithType } from '@hey-api/shared';

import type { MaybeBigInt, ShouldCoerceToBigInt } from '../../../plugins/shared/utils/coerce';
import type { GetIntegerLimit } from '../../../plugins/shared/utils/formats';
import type { $, DollarTsDsl } from '../../../ts-dsl';
import type { Pipe, PipeResult, Pipes, PipesUtils } from '../shared/pipes';
import type { Ast, IrSchemaToAstOptions, PluginState } from '../shared/types';

export type Resolvers = Plugin.Resolvers<{
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => PipeResult | undefined;
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

type ValidatorResolver = (ctx: ValidatorResolverContext) => PipeResult | null | undefined;

type BaseContext = DollarTsDsl &
  Pick<IrSchemaToAstOptions, 'plugin' | 'schemaExtractor'> & {
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
     * Provides access to commonly used symbols within the plugin.
     */
    symbols: {
      v: Symbol;
    };
  };

export interface EnumResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the enum schema.
   */
  nodes: {
    /**
     * Returns the base enum expression (v.picklist([...])).
     */
    base: (ctx: EnumResolverContext) => PipeResult;
    /**
     * Returns parsed enum items with metadata about the enum members.
     */
    items: (ctx: EnumResolverContext) => {
      /**
       * String literal values for use with v.picklist([...]).
       */
      enumMembers: Array<ReturnType<typeof $.literal>>;
      /**
       * Whether the enum includes a null value.
       */
      isNullable: boolean;
    };
    /**
     * Returns a nullable wrapper if the enum includes null, undefined otherwise.
     */
    nullable: (ctx: EnumResolverContext) => PipeResult | undefined;
  };
  schema: SchemaWithType<'enum'>;
  /**
   * Utility functions for enum schema processing.
   */
  utils: {
    state: Refs<PluginState>;
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
    additionalProperties: (ctx: ObjectResolverContext) => Pipe | null | undefined;
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
  operation: IR.OperationObject;
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: BaseContext['symbols'] & {
    schema: Symbol;
  };
}
