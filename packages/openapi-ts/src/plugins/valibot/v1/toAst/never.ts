import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { NeverResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: NeverResolverContext): PipeResult {
  const { v } = ctx.plugin.imports;
  return $(v).attr(identifiers.schemas.never).call();
}

function neverResolver(ctx: NeverResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  ctx.pipes.push(ctx.pipes.current, base);
  return ctx.pipes.current;
}

export function neverToPipes({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ValibotPlugin['Instance']> & {
  schema: SchemaWithType<'never'>;
}): Pipe {
  const resolverCtx: NeverResolverContext = {
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

  const resolver = plugin.config['~resolvers']?.never;
  const node = resolver?.(resolverCtx) ?? neverResolver(resolverCtx);
  return resolverCtx.pipes.toNode(node, plugin);
}
