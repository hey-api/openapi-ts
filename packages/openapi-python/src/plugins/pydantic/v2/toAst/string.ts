import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';
import type { FieldConstraints } from '../constants';

export function stringToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): PydanticType {
  const constraints: FieldConstraints = {};

  if (typeof schema.const === 'string') {
    const literal = plugin.external('typing.Literal');
    return {
      type: $(literal).slice($.literal(schema.const)),
    };
  }

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
