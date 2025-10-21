import type ts from 'typescript';

import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const tupleToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'tuple'>;
}): Omit<Ast, 'typeName'> & {
  anyType?: string;
} => {
  const z = plugin.referenceSymbol(plugin.api.getSelector('external', 'zod.z'));

  let hasCircularReference = false;

  if (schema.const && Array.isArray(schema.const)) {
    const tupleElements = schema.const.map((value) =>
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.literal,
        }),
        parameters: [tsc.valueToExpression({ value })],
      }),
    );
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: z.placeholder,
        name: identifiers.tuple,
      }),
      parameters: [
        tsc.arrayLiteralExpression({
          elements: tupleElements,
        }),
      ],
    });
    return {
      expression,
      hasCircularReference,
    };
  }

  const tupleElements: Array<ts.Expression> = [];

  if (schema.items) {
    schema.items.forEach((item, index) => {
      const itemSchema = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          _path: [...state._path, 'items', index],
        },
      });
      tupleElements.push(itemSchema.expression);
      if (itemSchema.hasCircularReference) {
        hasCircularReference = true;
      }
    });
  }

  const expression = tsc.callExpression({
    functionName: tsc.propertyAccessExpression({
      expression: z.placeholder,
      name: identifiers.tuple,
    }),
    parameters: [
      tsc.arrayLiteralExpression({
        elements: tupleElements,
      }),
    ],
  });
  return {
    expression,
    hasCircularReference,
  };
};
