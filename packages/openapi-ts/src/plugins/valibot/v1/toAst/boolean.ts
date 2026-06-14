import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { BooleanResolverContext } from '../../resolvers';
import type { Pipe, PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { ValibotPlugin } from '../../types';
import { identifiers } from '../constants';

function baseNode(ctx: BooleanResolverContext): PipeResult {
  const { v } = ctx.plugin.imports;
  return $(v).attr(identifiers.schemas.boolean).call();
}

function constNode(ctx: BooleanResolverContext): PipeResult {
  const { schema } = ctx;
  const { v } = ctx.plugin.imports;
  if (typeof schema.const !== 'boolean') return;
  return $(v).attr(identifiers.schemas.literal).call($.literal(schema.const));
}

function booleanResolver(ctx: BooleanResolverContext): Pipes {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) {
    return ctx.pipes.push(ctx.pipes.current, constResult);
  }

  const baseResult = ctx.nodes.base(ctx);
  if (baseResult) {
    ctx.pipes.push(ctx.pipes.current, baseResult);
  }

  return ctx.pipes.current;
}

export function booleanToPipes({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<ValibotPlugin['Instance']> & {
  schema: SchemaWithType<'boolean'>;
}): Pipe {
  const resolverCtx: BooleanResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
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

  const resolver = plugin.config['~resolvers']?.boolean;
  const node = resolver?.(resolverCtx) ?? booleanResolver(resolverCtx);
  return resolverCtx.pipes.toNode(node, plugin);
}
