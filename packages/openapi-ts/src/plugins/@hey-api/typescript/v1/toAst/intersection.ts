import type { IR } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { IntersectionResolverContext } from '../../resolvers';
import type { Type, TypeScriptResult } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

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
  plugin,
  schemas,
}: {
  childResults: ReadonlyArray<TypeScriptResult>;
  parentSchema: IR.SchemaObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schemas: ReadonlyArray<IR.SchemaObject>;
}): Type {
  const ctx: IntersectionResolverContext = {
    $,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    plugin,
    schemas,
  };

  const resolver = plugin.config['~resolvers']?.intersection;
  const result = resolver?.(ctx);
  return result ?? intersectionResolver(ctx);
}
