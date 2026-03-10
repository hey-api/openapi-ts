import type { Plugin, SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';

import type { DollarPyDsl } from '../../py-dsl';
import type { PydanticField, PydanticFinal, PydanticResult, PydanticType } from './shared/types';
import type { PydanticPlugin } from './types';

export type Resolvers = Plugin.Resolvers<{
  /**
   * Resolver for enum schemas.
   *
   * Allows customization of how enum types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  enum?: (ctx: EnumResolverContext) => PydanticType | undefined;
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
  object?: (
    ctx: ObjectResolverContext,
  ) => (PydanticType & { fields?: Array<PydanticField> }) | undefined;
  /**
   * Resolver for string schemas.
   *
   * Allows customization of how string types are rendered.
   *
   * Returning `undefined` will execute the default resolver logic.
   */
  string?: (ctx: StringResolverContext) => PydanticType | undefined;
}>;

interface BaseContext extends DollarPyDsl {
  /** The plugin instance. */
  plugin: PydanticPlugin['Instance'];
}

export interface EnumResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: EnumResolverContext) => PydanticType;
    items: (ctx: EnumResolverContext) => {
      enumMembers: Required<PydanticFinal>['enumMembers'];
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
    base: (ctx: NumberResolverContext) => PydanticType;
    const: (ctx: NumberResolverContext) => PydanticType | undefined;
  };
  schema: SchemaWithType<'integer' | 'number'>;
}

export interface ObjectResolverContext extends BaseContext {
  _childResults: Array<PydanticResult>;
  applyModifiers: (result: PydanticResult, opts: { optional?: boolean }) => PydanticFinal;
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    additionalProperties: (ctx: ObjectResolverContext) => PydanticType | null | undefined;
    base: (ctx: ObjectResolverContext) => PydanticType & { fields?: Array<PydanticField> };
    fields: (ctx: ObjectResolverContext) => Array<PydanticField>;
  };
  schema: SchemaWithType<'object'>;
  walk: Walker<PydanticResult, PydanticPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<PydanticPlugin['Instance']>;
}

export interface StringResolverContext extends BaseContext {
  /**
   * Nodes used to build different parts of the result.
   */
  nodes: {
    base: (ctx: StringResolverContext) => PydanticType;
    const: (ctx: StringResolverContext) => PydanticType | undefined;
  };
  schema: SchemaWithType<'string'>;
}
