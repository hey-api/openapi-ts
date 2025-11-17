import { deduplicateSchema } from '~/ir/schema';
import type { SchemaWithType } from '~/plugins';
import { toRef } from '~/plugins/shared/utils/refs';
import { $ } from '~/ts-dsl';

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

  const v = plugin.referenceSymbol({
    category: 'external',
    resource: 'valibot.v',
  });
  const functionName = $(v.placeholder).attr(identifiers.schemas.array);

  if (!schema.items) {
    const expression = functionName.call(
      unknownToAst({
        plugin,
        schema: {
          type: 'unknown',
        },
        state,
      }),
    );
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
      const expression = functionName.call(...itemExpressions);
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

      const expression = functionName.call(
        unknownToAst({
          plugin,
          schema: {
            type: 'unknown',
          },
          state,
        }),
      );
      result.pipes.push(expression);
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    const expression = $(v.placeholder)
      .attr(identifiers.actions.length)
      .call($.toExpr(schema.minItems));
    result.pipes.push(expression);
  } else {
    if (schema.minItems !== undefined) {
      const expression = $(v.placeholder)
        .attr(identifiers.actions.minLength)
        .call($.toExpr(schema.minItems));
      result.pipes.push(expression);
    }

    if (schema.maxItems !== undefined) {
      const expression = $(v.placeholder)
        .attr(identifiers.actions.maxLength)
        .call($.toExpr(schema.maxItems));
      result.pipes.push(expression);
    }
  }

  return result as Omit<Ast, 'typeName'>;
};
