import type ts from 'typescript';

import { deduplicateSchema } from '~/ir/schema';
import type { SchemaWithType } from '~/plugins/shared/types/schema';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';

import type { IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { pipesToAst } from '../pipesToAst';
import { irSchemaToAst } from '../plugin';
import { unknownToAst } from './unknown';

export const arrayToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'array'>;
}): ts.Expression => {
  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );
  const functionName = tsc.propertyAccessExpression({
    expression: v.placeholder,
    name: identifiers.schemas.array,
  });

  const pipes: Array<ts.CallExpression> = [];

  if (!schema.items) {
    const expression = tsc.callExpression({
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
    pipes.push(expression);
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item, index) => {
      const schemaPipes = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          path: toRef([...state.path.value, 'items', index]),
        },
      });
      return pipesToAst({ pipes: schemaPipes, plugin });
    });

    if (itemExpressions.length === 1) {
      const expression = tsc.callExpression({
        functionName,
        parameters: itemExpressions,
      });
      pipes.push(expression);
    } else {
      if (schema.logicalOperator === 'and') {
        // TODO: parser - handle intersection
        // return tsc.typeArrayNode(
        //   tsc.typeIntersectionNode({ types: itemExpressions }),
        // );
      }

      // TODO: parser - handle union
      // return tsc.typeArrayNode(tsc.typeUnionNode({ types: itemExpressions }));

      const expression = tsc.callExpression({
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
      pipes.push(expression);
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    const expression = tsc.callExpression({
      functionName: tsc.propertyAccessExpression({
        expression: v.placeholder,
        name: identifiers.actions.length,
      }),
      parameters: [tsc.valueToExpression({ value: schema.minItems })],
    });
    pipes.push(expression);
  } else {
    if (schema.minItems !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.minLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minItems })],
      });
      pipes.push(expression);
    }

    if (schema.maxItems !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.maxLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxItems })],
      });
      pipes.push(expression);
    }
  }

  return pipesToAst({ pipes, plugin });
};
