import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

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
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  schema: SchemaWithType<'void'>;
}): Type {
  const ctx: VoidResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.void ?? plugin.config['~resolvers']?.void;
  return resolver?.(ctx) ?? voidResolver(ctx);
}
