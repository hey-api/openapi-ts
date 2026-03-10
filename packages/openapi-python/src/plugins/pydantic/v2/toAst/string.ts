import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { StringResolverContext } from '../../resolvers';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';
import type { FieldConstraints } from '../constants';

function constNode(ctx: StringResolverContext): PydanticType | undefined {
  const { plugin, schema } = ctx;

  if (typeof schema.const === 'string') {
    const literal = plugin.external('typing.Literal');
    return {
      type: $(literal).slice($.literal(schema.const)),
    };
  }

  return undefined;
}

function baseNode(ctx: StringResolverContext): PydanticType {
  const { schema } = ctx;

  const constraints: FieldConstraints = {};

  if (schema.minLength !== undefined) {
    constraints.min_length = schema.minLength;
  }

  if (schema.maxLength !== undefined) {
    constraints.max_length = schema.maxLength;
  }

  if (schema.pattern !== undefined) {
    constraints.pattern = schema.pattern;
  }

  if (schema.description !== undefined) {
    constraints.description = schema.description;
  }

  return {
    fieldConstraints: constraints,
    type: 'str',
  };
}

function stringResolver(ctx: StringResolverContext): PydanticType {
  const constResult = ctx.nodes.const(ctx);
  if (constResult) return constResult;

  return ctx.nodes.base(ctx);
}

export function stringToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): PydanticType {
  const ctx: StringResolverContext = {
    $,
    nodes: {
      base: baseNode,
      const: constNode,
    },
    plugin,
    schema,
  };

  const resolver = plugin.config['~resolvers']?.string;
  return resolver?.(ctx) ?? stringResolver(ctx);
}
