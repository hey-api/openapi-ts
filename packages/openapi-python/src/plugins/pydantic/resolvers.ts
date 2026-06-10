import type { IR, Plugin, SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';

import type { DollarPyDsl, EnumMember } from '../../py-dsl';
import type { $ } from './dsl';
import type { PydanticResult, PydanticType } from './shared/types';
import type { PydanticPlugin } from './types';

export type PydanticResolvers = Plugin.Resolvers<{
  /**
   * Resolver for array schemas.
   *
   * Allows customization of how array types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  array?: (ctx: ArrayResolverContext) => PydanticType | undefined;
  /**
   * Resolver for boolean schemas.
   *
   * Allows customization of how boolean types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  boolean?: (ctx: BooleanResolverContext) => PydanticType | undefined;
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => PydanticType | undefined;
  /**
   * Resolver for intersection schemas.
   *
   * Allows customization of how intersection types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  intersection?: (ctx: IntersectionResolverContext) => PydanticType | undefined;
  /**
   * Resolver for never schemas.
   *
   * Allows customization of how never types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  never?: (ctx: NeverResolverContext) => PydanticType | undefined;
  /**
   * Resolver for null schemas.
   *
   * Allows customization of how null types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  null?: (ctx: NullResolverContext) => PydanticType | undefined;
  /**
   * Resolver for number schemas.
   *
   * Allows customization of how number types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  number?: (ctx: NumberResolverContext) => PydanticType | undefined;
  /**
   * Resolver for object schemas.
   *
   * Allows customization of how object types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  object?: (ctx: ObjectResolverContext) => PydanticType | undefined;
  /**
   * Resolver for string schemas.
   *
   * Allows customization of how string types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  string?: (ctx: StringResolverContext) => PydanticType | undefined;
  /**
   * Resolver for tuple schemas.
   *
   * Allows customization of how tuple types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  tuple?: (ctx: TupleResolverContext) => PydanticType | undefined;
  /**
   * Resolver for undefined schemas.
   *
   * Allows customization of how undefined types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  undefined?: (ctx: UndefinedResolverContext) => PydanticType | undefined;
  /**
   * Resolver for union schemas.
   *
   * Allows customization of how union types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  union?: (ctx: UnionResolverContext) => PydanticType | undefined;
  /**
   * Resolver for unknown schemas.
   *
   * Allows customization of how unknown types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  unknown?: (ctx: UnknownResolverContext) => PydanticType | undefined;
  /**
   * Resolver for void schemas.
   *
   * Allows customization of how void types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  void?: (ctx: VoidResolverContext) => PydanticType | undefined;
}>;

export interface BaseContext
  extends DollarPyDsl, SchemaVisitorContext<PydanticPlugin['Instance']> {}

export interface ArrayResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: ArrayResolverContext) => PydanticType;
    }> {
  applyModifiers: (result: PydanticResult, opts?: { optional?: boolean }) => PydanticResult;
  childResults: Array<PydanticResult>;
  schema: SchemaWithType<'array'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
}

export interface BooleanResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: BooleanResolverContext) => PydanticType;
      const: (ctx: BooleanResolverContext) => PydanticType | undefined;
    }> {
  schema: SchemaWithType<'boolean'>;
}

export interface EnumResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: EnumResolverContext) => PydanticType;
      items: (ctx: EnumResolverContext) => {
        enumMembers: Array<EnumMember>;
        isNullable: boolean;
      };
    }> {
  schema: SchemaWithType<'enum'>;
}

export interface IntersectionResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: IntersectionResolverContext) => PydanticType;
    }> {
  applyModifiers: (result: PydanticResult, opts?: { optional?: boolean }) => PydanticResult;
  childResults: Array<PydanticResult>;
  parentSchema: IR.SchemaObject;
  schema: IR.SchemaObject;
}

export interface NeverResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: NeverResolverContext) => PydanticType;
    }> {
  schema: SchemaWithType<'never'>;
}

export interface NullResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: NullResolverContext) => PydanticType;
    }> {
  schema: SchemaWithType<'null'>;
}

export interface NumberResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: NumberResolverContext) => PydanticType;
      const: (ctx: NumberResolverContext) => PydanticType | undefined;
    }> {
  schema: SchemaWithType<'integer' | 'number'>;
}

export interface ObjectResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      additionalProperties: (ctx: ObjectResolverContext) => PydanticType | null | undefined;
      base: (ctx: ObjectResolverContext) => PydanticType;
      fields: (ctx: ObjectResolverContext) => Array<ReturnType<typeof $.field>>;
    }> {
  _childResults: Array<PydanticResult>;
  applyModifiers: (result: PydanticResult, opts: { optional?: boolean }) => PydanticResult;
  schema: SchemaWithType<'object'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
}

export interface StringResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: StringResolverContext) => PydanticType;
      const: (ctx: StringResolverContext) => PydanticType | undefined;
      format: (ctx: StringResolverContext) => PydanticType | undefined;
    }> {
  schema: SchemaWithType<'string'>;
}

export interface TupleResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: TupleResolverContext) => PydanticType;
      const: (ctx: TupleResolverContext) => PydanticType | undefined;
    }> {
  applyModifiers: (result: PydanticResult, opts?: { optional?: boolean }) => PydanticResult;
  childResults: Array<PydanticResult>;
  schema: SchemaWithType<'tuple'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
}

export interface UndefinedResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: UndefinedResolverContext) => PydanticType;
    }> {
  schema: SchemaWithType<'undefined'>;
}

export interface UnionResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: UnionResolverContext) => PydanticType;
    }> {
  applyModifiers: (result: PydanticResult, opts?: { optional?: boolean }) => PydanticResult;
  childResults: Array<PydanticResult>;
  parentSchema: IR.SchemaObject;
  schema: IR.SchemaObject;
  schemas: ReadonlyArray<IR.SchemaObject>;
}

export interface UnknownResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: UnknownResolverContext) => PydanticType;
    }> {
  schema: SchemaWithType<'unknown'>;
}

export interface VoidResolverContext
  extends
    BaseContext,
    Plugin.ResolverNodes<{
      base: (ctx: VoidResolverContext) => PydanticType;
    }> {
  schema: SchemaWithType<'void'>;
}
