import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { UndefinedResolverContext } from '../../resolvers';
import type { Chain } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

function baseNode(ctx: UndefinedResolverContext): Chain {
  const { z } = ctx.plugin.imports;
  return $(z).attr(identifiers.undefined).call();
}

function undefinedResolver(ctx: UndefinedResolverContext): Chain {
  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;
  return ctx.chain.current;
}

export function undefinedToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ZodPlugin['Instance']> & {
  schema: SchemaWithType<'undefined'>;
}): Chain {
  const z = plugin.imports.z;
  const ctx: UndefinedResolverContext = {
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

  const resolver = plugin.config.$resolvers?.undefined ?? plugin.config['~resolvers']?.undefined;
  return resolver?.(ctx) ?? undefinedResolver(ctx);
}
