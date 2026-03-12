import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { TupleResolverContext } from '../../resolvers';
import type { Chain, ChainResult } from '../../shared/chain';
import type { CompositeHandlerResult, ZodResult } from '../../shared/types';

type TupleToAstOptions = Pick<
  TupleResolverContext,
  'applyModifiers' | 'plugin' | 'schema' | 'walk' | 'walkerCtx'
>;

function baseNode(ctx: TupleResolverContext): Chain {
  const { applyModifiers, childResults, symbols } = ctx;
  const { z } = symbols;

  const tupleFn = $(z).attr(identifiers.tuple);

  if (childResults.length === 0) {
    return tupleFn.call($.array());
  }

  const tupleElements = childResults.map(
    (result) => applyModifiers(result, { optional: false }).expression,
  );

  return tupleFn.call($.array(...tupleElements));
}

function constNode(ctx: TupleResolverContext): ChainResult {
  const { schema, symbols } = ctx;
  const { z } = symbols;

  if (!schema.const || !Array.isArray(schema.const)) return;

  const tupleElements = schema.const.map((value) =>
    $(z).attr(identifiers.literal).call($.fromValue(value)),
  );

  return $(z)
    .attr(identifiers.tuple)
    .call($.array(...tupleElements));
}

function tupleResolver(ctx: TupleResolverContext): Chain {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) {
    ctx.chain.current = constResult;
    return ctx.chain.current;
  }

  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;

  return ctx.chain.current;
}

export function tupleToAst({
  applyModifiers,
  plugin,
  schema,
  walk,
  walkerCtx,
}: TupleToAstOptions): CompositeHandlerResult {
  const childResults: Array<ZodResult> = [];

  const z = plugin.external('zod.z');

  if (schema.items) {
    schema.items.forEach((item, index) => {
      const itemResult = walk(item, childContext(walkerCtx, 'items', index));
      childResults.push(itemResult);
    });
  }

  const ctx: TupleResolverContext = {
    $,
    applyModifiers,
    chain: {
      current: $(z),
    },
    childResults,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    plugin,
    schema,
    symbols: {
      z,
    },
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.tuple;
  const expression = resolver?.(ctx) ?? tupleResolver(ctx);

  return {
    childResults,
    expression,
  };
}
