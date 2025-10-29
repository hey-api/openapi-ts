import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { IrSchemaToAstOptions } from '../../shared/types';
import { unknownToAst } from './unknown';

export const enumToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'enum'>;
}): ts.CallExpression => {
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  const enumMembers: Array<ts.LiteralExpression> = [];
  const literalMembers: Array<ts.CallExpression> = [];

  let isNullable = false;
  let allStrings = true;

  for (const item of schema.items ?? []) {
    // Zod supports string, number, and boolean enums
    if (item.type === 'string' && typeof item.const === 'string') {
      const stringLiteral = tsc.stringLiteral({
        text: item.const,
      });
      enumMembers.push(stringLiteral);
      literalMembers.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.literal,
          }),
          parameters: [stringLiteral],
        }),
      );
    } else if (
      (item.type === 'number' || item.type === 'integer') &&
      typeof item.const === 'number'
    ) {
      allStrings = false;
      const numberLiteral = tsc.ots.number(item.const);
      literalMembers.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.literal,
          }),
          parameters: [numberLiteral],
        }),
      );
    } else if (item.type === 'boolean' && typeof item.const === 'boolean') {
      allStrings = false;
      const booleanLiteral = tsc.ots.boolean(item.const);
      literalMembers.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.literal,
          }),
          parameters: [booleanLiteral],
        }),
      );
    } else if (item.type === 'null' || item.const === null) {
      isNullable = true;
    }
  }

  if (!literalMembers.length) {
    return unknownToAst({
      plugin,
      schema: {
        type: 'unknown',
      },
      state,
    });
  }

  // Use z.enum() for pure string enums, z.union() for mixed or non-string types
  let enumExpression: ts.CallExpression;
  if (allStrings && enumMembers.length > 0) {
    enumExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.enum,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: enumMembers,
          multiLine: false,
        }),
      ],
    });
  } else if (literalMembers.length === 1) {
    // For single-member unions, use the member directly instead of wrapping in z.union()
    enumExpression = literalMembers[0]!;
  } else {
    enumExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.union,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: literalMembers,
          multiLine: literalMembers.length > 3,
        }),
      ],
    });
  }

  if (isNullable) {
    enumExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: enumExpression,
        name: identifiers.nullable,
      }),
    });
  }

  return enumExpression;
};
