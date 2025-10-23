import type { SchemaWithType } from '~/plugins/shared/types/schema';

import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { arrayToAst } from './array';
import { booleanToAst } from './boolean';
import { enumToAst } from './enum';
import { neverToAst } from './never';
import { nullToAst } from './null';
import { numberToAst } from './number';
import { objectToAst } from './object';
import { stringToAst } from './string';
import { tupleToAst } from './tuple';
import { undefinedToAst } from './undefined';
import { unknownToAst } from './unknown';
import { voidToAst } from './void';

export const irSchemaWithTypeToAst = ({
  schema,
  ...args
}: IrSchemaToAstOptions & {
  schema: SchemaWithType;
}): Omit<Ast, 'typeName'> & {
  anyType?: string;
} => {
  switch (schema.type) {
    case 'array':
      return arrayToAst({
        ...args,
        schema: schema as SchemaWithType<'array'>,
      });
    case 'boolean':
      return {
        expression: booleanToAst({
          ...args,
          schema: schema as SchemaWithType<'boolean'>,
        }),
      };
    case 'enum':
      return {
        expression: enumToAst({
          ...args,
          schema: schema as SchemaWithType<'enum'>,
        }),
      };
    case 'integer':
    case 'number':
      return {
        expression: numberToAst({
          ...args,
          schema: schema as SchemaWithType<'integer' | 'number'>,
        }),
      };
    case 'never':
      return {
        expression: neverToAst({
          ...args,
          schema: schema as SchemaWithType<'never'>,
        }),
      };
    case 'null':
      return {
        expression: nullToAst({
          ...args,
          schema: schema as SchemaWithType<'null'>,
        }),
      };
    case 'object':
      return objectToAst({
        ...args,
        schema: schema as SchemaWithType<'object'>,
      });
    case 'string':
      return {
        expression: stringToAst({
          ...args,
          schema: schema as SchemaWithType<'string'>,
        }),
      };
    case 'tuple':
      return tupleToAst({
        ...args,
        schema: schema as SchemaWithType<'tuple'>,
      });
    case 'undefined':
      return {
        expression: undefinedToAst({
          ...args,
          schema: schema as SchemaWithType<'undefined'>,
        }),
      };
    case 'unknown':
      return {
        expression: unknownToAst({
          ...args,
          schema: schema as SchemaWithType<'unknown'>,
        }),
      };
    case 'void':
      return {
        expression: voidToAst({
          ...args,
          schema: schema as SchemaWithType<'void'>,
        }),
      };
  }
};
