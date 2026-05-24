import { $ } from '../../../../../ts-dsl';
import type { UnionResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';

function baseNode(ctx: UnionResolverContext): Type {
  const { childResults } = ctx;

  if (childResults.length === 1) {
    return childResults[0]!.type;
  }

  return $.type.or(...childResults.map((r) => r.type));
}

function unionResolver(ctx: UnionResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function unionToAst({
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<
  UnionResolverContext,
  'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'
>): Type {
  const ctx: UnionResolverContext = {
    $,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    path,
    plugin,
    schemas,
  };

  const resolver = plugin.config['~resolvers']?.union;
  const result = resolver?.(ctx);
  return result ?? unionResolver(ctx);
}
