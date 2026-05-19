import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { UnknownResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

function baseNode(ctx: UnknownResolverContext): Chain {
  const { symbols } = ctx;
  const { z } = symbols;
  return $(z).attr(identifiers.unknown).call();
}

function unknownResolver(ctx: UnknownResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function unknownToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ZodPlugin['Instance']> & {
  schema: SchemaWithType<'unknown'>;
}): Chain {
  const z = plugin.external('zod.z');
  const ctx: UnknownResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    nodes: {
      base: baseNode,
    },
    path,
    plugin,
    schema,
    symbols: {
      z,
    },
  };

  const resolver = plugin.config['~resolvers']?.unknown;
  return resolver?.(ctx) ?? unknownResolver(ctx);
}
