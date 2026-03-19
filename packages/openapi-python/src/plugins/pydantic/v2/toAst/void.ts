import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { VoidResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function baseNode(_ctx: VoidResolverContext): PydanticType {
  return {
    type: 'None',
  };
}

function voidResolver(ctx: VoidResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function voidToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'void'>;
}): PydanticType {
  const ctx: VoidResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.void;
  return resolver?.(ctx) ?? voidResolver(ctx);
}
