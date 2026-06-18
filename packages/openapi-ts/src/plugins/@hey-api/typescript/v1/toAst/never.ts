import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { NeverResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(): Type {
  return $.type('never');
}

function neverResolver(ctx: NeverResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function neverToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  schema: SchemaWithType<'never'>;
}): Type {
  const ctx: NeverResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.never ?? plugin.config['~resolvers']?.never;
  return resolver?.(ctx) ?? neverResolver(ctx);
}
