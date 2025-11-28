import { fromRef, ref } from '@hey-api/codegen-core';

import { deduplicateSchema } from '~/ir/schema';
import type { SchemaWithType } from '~/plugins';
import { $ } from '~/ts-dsl';

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
  const z = plugin.referenceSymbol({
    category: 'external',
    resource: 'zod.z',
  });

  const functionName = $(z).attr(identifiers.array);

  let arrayExpression: ReturnType<typeof $.call> | undefined;
  let hasLazyExpression = false;

  if (!schema.items) {
    arrayExpression = functionName.call(
      unknownToAst({
        plugin,
        schema: {
          type: 'unknown',
        },
        state,
      }),
    );
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
        hasLazyExpression = true;
      }
      return itemAst.expression;
    });

    if (itemExpressions.length === 1) {
      arrayExpression = functionName.call(...itemExpressions);
    } else {
      if (schema.logicalOperator === 'and') {
        const firstSchema = schema.items![0]!;
        // we want to add an intersection, but not every schema can use the same API.
        // if the first item contains another array or not an object, we cannot use
        // `.and()` as that does not exist on `.union()` and non-object schemas.
        let intersectionExpression: ReturnType<typeof $.call | typeof $.expr>;
        if (
          firstSchema.logicalOperator === 'or' ||
          (firstSchema.type && firstSchema.type !== 'object')
        ) {
          intersectionExpression = $(z)
            .attr(identifiers.intersection)
            .call(...itemExpressions);
        } else {
          intersectionExpression = itemExpressions[0]!;
          for (let i = 1; i < itemExpressions.length; i++) {
            intersectionExpression = intersectionExpression
              .attr(identifiers.and)
              .call(itemExpressions[i]);
          }
        }

        arrayExpression = functionName.call(intersectionExpression);
      } else {
        arrayExpression = $(z)
          .attr(identifiers.array)
          .call(
            $(z)
              .attr(identifiers.union)
              .call($.array(...itemExpressions)),
          );
      }
    }
  }

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    arrayExpression = arrayExpression
      .attr(identifiers.length)
      .call($.fromValue(schema.minItems));
  } else {
    if (schema.minItems !== undefined) {
      arrayExpression = arrayExpression
        .attr(identifiers.min)
        .call($.fromValue(schema.minItems));
    }

    if (schema.maxItems !== undefined) {
      arrayExpression = arrayExpression
        .attr(identifiers.max)
        .call($.fromValue(schema.maxItems));
    }
  }

  return {
    expression: arrayExpression,
    hasLazyExpression,
  };
};
