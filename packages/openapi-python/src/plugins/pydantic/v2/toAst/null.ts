import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { NullResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function baseNode(_ctx: NullResolverContext): PydanticType {
  return {
    type: 'None',
  };
}

function nullResolver(ctx: NullResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function nullToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'null'>;
}): PydanticType {
  const ctx: NullResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.null;
  return resolver?.(ctx) ?? nullResolver(ctx);
}
