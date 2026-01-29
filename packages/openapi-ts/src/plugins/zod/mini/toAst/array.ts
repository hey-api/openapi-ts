import { fromRef, ref } from '@hey-api/codegen-core';
import type { SchemaWithType } from '@hey-api/shared';
import { deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
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
  const z = plugin.external('zod.z');

  const result: Partial<Omit<Ast, 'typeName'>> = {};

  const functionName = $(z).attr(identifiers.array);

  if (!schema.items) {
    result.expression = functionName.call(
      unknownToAst({
        plugin,
        schema: {
          type: 'unknown',
        },
        state,
      }).expression,
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
        result.hasLazyExpression = true;
      }
      return itemAst.expression;
    });

    if (itemExpressions.length === 1) {
      result.expression = functionName.call(...itemExpressions);
    } else {
      if (schema.logicalOperator === 'and') {
        const firstSchema = schema.items![0]!;
        // we want to add an intersection, but not every schema can use the same API.
        // if the first item contains another array or not an object, we cannot use
        // `.intersection()` as that does not exist on `.union()` and non-object schemas.
        let intersectionExpression: ReturnType<typeof $.expr | typeof $.call>;
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
            intersectionExpression = $(z)
              .attr(identifiers.intersection)
              .call(intersectionExpression, itemExpressions[i]);
          }
        }

        result.expression = functionName.call(intersectionExpression);
      } else {
        result.expression = $(z)
          .attr(identifiers.array)
          .call(
            $(z)
              .attr(identifiers.union)
              .call($.array(...itemExpressions)),
          );
      }
    }
  }

  const checks: Array<ReturnType<typeof $.call>> = [];

  if (schema.minItems === schema.maxItems && schema.minItems !== undefined) {
    checks.push(
      $(z).attr(identifiers.length).call($.fromValue(schema.minItems)),
    );
  } else {
    if (schema.minItems !== undefined) {
      checks.push(
        $(z).attr(identifiers.minLength).call($.fromValue(schema.minItems)),
      );
    }

    if (schema.maxItems !== undefined) {
      checks.push(
        $(z).attr(identifiers.maxLength).call($.fromValue(schema.maxItems)),
      );
    }
  }

  if (checks.length > 0) {
    result.expression = result.expression
      .attr(identifiers.check)
      .call(...checks);
  }

  return result as Omit<Ast, 'typeName'>;
};
