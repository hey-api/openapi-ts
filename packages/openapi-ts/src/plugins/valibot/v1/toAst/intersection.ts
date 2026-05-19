import { $ } from '../../../../ts-dsl';
import type { IntersectionResolverContext } from '../../resolvers';
import type { PipeResult, Pipes } from '../../shared/pipes';
import { pipes, pipesToNode } from '../../shared/pipes';
import type { CompositeHandlerResult } from '../../shared/types';
import { identifiers } from '../constants';

function baseNode(ctx: IntersectionResolverContext): PipeResult {
  const { applyModifiers, childResults, plugin, symbols } = ctx;
  const { v } = symbols;

  if (!childResults.length) {
    return $(v).attr(identifiers.schemas.any).call();
  }

  if (childResults.length === 1) {
    const finalResult = applyModifiers!(childResults[0]!);
    return finalResult.pipes;
  }

  const itemNodes = childResults.map((item) => pipesToNode(item.pipes, plugin));
  return $(v)
    .attr(identifiers.schemas.intersect)
    .call($.array(...itemNodes));
}

function intersectionResolver(ctx: IntersectionResolverContext): Pipes {
  const base = ctx.nodes.base(ctx);
  if (base) {
    ctx.pipes.push(ctx.pipes.current, base);
  }
  return ctx.pipes.current;
}

export function intersectionToPipes({
  applyModifiers,
  childResults,
  parentSchema,
  path,
  plugin,
}: Pick<
  IntersectionResolverContext,
  'applyModifiers' | 'childResults' | 'parentSchema' | 'path' | 'plugin'
>): CompositeHandlerResult {
  const resolverCtx: IntersectionResolverContext = {
    $,
    applyModifiers,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    path,
    pipes: {
      ...pipes,
      current: [],
    },
    plugin,
    schema: parentSchema,
    symbols: {
      v: plugin.external('valibot.v'),
    },
  };

  const resolver = plugin.config['~resolvers']?.intersection;
  const node = resolver?.(resolverCtx) ?? intersectionResolver(resolverCtx);

  return {
    childResults,
    pipes: [resolverCtx.pipes.toNode(node, plugin)],
  };
}
