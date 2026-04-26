import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { IntersectionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodResult } from '../../shared/types';

type IntersectionToAstOptions = Pick<
  IntersectionResolverContext,
  'childResults' | 'parentSchema' | 'plugin' | 'schemas'
>;

function baseNode(ctx: IntersectionResolverContext): Chain {
  const { childResults, schemas, symbols } = ctx;
  const { z } = symbols;

  if (!childResults.length) {
    return $(z).attr(identifiers.never).call();
  }

  const firstSchema = schemas[0];

  if (
    firstSchema?.logicalOperator === 'or' ||
    (firstSchema?.type && firstSchema.type !== 'object')
  ) {
    return $(z)
      .attr(identifiers.intersection)
      .call(...childResults.map((result) => result.expression));
  }

  let expression = childResults[0]!.expression;
  childResults.slice(1).forEach((item) => {
    expression = expression
      .attr(identifiers.and)
      .call(
        item.meta.hasLazy
          ? $(z).attr(identifiers.lazy).call($.func().do(item.expression.return()))
          : item.expression,
      );
  });

  return expression;
}

function intersectionResolver(ctx: IntersectionResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function intersectionToAst({
  childResults,
  parentSchema,
  plugin,
  schemas,
}: IntersectionToAstOptions): {
  childResults: Array<ZodResult>;
  expression: Chain;
} {
  const z = plugin.external('zod.z');

  const ctx: IntersectionResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    plugin,
    schema: parentSchema,
    schemas,
    symbols: {
      z,
    },
  };

  const resolver = plugin.config['~resolvers']?.intersection;
  const expression = resolver?.(ctx) ?? intersectionResolver(ctx);

  return {
    childResults,
    expression,
  };
}
