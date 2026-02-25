import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { PydanticResult, PydanticType } from '../../shared/types';
import type { PydanticPlugin } from '../../types';

export function numberToType({
  plugin,
  schema,
}: {
  plugin: PydanticPlugin['Instance'];
  schema: SchemaWithType<'integer' | 'number'>;
}): PydanticType {
  const constraints: Required<PydanticResult>['fieldConstraints'] = {};

  if (typeof schema.const === 'number') {
    const literal = plugin.external('typing.Literal');
    return {
      typeAnnotation: $(literal).slice($.literal(schema.const)),
    };
  }

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
    typeAnnotation: schema.type === 'integer' ? 'int' : 'float',
  };
}
