import ts from 'typescript';

import type { SchemaWithType } from '../../../shared/types/schema';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
// import { arrayToAst } from "./array";
// import { booleanToAst } from "./boolean";
// import { enumToAst } from "./enum";
// import { neverToAst } from "./never";
// import { nullToAst } from "./null";
// import { numberToAst } from "./number";
// import { objectToAst } from "./object";
// import { stringToAst } from "./string";
// import { tupleToAst } from "./tuple";
// import { undefinedToAst } from "./undefined";
// import { unknownToAst } from "./unknown";
// import { voidToAst } from "./void";

export const irSchemaWithTypeToAst = ({
  schema,
  ...args
}: IrSchemaToAstOptions & {
  schema: SchemaWithType;
}): Omit<Ast, 'typeName'> => {
  const type = args.plugin.referenceSymbol(
    args.plugin.api.getSelector('external', 'arktype.type'),
  );

  const expression = ts.factory.createCallExpression(
    ts.factory.createIdentifier(type.placeholder),
    undefined,
    [
      ts.factory.createObjectLiteralExpression(
        [
          ts.factory.createPropertyAssignment(
            'name',
            ts.factory.createStringLiteral('string'),
          ),
          ts.factory.createPropertyAssignment(
            'platform',
            ts.factory.createStringLiteral("'android' | 'ios'"),
          ),
          ts.factory.createPropertyAssignment(
            ts.factory.createComputedPropertyName(
              ts.factory.createStringLiteral('versions?'),
            ),
            ts.factory.createStringLiteral('(number | string)[]'),
          ),
        ],
        true,
      ),
    ],
  );

  switch (schema.type) {
    // case 'array':
    //   return arrayToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'array'>,
    //   });
    // case 'boolean':
    //   return booleanToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'boolean'>,
    //   });
    // case 'enum':
    //   return enumToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'enum'>,
    //   });
    // case 'integer':
    // case 'number':
    //   return numberToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'integer' | 'number'>,
    //   });
    // case 'never':
    //   return neverToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'never'>,
    //   });
    // case 'null':
    //   return nullToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'null'>,
    //   });
    // case 'object':
    //   return objectToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'object'>,
    //   });
    // case 'string':
    //   return stringToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'string'>,
    //   });
    // case 'tuple':
    //   return tupleToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'tuple'>,
    //   });
    // case 'undefined':
    //   return undefinedToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'undefined'>,
    //   });
    // case 'unknown':
    //   return unknownToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'unknown'>,
    //   });
    // case 'void':
    //   return voidToAst({
    //     ...args,
    //     schema: schema as SchemaWithType<'void'>,
    //   });
    default:
      return {
        expression,
        hasCircularReference: false,
      };
  }
};
