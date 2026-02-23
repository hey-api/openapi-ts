import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { EnumResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';
import { unknownToPipes } from './unknown';

function itemsNode(ctx: EnumResolverContext): ReturnType<EnumResolverContext['nodes']['items']> {
  const { schema } = ctx;
  const enumMembers: Array<ReturnType<typeof $.literal>> = [];
  let isNullable = false;

  for (const item of schema.items ?? []) {
    if (item.type === 'string' && typeof item.const === 'string') {
      enumMembers.push($.literal(item.const));
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  return { enumMembers, isNullable };
}

function baseNode(ctx: EnumResolverContext): PipeResult {
  const { symbols } = ctx;
  const { v } = symbols;
  const { enumMembers } = ctx.nodes.items(ctx);
  return $(v)
    .attr(identifiers.schemas.picklist)
    .call($.array(...enumMembers));
}

function enumResolver(ctx: EnumResolverContext): Pipes {
  const { enumMembers } = ctx.nodes.items(ctx);

  if (!enumMembers.length) {
    return ctx.pipes.current;
  }

  const baseExpression = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, baseExpression);

  return ctx.pipes.current;
}

export interface EnumToPipesResult {
  isNullable: boolean;
  pipe: Pipe;
}

export function enumToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'enum'>;
}): EnumToPipesResult {
  const v = plugin.external('valibot.v');

  const { enumMembers, isNullable } = itemsNode({
    $,
    nodes: { base: baseNode, items: itemsNode },
    pipes: { ...pipes, current: [] },
    plugin,
    schema,
    symbols: { v },
  });

  if (!enumMembers.length) {
    return {
      isNullable,
      pipe: unknownToPipes({ plugin }),
    };
  }

  const ctx: EnumResolverContext = {
    $,
    nodes: {
      base: baseNode,
      items: itemsNode,
    },
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema,
    symbols: { v },
  };

  const resolver = plugin.config['~resolvers']?.enum;
  const node = resolver?.(ctx) ?? enumResolver(ctx);

  return {
    isNullable,
    pipe: ctx.pipes.toNode(node, plugin),
  };
}
