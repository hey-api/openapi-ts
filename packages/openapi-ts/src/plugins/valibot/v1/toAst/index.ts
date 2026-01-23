import type { SchemaWithType } from '@hey-api/shared';

import { shouldCoerceToBigInt } from '~/plugins/shared/utils/coerce';
import type { $ } from '~/ts-dsl';

import { pipesToNode } from '../../shared/pipes';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { arrayToAst } from './array';
import { booleanToAst } from './boolean';
import { enumToAst } from './enum';
import { neverToAst } from './never';
import { nullToAst } from './null';
import { numberToNode } from './number';
import { objectToAst } from './object';
import { stringToNode } from './string';
import { tupleToAst } from './tuple';
import { undefinedToAst } from './undefined';
import { unknownToAst } from './unknown';
import { voidToAst } from './void';

export const irSchemaWithTypeToAst = ({
  schema,
  ...args
}: IrSchemaToAstOptions & {
  schema: SchemaWithType;
}): {
  anyType?: string;
  expression: ReturnType<typeof $.call | typeof $.expr>;
} => {
  switch (schema.type) {
    case 'array':
      return {
        expression: pipesToNode(
          arrayToAst({
            ...args,
            schema: schema as SchemaWithType<'array'>,
          }).pipes,
          args.plugin,
        ),
      };
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
        expression: numberToNode({
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
      return {
        expression: pipesToNode(
          objectToAst({
            ...args,
            schema: schema as SchemaWithType<'object'>,
          }).pipes,
          args.plugin,
        ),
      };
    case 'string':
      return {
        expression: shouldCoerceToBigInt(schema.format)
          ? numberToNode({
              ...args,
              schema: { ...schema, type: 'number' },
            })
          : stringToNode({
              ...args,
              schema: schema as SchemaWithType<'string'>,
            }),
      };
    case 'tuple':
      return {
        expression: pipesToNode(
          tupleToAst({
            ...args,
            schema: schema as SchemaWithType<'tuple'>,
          }).pipes,
          args.plugin,
        ),
      };
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
