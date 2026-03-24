import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { VoidResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(): Type {
  return $.type('void');
}

function voidResolver(ctx: VoidResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function voidToAst({
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'void'>;
}): Type {
  const ctx: VoidResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.void;
  const result = resolver?.(ctx);
  return result ?? voidResolver(ctx);
}
