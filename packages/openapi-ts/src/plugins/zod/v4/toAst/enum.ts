import { fromRef } from '@hey-api/codegen-core';
import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';
import { pathToJsonPointer } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { EnumResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';
import { unknownToAst } from './unknown';

function itemsNode(ctx: EnumResolverContext): ReturnType<EnumResolverContext['nodes']['items']> {
  const { schema, symbols } = ctx;
  const { z } = symbols;

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
    return unknownToAst({
      path: ctx.path,
      plugin: ctx.plugin,
      schema: {
        type: 'unknown',
      },
    });
  }

  const { symbols } = ctx;
  const { z } = symbols;

  const def = ctx.plugin
    .querySymbols({
      resource: 'definition', // maybe we shouldn't hardcode definition
      resourceId: pathToJsonPointer(fromRef(ctx.path)),
      tool: 'typescript',
    })
    // find const or enum, but not const enums, because Zod doesn't support them
    .filter(
      (symbol) =>
        symbol.kind === 'var' ||
        (symbol.kind === 'enum' &&
          !(symbol.node as ReturnType<typeof $.enum>).hasModifier('const')),
    )[0];
  if (def) {
    return $(z).attr(identifiers.enum).call(def);
  }

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
  const z = plugin.external('zod.z');

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
