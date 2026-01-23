import { fromRef, ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';

import { $ } from '~/ts-dsl';

import { pipesToNode } from '../../shared/pipes';
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

  const v = plugin.external('valibot.v');
  const functionName = $(v).attr(identifiers.schemas.array);

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
          path: ref([...fromRef(state.path), 'items', index]),
        },
      });
      if (itemAst.hasLazyExpression) {
        result.hasLazyExpression = true;
      }
      return pipesToNode(itemAst.pipes, plugin);
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
    const expression = $(v)
      .attr(identifiers.actions.length)
      .call($.fromValue(schema.minItems));
    result.pipes.push(expression);
  } else {
    if (schema.minItems !== undefined) {
      const expression = $(v)
        .attr(identifiers.actions.minLength)
        .call($.fromValue(schema.minItems));
      result.pipes.push(expression);
    }

    if (schema.maxItems !== undefined) {
      const expression = $(v)
        .attr(identifiers.actions.maxLength)
        .call($.fromValue(schema.maxItems));
      result.pipes.push(expression);
    }
  }

  return result as Omit<Ast, 'typeName'>;
};
