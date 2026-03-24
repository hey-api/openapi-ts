import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { NeverResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: NeverResolverContext): PipeResult {
  const { symbols } = ctx;
  const { v } = symbols;
  return $(v).attr(identifiers.schemas.never).call();
}

function neverResolver(ctx: NeverResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, base);
  return ctx.pipes.current;
}

export function neverToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'never'>;
}): Pipe {
  const ctx: NeverResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema,
    symbols: {
      v: plugin.external('valibot.v'),
    },
  };

  const resolver = plugin.config['~resolvers']?.never;
  const node = resolver?.(ctx) ?? neverResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
}
