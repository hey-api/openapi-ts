import type { SchemaWithType } from '@hey-api/shared';

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
  plugin,
  schema,
}: {
  plugin: HeyApiTypeScriptPlugin['Instance'];
  schema: SchemaWithType<'never'>;
}): Type {
  const ctx: NeverResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.never;
  const result = resolver?.(ctx);
  return result ?? neverResolver(ctx);
}
