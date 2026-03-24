import type { IR, Plugin, SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';

import type { $, DollarTsDsl } from '../../../ts-dsl';
import type { Type, TypeScriptResult } from './shared/types';
import type { HeyApiTypeScriptPlugin } from './types';

export type HeyApiTypeScriptResolvers = Plugin.Resolvers<{
  /**
   * Resolver for array schemas.
   *
   * Allows customization of how array types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  array?: (ctx: ArrayResolverContext) => Type | undefined;
  /**
   * Resolver for boolean schemas.
   *
   * Allows customization of how boolean types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  boolean?: (ctx: BooleanResolverContext) => Type | undefined;
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => Type | undefined;
  /**
   * Resolver for intersection schemas.
   *
   * Allows customization of how intersection types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  intersection?: (ctx: IntersectionResolverContext) => Type | undefined;
  /**
   * Resolver for never schemas.
   *
   * Allows customization of how never types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  never?: (ctx: NeverResolverContext) => Type | undefined;
  /**
   * Resolver for null schemas.
   *
   * Allows customization of how null types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  null?: (ctx: NullResolverContext) => Type | undefined;
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
  /**
   * Resolver for tuple schemas.
   *
   * Allows customization of how tuple types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  tuple?: (ctx: TupleResolverContext) => Type | undefined;
  /**
   * Resolver for undefined schemas.
   *
   * Allows customization of how undefined types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  undefined?: (ctx: UndefinedResolverContext) => Type | undefined;
  /**
   * Resolver for union schemas.
   *
   * Allows customization of how union types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  union?: (ctx: UnionResolverContext) => Type | undefined;
  /**
   * Resolver for unknown schemas.
   *
   * Allows customization of how unknown types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  unknown?: (ctx: UnknownResolverContext) => Type | undefined;
  /**
   * Resolver for void schemas.
   *
   * Allows customization of how void types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  void?: (ctx: VoidResolverContext) => Type | undefined;
}>;

interface BaseContext extends DollarTsDsl {
  /** The plugin instance. */
  plugin: HeyApiTypeScriptPlugin['Instance'];
}

export interface ArrayResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base array type expression.
     */
    base: (ctx: ArrayResolverContext) => Type;
  };
  schema: SchemaWithType<'array'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']>;
}

export interface BooleanResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base boolean type expression.
     */
    base: (ctx: BooleanResolverContext) => Type;
    /**
     * Returns the literal type for const values.
     */
    const: (ctx: BooleanResolverContext) => Type | undefined;
  };
  schema: SchemaWithType<'boolean'>;
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

export interface IntersectionResolverContext extends BaseContext {
  /**
   * The child results from walking intersection members.
   */
  childResults: ReadonlyArray<TypeScriptResult>;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base intersection type expression.
     */
    base: (ctx: IntersectionResolverContext) => Type;
  };
  /**
   * The parent schema containing the intersection.
   */
  parentSchema: IR.SchemaObject;
  /**
   * The individual schemas being intersected.
   */
  schemas: ReadonlyArray<IR.SchemaObject>;
}

export interface NeverResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base never type expression.
     */
    base: (ctx: NeverResolverContext) => Type;
  };
  schema: SchemaWithType<'never'>;
}

export interface NullResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base null type expression.
     */
    base: (ctx: NullResolverContext) => Type;
  };
  schema: SchemaWithType<'null'>;
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

export interface TupleResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base tuple type expression.
     */
    base: (ctx: TupleResolverContext) => Type;
    /**
     * Returns the literal type for const tuple values.
     */
    const: (ctx: TupleResolverContext) => Type | undefined;
  };
  schema: SchemaWithType<'tuple'>;
  walk: Walker<TypeScriptResult, HeyApiTypeScriptPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']>;
}

export interface UnionResolverContext extends BaseContext {
  /**
   * The child results from walking union members.
   */
  childResults: ReadonlyArray<TypeScriptResult>;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base union type expression.
     */
    base: (ctx: UnionResolverContext) => Type;
  };
  /**
   * The parent schema containing the union.
   */
  parentSchema: IR.SchemaObject;
  /**
   * The individual schemas being unioned.
   */
  schemas: ReadonlyArray<IR.SchemaObject>;
}

export interface UndefinedResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base undefined type expression.
     */
    base: (ctx: UndefinedResolverContext) => Type;
  };
  schema: SchemaWithType<'undefined'>;
}

export interface UnknownResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base unknown type expression.
     */
    base: (ctx: UnknownResolverContext) => Type;
  };
  schema: SchemaWithType<'unknown'>;
}

export interface VoidResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    /**
     * Returns the base void type expression.
     */
    base: (ctx: VoidResolverContext) => Type;
  };
  schema: SchemaWithType<'void'>;
}
