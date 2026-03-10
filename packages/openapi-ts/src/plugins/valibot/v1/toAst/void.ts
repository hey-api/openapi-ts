import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { VoidResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: VoidResolverContext): PipeResult {
  const { symbols } = ctx;
  const { v } = symbols;
  return $(v).attr(identifiers.schemas.void).call();
}

function voidResolver(ctx: VoidResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, base);
  return ctx.pipes.current;
}

export function voidToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'void'>;
}): Pipe {
  const ctx: VoidResolverContext = {
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

  const resolver = plugin.config['~resolvers']?.void;
  const node = resolver?.(ctx) ?? voidResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
}
