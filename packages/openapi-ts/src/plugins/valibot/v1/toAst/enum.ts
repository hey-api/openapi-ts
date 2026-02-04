import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { EnumResolverContext } from '../../resolvers';
import type { Pipe, PipeResult } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { unknownToAst } from './unknown';

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

  return {
    enumMembers,
    isNullable,
  };
}

function baseNode(ctx: EnumResolverContext): PipeResult {
  const { symbols } = ctx;
  const { v } = symbols;
  const { enumMembers } = ctx.nodes.items(ctx);
  return $(v)
    .attr(identifiers.schemas.picklist)
    .call($.array(...enumMembers));
}

function nullableNode(ctx: EnumResolverContext): PipeResult | undefined {
  const { symbols } = ctx;
  const { v } = symbols;
  const { isNullable } = ctx.nodes.items(ctx);
  if (!isNullable) return;
  const currentNode = ctx.pipes.toNode(ctx.pipes.current, ctx.plugin);
  return $(v).attr(identifiers.schemas.nullable).call(currentNode);
}

function enumResolver(ctx: EnumResolverContext): PipeResult {
  const { enumMembers } = ctx.nodes.items(ctx);

  if (!enumMembers.length) {
    return ctx.pipes.current;
  }

  const baseExpression = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, baseExpression);

  const nullableExpression = ctx.nodes.nullable(ctx);
  if (nullableExpression) {
    return nullableExpression;
  }

  return ctx.pipes.current;
}

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): Pipe => {
  const v = plugin.external('valibot.v');

  const { enumMembers } = itemsNode({
    $,
    nodes: { base: baseNode, items: itemsNode, nullable: nullableNode },
    pipes: { ...pipes, current: [] },
    plugin,
    schema,
    symbols: { v },
    utils: { state },
  });

  if (!enumMembers.length) {
    return unknownToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
  }

  const ctx: EnumResolverContext = {
    $,
    nodes: {
      base: baseNode,
      items: itemsNode,
      nullable: nullableNode,
    },
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema,
    symbols: {
      v,
    },
    utils: {
      state,
    },
  };

  const resolver = plugin.config['~resolvers']?.enum;
  const node = resolver?.(ctx) ?? enumResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
};
