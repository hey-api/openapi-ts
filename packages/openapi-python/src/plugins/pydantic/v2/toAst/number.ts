import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { NumberResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';
import type { FieldConstraints } from '../constants';

function constNode(ctx: NumberResolverContext): PydanticType | undefined {
  const { plugin, schema } = ctx;

  if (typeof schema.const === 'number') {
    const literal = plugin.external('typing.Literal');
    return {
      type: $(literal).slice($.literal(schema.const)),
    };
  }

  return undefined;
}

function baseNode(ctx: NumberResolverContext): PydanticType {
  const { schema } = ctx;

  const constraints: FieldConstraints = {};

  if (schema.minimum !== undefined) {
    constraints.ge = schema.minimum;
  }

  if (schema.exclusiveMinimum !== undefined) {
    constraints.gt = schema.exclusiveMinimum;
  }

  if (schema.maximum !== undefined) {
    constraints.le = schema.maximum;
  }

  if (schema.exclusiveMaximum !== undefined) {
    constraints.lt = schema.exclusiveMaximum;
  }

  if (schema.description !== undefined) {
    constraints.description = schema.description;
  }

  return {
    fieldConstraints: constraints,
    type: schema.type === 'integer' ? 'int' : 'float',
  };
}

function numberResolver(ctx: NumberResolverContext): PydanticType {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  return ctx.nodes.base(ctx);
}

export function numberToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'integer' | 'number'>;
}): PydanticType {
  const ctx: NumberResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.number;
  return resolver?.(ctx) ?? numberResolver(ctx);
}
