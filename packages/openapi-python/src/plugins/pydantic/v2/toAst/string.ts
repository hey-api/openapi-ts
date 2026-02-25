import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export function stringToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'string'>;
}): PydanticType {
  const constraints: Required<PydanticResult>['fieldConstraints'] = {};

  if (typeof schema.const === 'string') {
    const literal = plugin.external('typing.Literal');
    return {
      typeAnnotation: $(literal).slice($.literal(schema.const)),
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
    typeAnnotation: 'str',
  };
}
