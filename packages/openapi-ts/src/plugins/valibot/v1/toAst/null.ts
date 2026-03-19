import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { NullResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: NullResolverContext): PipeResult {
  const { symbols } = ctx;
  const { v } = symbols;
  return $(v).attr(identifiers.schemas.null).call();
}

function nullResolver(ctx: NullResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, base);
  return ctx.pipes.current;
}

export function nullToPipes({
  plugin,
  schema,
}: {
  plugin: ValibotPlugin['Instance'];
  schema: SchemaWithType<'null'>;
}): Pipe {
  const ctx: NullResolverContext = {
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

  const resolver = plugin.config['~resolvers']?.null;
  const node = resolver?.(ctx) ?? nullResolver(ctx);
  return ctx.pipes.toNode(node, plugin);
}
