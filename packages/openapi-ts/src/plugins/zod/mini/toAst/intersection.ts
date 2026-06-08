import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { IntersectionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodResult } from '../../shared/types';

function baseNode(ctx: IntersectionResolverContext): Chain {
  const { childResults } = ctx;
  const { z } = ctx.plugin.symbols;

  if (!childResults.length) {
    return $(z).attr(identifiers.never).call();
  }

  let chain = childResults[0]!.chain;
  childResults.slice(1).forEach((item) => {
    chain = $(z)
      .attr(identifiers.intersection)
      .call(
        chain,
        item.meta.hasLazy
          ? $(z).attr(identifiers.lazy).call($.func().do(item.chain.return()))
          : item.chain,
      );
  });

  return chain;
}

function intersectionResolver(ctx: IntersectionResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function intersectionToAst({
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<
  IntersectionResolverContext,
  'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'
>): {
  chain: Chain;
  childResults: Array<ZodResult>;
} {
  const z = plugin.symbols.z;

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
    path,
    plugin,
    schema: parentSchema,
    schemas,
    symbols: {
      z,
    },
  };

  const resolver = plugin.config['~resolvers']?.intersection;
  const chain = resolver?.(ctx) ?? intersectionResolver(ctx);

  return {
    chain,
    childResults,
  };
}
