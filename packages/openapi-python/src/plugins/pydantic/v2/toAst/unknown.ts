import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { UnknownResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

function baseNode(ctx: UnknownResolverContext): PydanticType {
  const { plugin } = ctx;
  const type = $$.constrainedType(plugin.symbols.typing.Any);
  return {
    node: { kind: 'rootModel', type },
    type,
  };
}

function unknownResolver(ctx: UnknownResolverContext): PydanticType {
  return ctx.nodes.base(ctx);
}

export function unknownToType({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<PydanticPlugin['Instance']> & {
  schema: SchemaWithType<'unknown'>;
}): PydanticType {
  const ctx: UnknownResolverContext = {
    $,
    nodes: {
      base: baseNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.unknown;
  return resolver?.(ctx) ?? unknownResolver(ctx);
}
