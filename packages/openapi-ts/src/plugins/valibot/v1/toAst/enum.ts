import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { unknownToAst } from './unknown';

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): ts.CallExpression => {
  const enumMembers: Array<ts.LiteralExpression> = [];

  let isNullable = false;

  for (const item of schema.items ?? []) {
    // Zod supports only string enums
    if (item.type === 'string' && typeof item.const === 'string') {
      enumMembers.push(
        tsc.stringLiteral({
          text: item.const,
        }),
      );
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  if (!enumMembers.length) {
    return unknownToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
  }

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });

  let resultExpression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: v.placeholder,
      name: identifiers.schemas.picklist,
    }),
    parameters: [
      tsc.arrayLiteralExpression({
        elements: enumMembers,
        multiLine: false,
      }),
    ],
  });

  if (isNullable) {
    resultExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.schemas.nullable,
      }),
      parameters: [resultExpression],
    });
  }

  return resultExpression;
};
