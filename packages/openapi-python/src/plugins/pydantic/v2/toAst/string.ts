import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { StringResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

function constNode(ctx: StringResolverContext): PydanticType | undefined {
  const { plugin, schema } = ctx;

  if (typeof schema.const === 'string') {
    const literal = plugin.symbols.typing.Literal;
    return {
      type: $$.constrainedType($(literal).slice($.literal(schema.const))),
    };
  }
}

function baseNode(ctx: StringResolverContext): PydanticType {
  const { schema } = ctx;

  const c = $$.constraints();

  if (schema.minLength !== undefined) c.minLength(schema.minLength);
  if (schema.maxLength !== undefined) c.maxLength(schema.maxLength);
  if (schema.pattern !== undefined) c.pattern(schema.pattern);
  if (schema.description !== undefined) c.description(schema.description);

  return {
    type: $$.constrainedType('str', c.isEmpty ? undefined : c),
  };
}

function stringResolver(ctx: StringResolverContext): PydanticType {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  return ctx.nodes.base(ctx);
}

export function stringToType({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<PydanticPlugin['Instance']> & {
  schema: SchemaWithType<'string'>;
}): PydanticType {
  const ctx: StringResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.string;
  return resolver?.(ctx) ?? stringResolver(ctx);
}
