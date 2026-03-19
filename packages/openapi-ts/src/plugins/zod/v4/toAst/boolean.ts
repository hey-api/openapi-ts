import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { BooleanResolverContext } from '../../resolvers';
import type { Chain, ChainResult } from '../../shared/chain';
import type { ZodPlugin } from '../../types';

function baseNode(ctx: BooleanResolverContext): Chain {
  const { symbols } = ctx;
  const { z } = symbols;
  return $(z).attr(identifiers.boolean).call();
}

function constNode(ctx: BooleanResolverContext): ChainResult {
  const { schema, symbols } = ctx;
  const { z } = symbols;
  if (typeof schema.const !== 'boolean') return;
  return $(z).attr(identifiers.literal).call($.literal(schema.const));
}

function booleanResolver(ctx: BooleanResolverContext): Chain {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) {
    ctx.chain.current = constResult;
    return ctx.chain.current;
  }

  const baseResult = ctx.nodes.base(ctx);
  ctx.chain.current = baseResult;

  return ctx.chain.current;
}

export function booleanToAst({
  plugin,
  schema,
}: {
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'boolean'>;
}): Chain {
  const z = plugin.external('zod.z');
  const ctx: BooleanResolverContext = {
    $,
    chain: {
      current: $(z),
    },
    nodes: {
      base: baseNode,
      const: constNode,
    },
    plugin,
    schema,
    symbols: {
      z,
    },
  };

  const resolver = plugin.config['~resolvers']?.boolean;
  return resolver?.(ctx) ?? booleanResolver(ctx);
}
