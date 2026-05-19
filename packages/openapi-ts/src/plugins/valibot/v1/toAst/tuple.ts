import { childContext } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { TupleResolverContext } from '../../resolvers';
import type { PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotResult } from '../../shared/types';
import { identifiers } from '../constants';
import { unknownToPipes } from './unknown';

function baseNode(ctx: TupleResolverContext): PipeResult {
  const { applyModifiers, path, pipes, plugin, schema, symbols, walk } = ctx;

  if (!schema.items) {
    return unknownToPipes({ path, plugin });
  }

  const { v } = symbols;
  const childResults: Array<ValibotResult> = [];

  for (let i = 0; i < schema.items.length; i++) {
    const item = schema.items[i]!;
    const result = walk!(item, childContext({ path, plugin }, 'items', i));
    childResults.push(result);
  }

  const tupleElements = childResults.map((r) => pipes.toNode(applyModifiers!(r).pipes, plugin));

  return $(v)
    .attr(identifiers.schemas.tuple)
    .call($.array(...tupleElements));
}

function constNode(ctx: TupleResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;

  if (!schema.const || !Array.isArray(schema.const)) return;

  const tupleElements = schema.const.map((value) =>
    $(v).attr(identifiers.schemas.literal).call($.fromValue(value)),
  );

  return $(v)
    .attr(identifiers.schemas.tuple)
    .call($.array(...tupleElements));
}

function tupleResolver(ctx: TupleResolverContext): Pipes {
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

export function tupleToPipes(
  ctx: Pick<TupleResolverContext, 'applyModifiers' | 'path' | 'plugin' | 'schema' | 'walk'>,
): CompositeHandlerResult {
  const { path, plugin, schema, walk } = ctx;
  const childResults: Array<ValibotResult> = [];

  if (schema.items) {
    for (let i = 0; i < schema.items.length; i++) {
      const item = schema.items[i]!;
      const result = walk(item, childContext({ path, plugin }, 'items', i));
      childResults.push(result);
    }
  }

  const resolverCtx: TupleResolverContext = {
    $,
    applyModifiers: ctx.applyModifiers,
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
      v: plugin.external('valibot.v'),
    },
    walk,
  };

  const resolver = plugin.config['~resolvers']?.tuple;
  const node = resolver?.(resolverCtx) ?? tupleResolver(resolverCtx);

  return {
    childResults,
    pipes: [resolverCtx.pipes.toNode(node, plugin)],
  };
}
