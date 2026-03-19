import type { IR } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { UnionResolverContext } from '../../resolvers';
import type { Type, TypeScriptResult } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

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
  plugin,
  schemas,
}: {
  childResults: ReadonlyArray<TypeScriptResult>;
  parentSchema: IR.SchemaObject;
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schemas: ReadonlyArray<IR.SchemaObject>;
}): Type {
  const ctx: UnionResolverContext = {
    $,
    childResults,
    nodes: {
      base: baseNode,
    },
    parentSchema,
    plugin,
    schemas,
  };

  const resolver = plugin.config['~resolvers']?.union;
  const result = resolver?.(ctx);
  return result ?? unionResolver(ctx);
}
