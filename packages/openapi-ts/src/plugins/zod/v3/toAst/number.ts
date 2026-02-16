import type { SchemaWithType } from '@hey-api/shared';

import { maybeBigInt, shouldCoerceToBigInt } from '../../../../plugins/shared/utils/coerce';
import { getIntegerLimit } from '../../../../plugins/shared/utils/formats';
import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { NumberResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

function baseNode(ctx: NumberResolverContext): Chain {
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (ctx.utils.shouldCoerceToBigInt(schema.format)) {
    return $(z).attr(identifiers.coerce).attr(identifiers.bigint).call();
  }
  let chain = $(z).attr(identifiers.number).call();
  if (schema.type === 'integer') {
    chain = chain.attr(identifiers.int).call();
  }
  return chain;
}

function constNode(ctx: NumberResolverContext): Chain | undefined {
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (schema.const === undefined) return;
  return $(z).attr(identifiers.literal).call(ctx.utils.maybeBigInt(schema.const, schema.format));
}

function maxNode(ctx: NumberResolverContext): Chain | undefined {
  const { chain, schema } = ctx;
  if (schema.exclusiveMaximum !== undefined) {
    return chain.current
      .attr(identifiers.lt)
      .call(ctx.utils.maybeBigInt(schema.exclusiveMaximum, schema.format));
  }
  if (schema.maximum !== undefined) {
    return chain.current
      .attr(identifiers.lte)
      .call(ctx.utils.maybeBigInt(schema.maximum, schema.format));
  }
  const limit = ctx.utils.getIntegerLimit(schema.format);
  if (limit) {
    return chain.current
      .attr(identifiers.max)
      .call(
        ctx.utils.maybeBigInt(limit.maxValue, schema.format),
        $.object().prop('message', $.literal(limit.maxError)),
      );
  }
  return;
}

function minNode(ctx: NumberResolverContext): Chain | undefined {
  const { chain, schema } = ctx;
  if (schema.exclusiveMinimum !== undefined) {
    return chain.current
      .attr(identifiers.gt)
      .call(ctx.utils.maybeBigInt(schema.exclusiveMinimum, schema.format));
  }
  if (schema.minimum !== undefined) {
    return chain.current
      .attr(identifiers.gte)
      .call(ctx.utils.maybeBigInt(schema.minimum, schema.format));
  }
  const limit = ctx.utils.getIntegerLimit(schema.format);
  if (limit) {
    return chain.current
      .attr(identifiers.min)
      .call(
        ctx.utils.maybeBigInt(limit.minValue, schema.format),
        $.object().prop('message', $.literal(limit.minError)),
      );
  }
  return;
}

function numberResolver(ctx: NumberResolverContext): Chain {
  const constNode = ctx.nodes.const(ctx);
  if (constNode) {
    ctx.chain.current = constNode;
    return ctx.chain.current;
  }

  const baseNode = ctx.nodes.base(ctx);
  if (baseNode) ctx.chain.current = baseNode;

  const minNode = ctx.nodes.min(ctx);
  if (minNode) ctx.chain.current = minNode;

  const maxNode = ctx.nodes.max(ctx);
  if (maxNode) ctx.chain.current = maxNode;

  return ctx.chain.current;
}

export function numberToNode({
  plugin,
  schema,
  state,
}: Pick<IrSchemaToAstOptions, 'plugin' | 'state'> & {
  schema: SchemaWithType<'integer' | 'number'>;
}): Chain {
  const ast: Partial<Omit<Ast, 'typeName'>> = {};
  const z = plugin.external('zod.z');
  const ctx: NumberResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    nodes: {
      base: baseNode,
      const: constNode,
      max: maxNode,
      min: minNode,
    },
    plugin,
    schema,
    symbols: {
      z,
    },
    utils: {
      ast,
      getIntegerLimit,
      maybeBigInt,
      shouldCoerceToBigInt,
      state,
    },
  };
  const resolver = plugin.config['~resolvers']?.number;
  const node = resolver?.(ctx) ?? numberResolver(ctx);
  return node;
}
