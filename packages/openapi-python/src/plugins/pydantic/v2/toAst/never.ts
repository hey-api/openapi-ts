import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { NeverResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

function baseNode(ctx: NeverResolverContext): PydanticType {
  const { plugin } = ctx;
  return {
    type: plugin.external('typing.NoReturn'),
  };
}

function neverResolver(ctx: NeverResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function neverToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'never'>;
}): PydanticType {
  const ctx: NeverResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.never;
  return resolver?.(ctx) ?? neverResolver(ctx);
}
