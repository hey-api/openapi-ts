import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { UndefinedResolverContext } from '../../resolvers';
import type { Type } from '../../shared/types';
import type { HeyApiTypeScriptPlugin } from '../../types';

function baseNode(): Type {
  return $.type('undefined');
}

function undefinedResolver(ctx: UndefinedResolverContext): Type {
  return ctx.nodes.base(ctx);
}

export function undefinedToAst({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<HeyApiTypeScriptPlugin['Instance']> & {
  schema: SchemaWithType<'undefined'>;
}): Type {
  const ctx: UndefinedResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.undefined ?? plugin.config['~resolvers']?.undefined;
  return resolver?.(ctx) ?? undefinedResolver(ctx);
}
