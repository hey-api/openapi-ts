import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { VoidResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

function baseNode(ctx: VoidResolverContext): Chain {
  const { z } = ctx.plugin.imports;
  return $(z).attr(identifiers.void).call();
}

function voidResolver(ctx: VoidResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function voidToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ZodPlugin['Instance']> & {
  schema: SchemaWithType<'void'>;
}): Chain {
  const z = plugin.imports.z;
  const ctx: VoidResolverContext = {
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

  const resolver = plugin.config.$resolvers?.void ?? plugin.config['~resolvers']?.void;
  return resolver?.(ctx) ?? voidResolver(ctx);
}
