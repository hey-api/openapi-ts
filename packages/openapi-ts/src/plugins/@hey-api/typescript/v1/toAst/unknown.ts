import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { UnknownResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(ctx: UnknownResolverContext): Type {
  return $.type(ctx.plugin.config.topType);
}

function unknownResolver(ctx: UnknownResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function unknownToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  schema: SchemaWithType<'unknown'>;
}): Type {
  const ctx: UnknownResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.unknown ?? plugin.config['~resolvers']?.unknown;
  return resolver?.(ctx) ?? unknownResolver(ctx);
}
