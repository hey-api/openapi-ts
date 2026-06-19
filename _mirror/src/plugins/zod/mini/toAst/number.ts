import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { maybeBigInt, shouldCoerceToBigInt } from '../../../shared/utils/coerce';
import { getIntegerLimit } from '../../../shared/utils/formats';
import { identifiers } from '../../constants';
import type { NumberResolverContext } from '../../resolvers';
import type { Chain, ChainResult } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

function baseNode(ctx: NumberResolverContext): Chain {
  const { schema } = ctx;
  const { z } = ctx.plugin.imports;
  if (ctx.utils.shouldCoerceToBigInt(schema.format)) {
    return $(z).attr(identifiers.coerce).attr(identifiers.bigint).call();
  }
  let chain = $(z).attr(identifiers.number).call();
  if (schema.type === 'integer') {
    chain = $(z).attr(identifiers.int).call();
  }
  return chain;
}

function constNode(ctx: NumberResolverContext): ChainResult {
  const { schema } = ctx;
  const { z } = ctx.plugin.imports;
  if (schema.const === undefined) return;
  return $(z).attr(identifiers.literal).call(ctx.utils.maybeBigInt(schema.const, schema.format));
}

function maxNode(ctx: NumberResolverContext): ChainResult {
  const { schema } = ctx;
  const { z } = ctx.plugin.imports;
  if (schema.exclusiveMaximum !== undefined) {
    return $(z)
      .attr(identifiers.lt)
      .call(ctx.utils.maybeBigInt(schema.exclusiveMaximum, schema.format));
  }
  if (schema.maximum !== undefined) {
    return $(z).attr(identifiers.lte).call(ctx.utils.maybeBigInt(schema.maximum, schema.format));
  }
  const limit = ctx.utils.getIntegerLimit(schema.format);
  if (limit) {
    return $(z)
      .attr(identifiers.maximum)
      .call(
        ctx.utils.maybeBigInt(limit.maxValue, schema.format),
        $.object().prop('error', $.literal(limit.maxError)),
      );
  }
  return;
}

function minNode(ctx: NumberResolverContext): ChainResult {
  const { schema } = ctx;
  const { z } = ctx.plugin.imports;
  if (schema.exclusiveMinimum !== undefined) {
    return $(z)
      .attr(identifiers.gt)
      .call(ctx.utils.maybeBigInt(schema.exclusiveMinimum, schema.format));
  }
  if (schema.minimum !== undefined) {
    return $(z).attr(identifiers.gte).call(ctx.utils.maybeBigInt(schema.minimum, schema.format));
  }
  const limit = ctx.utils.getIntegerLimit(schema.format);
  if (limit) {
    return $(z)
      .attr(identifiers.minimum)
      .call(
        ctx.utils.maybeBigInt(limit.minValue, schema.format),
        $.object().prop('error', $.literal(limit.minError)),
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

  const checks: Array<Chain> = [];

  const minNode = ctx.nodes.min(ctx);
  if (minNode) checks.push(minNode);

  const maxNode = ctx.nodes.max(ctx);
  if (maxNode) checks.push(maxNode);

  if (checks.length) {
    ctx.chain.current = ctx.chain.current.attr(identifiers.check).call(...checks);
  }

  return ctx.chain.current;
}

export function numberToNode({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ZodPlugin['Instance']> & {
  schema: SchemaWithType<'integer' | 'number'>;
}): Chain {
  const z = plugin.imports.z;
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
    path,
    plugin,
    schema,
    symbols: {
      z,
    },
    utils: {
      getIntegerLimit,
      maybeBigInt,
      shouldCoerceToBigInt,
    },
  };
  const resolver = plugin.config.$resolvers?.number ?? plugin.config['~resolvers']?.number;
  return resolver?.(ctx) ?? numberResolver(ctx);
}
