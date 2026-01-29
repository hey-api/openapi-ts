import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { EnumResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { unknownToAst } from './unknown';

function itemsNode(
  ctx: EnumResolverContext,
): ReturnType<EnumResolverContext['nodes']['items']> {
  const { schema, symbols } = ctx;
  const { z } = symbols;

  const enumMembers: Array<ReturnType<typeof $.literal>> = [];
  const literalMembers: Array<Chain> = [];

  let isNullable = false;
  let allStrings = true;

  for (const item of schema.items ?? []) {
    if (item.type === 'string' && typeof item.const === 'string') {
      const literal = $.literal(item.const);
      enumMembers.push(literal);
      literalMembers.push($(z).attr(identifiers.literal).call(literal));
    } else if (
      (item.type === 'number' || item.type === 'integer') &&
      typeof item.const === 'number'
    ) {
      allStrings = false;
      const literal = $.literal(item.const);
      literalMembers.push($(z).attr(identifiers.literal).call(literal));
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      allStrings = false;
      const literal = $.literal(item.const);
      literalMembers.push($(z).attr(identifiers.literal).call(literal));
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  return {
    allStrings,
    enumMembers,
    isNullable,
    literalMembers,
  };
}

function baseNode(ctx: EnumResolverContext): Chain {
  const { symbols } = ctx;
  const { z } = symbols;
  const { allStrings, enumMembers, literalMembers } = ctx.nodes.items(ctx);

  if (allStrings && enumMembers.length > 0) {
    return $(z)
      .attr(identifiers.enum)
      .call($.array(...enumMembers));
  } else if (literalMembers.length === 1) {
    return literalMembers[0]!;
  } else {
    return $(z)
      .attr(identifiers.union)
      .call($.array(...literalMembers));
  }
}

function nullableNode(ctx: EnumResolverContext): Chain | undefined {
  const { chain } = ctx;
  const { isNullable } = ctx.nodes.items(ctx);
  if (!isNullable) return;
  return chain.current.attr(identifiers.nullable).call();
}

function enumResolver(ctx: EnumResolverContext): Chain {
  const { literalMembers } = ctx.nodes.items(ctx);

  if (!literalMembers.length) {
    return ctx.chain.current;
  }

  const baseExpression = ctx.nodes.base(ctx);
  ctx.chain.current = baseExpression;

  const nullableExpression = ctx.nodes.nullable(ctx);
  if (nullableExpression) {
    ctx.chain.current = nullableExpression;
  }

  return ctx.chain.current;
}

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): Chain => {
  const z = plugin.external('zod.z');

  const { literalMembers } = itemsNode({
    $,
    chain: { current: $(z) },
    nodes: { base: baseNode, items: itemsNode, nullable: nullableNode },
    plugin,
    schema,
    symbols: { z },
    utils: { ast: {}, state },
  });

  if (!literalMembers.length) {
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
    chain: {
      current: $(z),
    },
    nodes: {
      base: baseNode,
      items: itemsNode,
      nullable: nullableNode,
    },
    plugin,
    schema,
    symbols: {
      z,
    },
    utils: {
      ast: {},
      state,
    },
  };

  const resolver = plugin.config['~resolvers']?.enum;
  return resolver?.(ctx) ?? enumResolver(ctx);
};
