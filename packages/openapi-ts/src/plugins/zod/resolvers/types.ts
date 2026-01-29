import type { Refs, Symbol } from '@hey-api/codegen-core';
import type { IR } from '@hey-api/shared';
import type { MaybeArray } from '@hey-api/types';
import type ts from 'typescript';

import type { Plugin, SchemaWithType } from '../../../plugins';
import type { MaybeBigInt, ShouldCoerceToBigInt } from '../../../plugins/shared/utils/coerce';
import type { GetIntegerLimit } from '../../../plugins/shared/utils/formats';
import type { $, DollarTsDsl, TsDsl } from '../../../ts-dsl';
import type { Chain } from '../shared/chain';
import type { Ast, PluginState } from '../shared/types';
import type { ZodPlugin } from '../types';

export type Resolvers = Plugin.Resolvers<{
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => Chain | undefined;
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

type ValidatorResolver = (
  ctx: ValidatorResolverContext,
) => MaybeArray<TsDsl<ts.Statement>> | null | undefined;

interface BaseContext extends DollarTsDsl {
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

export interface EnumResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the enum schema.
   */
  nodes: {
    /**
     * Returns the base enum expression (z.enum([...]) or z.union([...]) for mixed types).
     */
    base: (ctx: EnumResolverContext) => Chain;
    /**
     * Returns parsed enum items with metadata about the enum members.
     */
    items: (ctx: EnumResolverContext) => {
      /**
       * Whether all enum items are strings (determines if z.enum can be used).
       */
      allStrings: boolean;
      /**
       * String literal values for use with z.enum([...]).
       */
      enumMembers: Array<ReturnType<typeof $.literal>>;
      /**
       * Whether the enum includes a null value.
       */
      isNullable: boolean;
      /**
       * z.literal(...) expressions for each non-null enum value.
       */
      literalMembers: Array<Chain>;
    };
    /**
     * Returns a nullable wrapper if the enum includes null, undefined otherwise.
     */
    nullable: (ctx: EnumResolverContext) => Chain | undefined;
  };
  schema: SchemaWithType<'enum'>;
  /**
   * Utility functions for enum schema processing.
   */
  utils: {
    ast: Partial<Omit<Ast, 'typeName'>>;
    state: Refs<PluginState>;
  };
}

export interface NumberResolverContext extends BaseContext {
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

export interface ObjectResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the object schema.
   */
  nodes: {
    /**
     * If `additionalProperties` is `false` or `{ type: 'never' }`, returns `null`
     * to indicate no additional properties are allowed.
     */
    additionalProperties: (ctx: ObjectResolverContext) => Chain | null | undefined;
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

export interface StringResolverContext extends BaseContext {
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

export interface ValidatorResolverContext extends BaseContext {
  operation: IR.OperationObject;
  /**
   * Provides access to commonly used symbols within the plugin.
   */
  symbols: BaseContext['symbols'] & {
    schema: Symbol;
  };
}
