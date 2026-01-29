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
    chain = $(z).attr(identifiers.int).call();
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
  const { schema, symbols } = ctx;
  const { z } = symbols;
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

function minNode(ctx: NumberResolverContext): Chain | undefined {
  const { schema, symbols } = ctx;
  const { z } = symbols;
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

  if (checks.length > 0) {
    ctx.chain.current = ctx.chain.current.attr(identifiers.check).call(...checks);
  }

  return ctx.chain.current;
}

export const numberToNode = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'integer' | 'number'>;
}): Omit<Ast, 'typeName'> => {
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
  ast.expression = node;
  return ast as Omit<Ast, 'typeName'>;
};
