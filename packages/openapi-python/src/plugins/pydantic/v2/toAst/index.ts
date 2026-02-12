import type { SchemaWithType } from '@hey-api/shared';

import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { objectToAst } from './object';
import { stringToNode } from './string';

export function irSchemaWithTypeToAst({
  schema,
  ...args
}: IrSchemaToAstOptions & {
  schema: SchemaWithType;
}): Ast {
  switch (schema.type) {
    case 'object':
      return objectToAst({
        ...args,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return stringToNode({
        ...args,
        schema: schema as SchemaWithType<'string'>,
      });
    default:
      return {
        // expression: 'Any',
        models: [],
        typeAnnotation: 'Any',
      };
  }
}
