import type ts from 'typescript';

import type { SchemaWithType } from '~/plugins/shared/types/schema';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';

import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';

export const tupleToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'tuple'>;
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

  const result: Partial<Omit<Ast, 'typeName'>> = {};

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
    result.expression = tsc.callExpression({
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
    return result as Omit<Ast, 'typeName'>;
  }

  const tupleElements: Array<ts.Expression> = [];

  if (schema.items) {
    schema.items.forEach((item, index) => {
      const itemSchema = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          path: toRef([...state.path.value, 'items', index]),
        },
      });
      tupleElements.push(itemSchema.expression);
      if (itemSchema.hasLazyExpression) {
        result.hasLazyExpression = true;
      }
    });
  }

  result.expression = tsc.callExpression({
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

  return result as Omit<Ast, 'typeName'>;
};
