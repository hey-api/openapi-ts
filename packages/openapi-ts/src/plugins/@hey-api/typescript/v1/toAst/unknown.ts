import type { SchemaWithType } from '@hey-api/shared';

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
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'unknown'>;
}): Type {
  const ctx: UnknownResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.unknown;
  const result = resolver?.(ctx);
  return result ?? unknownResolver(ctx);
}
