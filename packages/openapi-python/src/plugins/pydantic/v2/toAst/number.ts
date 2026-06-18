import type { SchemaVisitorContext, SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import { $ as $$ } from '../../dsl';
import type { NumberResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

function constNode(ctx: NumberResolverContext): PydanticType | undefined {
  const { plugin, schema } = ctx;

  if (typeof schema.const === 'number') {
    const literal = plugin.imports.typing.Literal;
    return {
      type: $$.constrainedType($(literal).slice($.literal(schema.const))),
    };
  }
}

function baseNode(ctx: NumberResolverContext): PydanticType {
  const { schema } = ctx;

  const c = $$.constraints();

  if (schema.minimum !== undefined) c.ge(schema.minimum);
  if (schema.exclusiveMinimum !== undefined) c.gt(schema.exclusiveMinimum);
  if (schema.maximum !== undefined) c.le(schema.maximum);
  if (schema.exclusiveMaximum !== undefined) c.lt(schema.exclusiveMaximum);
  if (schema.description !== undefined) c.description(schema.description);

  return {
    type: $$.constrainedType(
      schema.type === 'integer' ? 'int' : 'float',
      c.isEmpty ? undefined : c,
    ),
  };
}

function numberResolver(ctx: NumberResolverContext): PydanticType {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  return ctx.nodes.base(ctx);
}

export function numberToType({
  path,
  plugin,
  schema,
}: SchemaVisitorContext<PydanticPlugin['Instance']> & {
  schema: SchemaWithType<'integer' | 'number'>;
}): PydanticType {
  const ctx: NumberResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    path,
    plugin,
    schema,
  };

  const resolver = plugin.config.$resolvers?.number ?? plugin.config['~resolvers']?.number;
  return resolver?.(ctx) ?? numberResolver(ctx);
}
