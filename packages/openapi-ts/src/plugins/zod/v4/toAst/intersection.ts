import type { IR } from '@hey-api/shared';
import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { IntersectionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodResult } from '../../shared/types';

type IntersectionToAstOptions = Pick<
  IntersectionResolverContext,
  'parentSchema' | 'plugin' | 'walk' | 'walkerCtx'
> & {
  schemas: ReadonlyArray<IR.SchemaObject>;
};

function baseNode(ctx: IntersectionResolverContext): Chain {
  const { childResults, symbols } = ctx;
  const { z } = symbols;

  if (!childResults.length) {
    return $(z).attr(identifiers.never).call();
  }

  return $(z)
    .attr(identifiers.intersection)
    .call(...childResults.map((result) => result.expression));
}

function intersectionResolver(ctx: IntersectionResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function intersectionToAst({
  parentSchema,
  plugin,
  schemas,
  walk,
  walkerCtx,
}: IntersectionToAstOptions): {
  childResults: Array<ZodResult>;
  expression: Chain;
} {
  const z = plugin.external('zod.z');

  const childResults: Array<ZodResult> = [];
  schemas.forEach((schema, index) => {
    const itemResult = walk(schema, childContext(walkerCtx, 'allOf', index));
    childResults.push(itemResult);
  });

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
    symbols: {
      z,
    },
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.intersection;
  const expression = resolver?.(ctx) ?? intersectionResolver(ctx);

  return {
    childResults,
    expression,
  };
}
