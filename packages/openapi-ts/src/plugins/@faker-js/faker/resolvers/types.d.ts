// TODO: later
import type { Symbol } from '@hey-api/codegen-core';

import type { Plugin, SchemaWithType } from '~/plugins';
import type { $, DollarTsDsl } from '~/ts-dsl';

import type { FakerJsFakerPlugin } from '../types';

type Expression = ReturnType<typeof $.expr>;

export type Resolvers = Plugin.Resolvers<{
  array?: (ctx: ArrayResolverContext) => Expression | undefined;
  number?: (ctx: NumberResolverContext) => Expression | undefined;
  object?: (ctx: ObjectResolverContext) => Expression | undefined;
  string?: (ctx: StringResolverContext) => Expression | undefined;
}>;

interface BaseContext extends DollarTsDsl {
  plugin: FakerJsFakerPlugin['Instance'];
  symbols: {
    faker: Symbol;
  };
}

export interface ArrayResolverContext extends BaseContext {
  nodes: {
    items: (ctx: ArrayResolverContext) => Expression;
    length: (ctx: ArrayResolverContext) => Expression | undefined;
  };
  schema: SchemaWithType<'array'>;
}

export interface NumberResolverContext extends BaseContext {
  nodes: {
    base: (ctx: NumberResolverContext) => Expression;
    max: (ctx: NumberResolverContext) => Expression | undefined;
    min: (ctx: NumberResolverContext) => Expression | undefined;
  };
  schema: SchemaWithType<'integer' | 'number'>;
}

export interface ObjectResolverContext extends BaseContext {
  nodes: {
    properties: (ctx: ObjectResolverContext) => Expression;
  };
  schema: SchemaWithType<'object'>;
}

export interface StringResolverContext extends BaseContext {
  nodes: {
    base: (ctx: StringResolverContext) => Expression;
    format: (ctx: StringResolverContext) => Expression | undefined;
    pattern: (ctx: StringResolverContext) => Expression | undefined;
  };
  schema: SchemaWithType<'string'>;
}
