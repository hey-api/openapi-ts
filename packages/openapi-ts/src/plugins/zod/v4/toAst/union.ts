import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { UnionResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodResult } from '../../shared/types';

type UnionToAstOptions = Pick<
  UnionResolverContext,
  'parentSchema' | 'plugin' | 'schemas' | 'walk' | 'walkerCtx'
>;

function baseNode(ctx: UnionResolverContext): Chain {
  const { childResults, schemas, symbols } = ctx;
  const { z } = symbols;

  if (childResults.length === 0) {
    return $(z).attr(identifiers.null).call();
  }

  const nonNullItems: Array<ZodResult> = [];
  childResults.forEach((result, index) => {
    const schema = schemas[index]!;
    if (schema.type !== 'null' && schema.const !== null) {
      nonNullItems.push(result);
    }
  });

  let expression: Chain;
  if (nonNullItems.length === 0) {
    expression = $(z).attr(identifiers.null).call();
  } else if (nonNullItems.length === 1) {
    expression = nonNullItems[0]!.expression;
  } else {
    expression = $(z)
      .attr(identifiers.union)
      .call(
        $.array()
          .pretty()
          .elements(...nonNullItems.map((item) => item.expression)),
      );
  }

  return expression;
}

function unionResolver(ctx: UnionResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function unionToAst({ parentSchema, plugin, schemas, walk, walkerCtx }: UnionToAstOptions): {
  childResults: Array<ZodResult>;
  expression: Chain;
} {
  const z = plugin.external('zod.z');

  const childResults: Array<ZodResult> = [];
  schemas.forEach((schema, index) => {
    const itemResult = walk(schema, childContext(walkerCtx, 'anyOf', index));
    childResults.push(itemResult);
  });

  const ctx: UnionResolverContext = {
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
    walk,
    walkerCtx,
  };

  const resolver = plugin.config['~resolvers']?.union;
  const expression = resolver?.(ctx) ?? unionResolver(ctx);

  return {
    childResults,
    expression,
  };
}
