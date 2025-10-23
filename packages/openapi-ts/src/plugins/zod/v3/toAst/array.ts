import type ts from 'typescript';

import { deduplicateSchema } from '../../../../ir/schema';
import { tsc } from '../../../../tsc';
import type { SchemaWithType } from '../../../shared/types/schema';
import { toRef } from '../../../shared/utils/refs';
import { identifiers } from '../../constants';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { irSchemaToAst } from '../plugin';
import { unknownToAst } from './unknown';

export const arrayToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'array'>;
}): Omit<Ast, 'typeName'> & {
  anyType?: string;
} => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

  const functionName = tsc.propertyAccessExpression({
    expression: z.placeholder,
    name: identifiers.array,
  });

  let arrayExpression: ts.CallExpression | undefined;
  let hasLazyExpression = false;

  if (!schema.items) {
    arrayExpression = tsc.callExpression({
      functionName,
      parameters: [
        unknownToAst({
          plugin,
          schema: {
            type: 'unknown',
          },
          state,
        }),
      ],
    });
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item, index) => {
      const itemAst = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          _path: toRef([...state._path.value, 'items', index]),
        },
      });
      if (itemAst.hasLazyExpression) {
        hasLazyExpression = true;
      }
      return itemAst.expression;
    });

    if (itemExpressions.length === 1) {
      arrayExpression = tsc.callExpression({
        functionName,
        parameters: itemExpressions,
      });
    } else {
      if (schema.logicalOperator === 'and') {
        const firstSchema = schema.items![0]!;
        // we want to add an intersection, but not every schema can use the same API.
        // if the first item contains another array or not an object, we cannot use
        // `.and()` as that does not exist on `.union()` and non-object schemas.
        let intersectionExpression: ts.Expression;
        if (
          firstSchema.logicalOperator === 'or' ||
          (firstSchema.type && firstSchema.type !== 'object')
        ) {
          intersectionExpression = tsc.callExpression({
            functionName: tsc.propertyAccessExpression({
              expression: z.placeholder,
              name: identifiers.intersection,
            }),
            parameters: itemExpressions,
          });
        } else {
          intersectionExpression = itemExpressions[0]!;
          for (let i = 1; i < itemExpressions.length; i++) {
            intersectionExpression = tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: intersectionExpression,
                name: identifiers.and,
              }),
              parameters: [itemExpressions[i]!],
            });
          }
        }

        arrayExpression = tsc.callExpression({
          functionName,
          parameters: [intersectionExpression],
        });
      } else {
        arrayExpression = tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.array,
          }),
          parameters: [
            tsc.callExpression({
              functionName: tsc.propertyAccessExpression({
                expression: z.placeholder,
                name: identifiers.union,
              }),
              parameters: [
                tsc.arrayLiteralExpression({
                  elements: itemExpressions,
                }),
              ],
            }),
          ],
        });
      }
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    arrayExpression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: arrayExpression,
        name: identifiers.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minItems })],
    });
  } else {
    if (schema.minItems !== undefined) {
      arrayExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: arrayExpression,
          name: identifiers.min,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minItems })],
      });
    }

    if (schema.maxItems !== undefined) {
      arrayExpression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: arrayExpression,
          name: identifiers.max,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxItems })],
      });
    }
  }

  return {
    expression: arrayExpression,
    hasLazyExpression,
  };
};
