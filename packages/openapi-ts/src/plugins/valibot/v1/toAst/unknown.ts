import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { UnknownResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: UnknownResolverContext): PipeResult {
  const { symbols } = ctx;
  const { v } = symbols;
  return $(v).attr(identifiers.schemas.unknown).call();
}

function unknownResolver(ctx: UnknownResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, base);
  return ctx.pipes.current;
}

export function unknownToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema?: SchemaWithType<'unknown'>;
}): Pipe {
  const ctx: UnknownResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema: schema ?? { type: 'unknown' },
    symbols: {
      v: plugin.external('valibot.v'),
    },
  };

  const resolver = plugin.config['~resolvers']?.unknown;
  const node = resolver?.(ctx) ?? unknownResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
}
