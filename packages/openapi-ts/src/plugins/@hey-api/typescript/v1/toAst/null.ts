import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { NullResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(): Type {
  return $.type.literal(null);
}

function nullResolver(ctx: NullResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function nullToAst({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'null'>;
}): Type {
  const ctx: NullResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.null;
  const result = resolver?.(ctx);
  return result ?? nullResolver(ctx);
}
