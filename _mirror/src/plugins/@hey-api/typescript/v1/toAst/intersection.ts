import { $ } from '../../../../../ts-dsl';
import type { IntersectionResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';

function baseNode(ctx: IntersectionResolverContext): Type {
  const { childResults } = ctx;

  if (childResults.length === 1) {
    return childResults[0]!.type;
  }

  return $.type.and(...childResults.map((r) => r.type));
}

function intersectionResolver(ctx: IntersectionResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function intersectionToAst({
  childResults,
  parentSchema,
  path,
  plugin,
  schemas,
}: Pick<
  IntersectionResolverContext,
  'childResults' | 'parentSchema' | 'path' | 'plugin' | 'schemas'
>): Type {
  const ctx: IntersectionResolverContext = {
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

  const resolver =
    plugin.config.$resolvers?.intersection ?? plugin.config['~resolvers']?.intersection;
  return resolver?.(ctx) ?? intersectionResolver(ctx);
}
