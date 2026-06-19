import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { VoidResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: VoidResolverContext): PipeResult {
  const { v } = ctx.plugin.imports;
  return $(v).attr(identifiers.schemas.void).call();
}

function voidResolver(ctx: VoidResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, base);
  return ctx.pipes.current;
}

export function voidToPipes({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ValibotPlugin['Instance']> & {
  schema: SchemaWithType<'void'>;
}): Pipe {
  const resolverCtx: VoidResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    path,
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema,
    symbols: {
      v: plugin.imports.v,
    },
  };

  const resolver = plugin.config.$resolvers?.void ?? plugin.config['~resolvers']?.void;
  const node = resolver?.(resolverCtx) ?? voidResolver(resolverCtx);
  return resolverCtx.pipes.toNode(node, plugin);
}
