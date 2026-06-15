import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { EnumResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';
import { unknownToAst } from './unknown';

function itemsNode(ctx: EnumResolverContext): ReturnType<EnumResolverContext['nodes']['items']> {
  const { schema } = ctx;
  const { z } = ctx.plugin.imports;

  const enumMembers: Array<ReturnType<typeof $.literal>> = [];
  const literalSchemas: Array<Chain> = [];

  for (const item of schema.items ?? []) {
    if (item.type === 'string' && typeof item.const === 'string') {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
      literalSchemas.push($(z).attr(identifiers.literal).call(literal));
    } else if (
      (item.type === 'number' || item.type === 'integer') &&
      typeof item.const === 'number'
    ) {
      const literal = $.literal(item.const);
      literalSchemas.push($(z).attr(identifiers.literal).call(literal));
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      const literal = $.literal(item.const);
      literalSchemas.push($(z).attr(identifiers.literal).call(literal));
    }
  }

  return { enumMembers, literalSchemas };
}

function baseNode(ctx: EnumResolverContext): Chain {
  const { enumMembers, literalSchemas } = ctx.nodes.items(ctx);
  if (!literalSchemas.length) {
    return unknownToAst({ path: ctx.path, plugin: ctx.plugin });
  }

  const { z } = ctx.plugin.imports;

  // skip this feature for now, requires knowing whether the enum contains safe values only, which requires special handling that we don't currently support
  // const def = ctx.plugin.querySymbol<ReturnType<typeof $.enum | typeof $.var>>(
  //   {
  //     artifact: 'types',
  //     resource: 'definition', // maybe we shouldn't hardcode definition
  //     resourceId: pathToJsonPointer(fromRef(ctx.path)),
  //   },
  //   ['EnumTsDsl', 'VarTsDsl'],
  //   // skip const enums, not supported by Zod
  //   // skip enums with default values, requires special handling that we don't currently support
  //   (symbol) => symbol.node?.['~dsl'] !== 'EnumTsDsl' || (!symbol.node.hasModifier('const') && ctx.schema.default === undefined),
  // );
  // if (def) {
  //   return $(z).attr(identifiers.enum).call(def);
  // }

  if (enumMembers.length > 0 && enumMembers.length === literalSchemas.length) {
    return $(z)
      .attr(identifiers.enum)
      .call($.array(...enumMembers));
  }

  if (literalSchemas.length === 1) {
    return literalSchemas[0]!;
  }

  return $(z)
    .attr(identifiers.union)
    .call($.array(...literalSchemas));
}

function enumResolver(ctx: EnumResolverContext): Chain {
  const baseExpression = ctx.nodes.base(ctx);
  ctx.chain.current = baseExpression;

  return ctx.chain.current;
}

export function enumToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ZodPlugin['Instance']> & {
  schema: SchemaWithType<'enum'>;
}): Chain {
  const z = plugin.imports.z;

  const ctx: EnumResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    nodes: {
      base: baseNode,
      items: itemsNode,
    },
    path,
    plugin,
    schema,
    symbols: {
      z,
    },
  };

  const resolver = plugin.config['~resolvers']?.enum;
  return resolver?.(ctx) ?? enumResolver(ctx);
}
