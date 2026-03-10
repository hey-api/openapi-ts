import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { UndefinedResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function baseNode(_ctx: UndefinedResolverContext): PydanticType {
  return {
    type: 'None',
  };
}

function undefinedResolver(ctx: UndefinedResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function undefinedToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'undefined'>;
}): PydanticType {
  const ctx: UndefinedResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.undefined;
  return resolver?.(ctx) ?? undefinedResolver(ctx);
}
