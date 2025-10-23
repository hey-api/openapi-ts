import type ts from 'typescript';

import { deduplicateSchema } from '~/ir/schema';
import type { SchemaWithType } from '~/plugins/shared/types/schema';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';

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
}): Omit<Ast, 'typeName'> => {
  const z = plugin.referenceSymbol(plugin.api.selector('external', 'zod.z'));

  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const functionName = tsc.propertyAccessExpression({
    expression: z.placeholder,
    name: identifiers.array,
  });

  if (!schema.items) {
    result.expression = tsc.callExpression({
      functionName,
      parameters: [
        unknownToAst({
          plugin,
          schema: {
            type: 'unknown',
          },
          state,
        }).expression,
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
        result.hasLazyExpression = true;
      }
      return itemAst.expression;
    });

    if (itemExpressions.length === 1) {
      result.expression = tsc.callExpression({
        functionName,
        parameters: itemExpressions,
      });
    } else {
      if (schema.logicalOperator === 'and') {
        const firstSchema = schema.items![0]!;
        // we want to add an intersection, but not every schema can use the same API.
        // if the first item contains another array or not an object, we cannot use
        // `.intersection()` as that does not exist on `.union()` and non-object schemas.
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
                expression: z.placeholder,
                name: identifiers.intersection,
              }),
              parameters: [intersectionExpression, itemExpressions[i]!],
            });
          }
        }

        result.expression = tsc.callExpression({
          functionName,
          parameters: [intersectionExpression],
        });
      } else {
        result.expression = tsc.callExpression({
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

  const checks: Array<ts.Expression> = [];

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    checks.push(
      tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: z.placeholder,
          name: identifiers.length,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minItems })],
      }),
    );
  } else {
    if (schema.minItems !== undefined) {
      checks.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.minLength,
          }),
          parameters: [tsc.valueToExpression({ value: schema.minItems })],
        }),
      );
    }

    if (schema.maxItems !== undefined) {
      checks.push(
        tsc.callExpression({
          functionName: tsc.propertyAccessExpression({
            expression: z.placeholder,
            name: identifiers.maxLength,
          }),
          parameters: [tsc.valueToExpression({ value: schema.maxItems })],
        }),
      );
    }
  }

  if (checks.length) {
    result.expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: result.expression,
        name: identifiers.check,
      }),
      parameters: checks,
    });
  }

  return result as Omit<Ast, 'typeName'>;
};
