import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import type { ArrayResolverContext } from '../../resolvers';
import type { PipeResult, Pipes } from '../../shared/pipes';
import { pipes } from '../../shared/pipes';
import type { CompositeHandlerResult, ValibotResult } from '../../shared/types';
import { identifiers } from '../constants';
import { unknownToPipes } from './unknown';

function baseNode(ctx: ArrayResolverContext): PipeResult {
  const { applyModifiers, path, pipes, plugin, symbols, walk } = ctx;
  const { v } = symbols;

  const arrayFn = $(v).attr(identifiers.schemas.array);

  let { schema: normalizedSchema } = ctx;
  if (normalizedSchema.items) {
    normalizedSchema = deduplicateSchema({ schema: normalizedSchema });
  }

  if (!normalizedSchema.items) {
    return arrayFn.call(unknownToPipes({ path, plugin }));
  }

  const childResults: Array<ValibotResult> = [];

  for (let i = 0; i < normalizedSchema.items!.length; i++) {
    const item = normalizedSchema.items![i]!;
    const result = walk!(item, childContext({ path, plugin }, 'items', i));
    childResults.push(result);
  }

  if (childResults.length === 1) {
    const itemNode = pipes.toNode(applyModifiers!(childResults[0]!).pipes, plugin);
    return arrayFn.call(itemNode);
  }

  return arrayFn.call(unknownToPipes({ path, plugin }));
}

function lengthNode(ctx: ArrayResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    return $(v).attr(identifiers.actions.length).call($.fromValue(schema.minItems));
  }
}

function maxLengthNode(ctx: ArrayResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (schema.maxItems === undefined) return;
  return $(v).attr(identifiers.actions.maxLength).call($.fromValue(schema.maxItems));
}

function minLengthNode(ctx: ArrayResolverContext): PipeResult {
  const { schema, symbols } = ctx;
  const { v } = symbols;
  if (schema.minItems === undefined) return;
  return $(v).attr(identifiers.actions.minLength).call($.fromValue(schema.minItems));
}

function arrayResolver(ctx: ArrayResolverContext): Pipes {
  const baseResult = ctx.nodes.base(ctx);
  if (baseResult) {
    ctx.pipes.push(ctx.pipes.current, baseResult);
  }

  const lengthResult = ctx.nodes.length(ctx);
  if (lengthResult) {
    ctx.pipes.push(ctx.pipes.current, lengthResult);
  } else {
    const minLengthResult = ctx.nodes.minLength(ctx);
    if (minLengthResult) {
      ctx.pipes.push(ctx.pipes.current, minLengthResult);
    }

    const maxLengthResult = ctx.nodes.maxLength(ctx);
    if (maxLengthResult) {
      ctx.pipes.push(ctx.pipes.current, maxLengthResult);
    }
  }

  return ctx.pipes.current;
}

export function arrayToPipes(
  ctx: Pick<ArrayResolverContext, 'applyModifiers' | 'path' | 'plugin' | 'schema' | 'walk'>,
): CompositeHandlerResult {
  const { path, plugin, schema, walk } = ctx;
  const childResults: Array<ValibotResult> = [];

  if (schema.items) {
    const normalizedSchema = deduplicateSchema({ schema });
    for (let i = 0; i < normalizedSchema.items!.length; i++) {
      const item = normalizedSchema.items![i]!;
      const result = walk(item, childContext({ path, plugin }, 'items', i));
      childResults.push(result);
    }
  }

  const resolverCtx: ArrayResolverContext = {
    $,
    applyModifiers: ctx.applyModifiers,
    nodes: {
      base: baseNode,
      length: lengthNode,
      maxLength: maxLengthNode,
      minLength: minLengthNode,
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

  const resolver = plugin.config['~resolvers']?.array;
  const node = resolver?.(resolverCtx) ?? arrayResolver(resolverCtx);

  return {
    childResults,
    pipes: [resolverCtx.pipes.toNode(node, plugin)],
  };
}
