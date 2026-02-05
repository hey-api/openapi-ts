import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../py-dsl';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';

export const stringToNode = ({
  schema,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'string'>;
}): Ast => {
  const constraints: Record<string, unknown> = {};

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

  if (typeof schema.const === 'string') {
    return {
      expression: $.expr(`Literal["${schema.const}"]`),
      fieldConstraints: constraints,
      hasLazyExpression: false,
      pipes: [],
      typeAnnotation: `Literal["${schema.const}"]`,
    };
  }

  return {
    expression: $.expr('str'),
    fieldConstraints: constraints,
    hasLazyExpression: false,
    pipes: [],
    typeAnnotation: 'str',
  };
};
