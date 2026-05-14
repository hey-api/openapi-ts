import { fromRef } from '@hey-api/codegen-core';
import { pathToJsonPointer, type SchemaVisitorContext, type SchemaWithType } from '@hey-api/shared';

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

  for (const item of schema.items ?? []) {
    if (item.type === 'string' && typeof item.const === 'string') {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
    } else if (
      (item.type === 'number' || item.type === 'integer') &&
      typeof item.const === 'number'
    ) {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
    }
  }

  return { enumMembers };
}

function baseNode(ctx: EnumResolverContext): PipeResult {
  const { enumMembers } = ctx.nodes.items(ctx);
  if (!enumMembers.length) {
    return unknownToPipes({ path: ctx.path, plugin: ctx.plugin });
  }

  const { symbols } = ctx;
  const { v } = symbols;

  const def = ctx.plugin
    .querySymbols({
      resource: 'definition', // maybe we shouldn't hardcode definition
      resourceId: pathToJsonPointer(fromRef(ctx.path)),
      tool: 'typescript',
    })
    // find const or enum, but not const enums, because Valibot doesn't support them
    .filter(
      (symbol) =>
        symbol.kind === 'var' ||
        (symbol.kind === 'enum' &&
          !(symbol.node as ReturnType<typeof $.enum>).hasModifier('const')),
    )[0];
  if (def) {
    return $(v).attr(identifiers.schemas.enum).call(def);
  }

  return $(v)
    .attr(identifiers.schemas.picklist)
    .call($.array(...enumMembers));
}

function enumResolver(ctx: EnumResolverContext): Pipes {
  const baseExpression = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, baseExpression);

  return ctx.pipes.current;
}

export function enumToPipes({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ValibotPlugin['Instance']> & {
  schema: SchemaWithType<'enum'>;
}): Pipe {
  const v = plugin.external('valibot.v');

  const ctx: EnumResolverContext = {
    $,
    nodes: {
      base: baseNode,
      items: itemsNode,
    },
    path,
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

  return ctx.pipes.toNode(node, plugin);
}
