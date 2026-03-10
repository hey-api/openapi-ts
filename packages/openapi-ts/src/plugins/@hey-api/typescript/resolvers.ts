import type { Plugin, SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';

import type { $, DollarTsDsl } from '../../../ts-dsl';
import type { Type, TypeScriptResult } from './shared/types';
import type { HeyApiTypeScriptPlugin } from './types';

export type Resolvers = Plugin.Resolvers<{
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => Type | undefined;
  /**
   * Resolver for number schemas.
   *
   * Allows customization of how number types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  number?: (ctx: NumberResolverContext) => Type | undefined;
  /**
   * Resolver for object schemas.
   *
   * Allows customization of how object types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  object?: (ctx: ObjectResolverContext) => Type | undefined;
  /**
   * Resolver for string schemas.
   *
   * Allows customization of how string types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  string?: (ctx: StringResolverContext) => Type | undefined;
}>;

interface BaseContext extends DollarTsDsl {
  /** The plugin instance. */
  plugin: HeyApiTypeScriptPlugin['Instance'];
}

export interface EnumResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base enum type expression.
     */
    base: (ctx: EnumResolverContext) => Type;
    /**
     * Returns parsed enum items with metadata about the enum members.
     */
    items: (ctx: EnumResolverContext) => {
      /**
       * String literal values for use with union types.
       */
      enumMembers: Array<ReturnType<typeof $.type.literal>>;
      /**
       * Whether the enum includes a null value.
       */
      isNullable: boolean;
    };
  };
  schema: SchemaWithType<'enum'>;
}

export interface NumberResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base number type expression.
     */
    base: (ctx: NumberResolverContext) => Type;
    /**
     * Returns the literal type for const values.
     */
    const: (ctx: NumberResolverContext) => Type | undefined;
  };
  schema: SchemaWithType<'integer' | 'number'>;
}

export interface ObjectResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base object type expression.
     */
    base: (ctx: ObjectResolverContext) => Type;
    /**
     * Returns the shape (properties) of the object type.
     */
    shape: (ctx: ObjectResolverContext) => ReturnType<typeof $.type.object>;
  };
  schema: SchemaWithType<'object'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']>;
}

export interface StringResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base string type expression.
     */
    base: (ctx: StringResolverContext) => Type;
    /**
     * Returns the literal type for const values.
     */
    const: (ctx: StringResolverContext) => Type | undefined;
    /**
     * Returns the format-specific type expression.
     */
    format: (ctx: StringResolverContext) => Type | undefined;
  };
  schema: SchemaWithType<'string'>;
}
