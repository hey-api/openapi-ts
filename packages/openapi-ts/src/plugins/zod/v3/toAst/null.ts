import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { NullResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

function baseNode(ctx: NullResolverContext): Chain {
  const { symbols } = ctx;
  const { z } = symbols;
  return $(z).attr(identifiers.null).call();
}

function nullResolver(ctx: NullResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function nullToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ZodPlugin['Instance']> & {
  schema: SchemaWithType<'null'>;
}): Chain {
  const z = plugin.external('zod.z');
  const ctx: NullResolverContext = {
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

  const resolver = plugin.config['~resolvers']?.null;
  return resolver?.(ctx) ?? nullResolver(ctx);
}
