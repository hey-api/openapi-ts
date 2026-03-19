import type { SchemaWithType } from '@hey-api/shared';

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
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'undefined'>;
}): Type {
  const ctx: UndefinedResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.undefined;
  const result = resolver?.(ctx);
  return result ?? undefinedResolver(ctx);
}
