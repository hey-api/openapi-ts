import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { EnumResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';
import { unknownToPipes } from './unknown';

function itemsNode(ctx: EnumResolverContext): ReturnType<EnumResolverContext['nodes']['items']> {
  const { schema } = ctx;
  const { v } = ctx.plugin.imports;

  const enumMembers: Array<ReturnType<typeof $.literal>> = [];
  const literalSchemas: Array<Pipe> = [];

  for (const item of schema.items ?? []) {
    if (item.type === 'string' && typeof item.const === 'string') {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
      literalSchemas.push($(v).attr(identifiers.schemas.literal).call(literal));
    } else if (
      (item.type === 'number' || item.type === 'integer') &&
      typeof item.const === 'number'
    ) {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
      literalSchemas.push($(v).attr(identifiers.schemas.literal).call(literal));
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      const literal = $.literal(item.const);
      literalSchemas.push($(v).attr(identifiers.schemas.literal).call(literal));
    }
  }

  return { enumMembers, literalSchemas };
}

function baseNode(ctx: EnumResolverContext): PipeResult {
  const { enumMembers: picklistMembers, literalSchemas } = ctx.nodes.items(ctx);
  if (!literalSchemas.length) {
    return unknownToPipes({ path: ctx.path, plugin: ctx.plugin });
  }

  const { v } = ctx.plugin.imports;

  // skip this feature for now, requires knowing whether the enum contains safe values only, which requires special handling that we don't currently support
  // const def = ctx.plugin.querySymbol<ReturnType<typeof $.enum | typeof $.var>>(
  //   {
  //     artifact: 'types',
  //     resource: 'definition', // maybe we shouldn't hardcode definition
  //     resourceId: pathToJsonPointer(fromRef(ctx.path)),
  //   },
  //   ['EnumTsDsl', 'VarTsDsl'],
  //   // skip const enums, not supported by Valibot
  //   // skip enums with default values, requires special handling that we don't currently support
  //   (symbol) => symbol.node?.['~dsl'] !== 'EnumTsDsl' || (!symbol.node.hasModifier('const') && ctx.schema.default === undefined),
  // );
  // if (def) {
  //   return $(v).attr(identifiers.schemas.enum).call(def);
  // }

  if (picklistMembers.length > 0 && picklistMembers.length === literalSchemas.length) {
    return $(v)
      .attr(identifiers.schemas.picklist)
      .call($.array(...picklistMembers));
  }

  if (literalSchemas.length === 1) {
    return literalSchemas[0]!;
  }

  return $(v)
    .attr(identifiers.schemas.union)
    .call($.array(...literalSchemas));
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
  const v = plugin.imports.v;

  const resolverCtx: EnumResolverContext = {
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

  const resolver = plugin.config.$resolvers?.enum ?? plugin.config['~resolvers']?.enum;
  const node = resolver?.(resolverCtx) ?? enumResolver(resolverCtx);

  return resolverCtx.pipes.toNode(node, plugin);
}
