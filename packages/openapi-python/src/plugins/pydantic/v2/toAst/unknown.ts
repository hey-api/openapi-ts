import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { UnknownResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

function baseNode(ctx: UnknownResolverContext): PydanticType {
  const { plugin } = ctx;
  return {
    type: plugin.external('typing.Any'),
  };
}

function unknownResolver(ctx: UnknownResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function unknownToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'unknown'>;
}): PydanticType {
  const ctx: UnknownResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.unknown;
  return resolver?.(ctx) ?? unknownResolver(ctx);
}
