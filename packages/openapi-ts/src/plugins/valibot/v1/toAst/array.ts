import { deduplicateSchema } from '~/ir/schema';
import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { tsc } from '~/tsc';

import { pipesToAst } from '../../shared/pipesToAst';
import type { Ast, IrSchemaToAstOptions } from '../../shared/types';
import { identifiers } from '../constants';
import { irSchemaToAst } from '../plugin';
import { unknownToAst } from './unknown';

export const arrayToAst = ({
  plugin,
  schema,
  state,
}: IrSchemaToAstOptions & {
  schema: SchemaWithType<'array'>;
}): Omit<Ast, 'typeName'> => {
  const result: Omit<Ast, 'typeName'> = {
    pipes: [],
  };

  const v = plugin.referenceSymbol(
    plugin.api.selector('external', 'valibot.v'),
  );
  const functionName = tsc.propertyAccessExpression({
    expression: v.placeholder,
    name: identifiers.schemas.array,
  });

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
    result.pipes.push(expression);
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item, index) => {
      const itemAst = irSchemaToAst({
        plugin,
        schema: item,
        state: {
          ...state,
          path: toRef([...state.path.value, 'items', index]),
        },
      });
      if (itemAst.hasLazyExpression) {
        result.hasLazyExpression = true;
      }
      return pipesToAst({ pipes: itemAst.pipes, plugin });
    });

    if (itemExpressions.length === 1) {
      const expression = tsc.callExpression({
        functionName,
        parameters: itemExpressions,
      });
      result.pipes.push(expression);
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
      result.pipes.push(expression);
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
    result.pipes.push(expression);
  } else {
    if (schema.minItems !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.minLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.minItems })],
      });
      result.pipes.push(expression);
    }

    if (schema.maxItems !== undefined) {
      const expression = tsc.callExpression({
        functionName: tsc.propertyAccessExpression({
          expression: v.placeholder,
          name: identifiers.actions.maxLength,
        }),
        parameters: [tsc.valueToExpression({ value: schema.maxItems })],
      });
      result.pipes.push(expression);
    }
  }

  return result as Omit<Ast, 'typeName'>;
};
