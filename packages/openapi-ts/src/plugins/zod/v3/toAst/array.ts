import type { SchemaWithType } from '@hey-api/shared';
import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type {
  Ast,
  IrSchemaToAstOptions,
  ZodAppliedResult,
  ZodSchemaResult,
} from '../../shared/types';
import { unknownToAst } from './unknown';

export function arrayToAst(
  options: IrSchemaToAstOptions & {
    applyModifiers: (result: ZodSchemaResult, opts: { optional?: boolean }) => ZodAppliedResult;
    schema: SchemaWithType<'array'>;
  },
): Omit<Ast, 'typeName'> {
  const { applyModifiers, plugin, walk } = options;
  let { schema } = options;

  const z = plugin.external('zod.z');

  const functionName = $(z).attr(identifiers.array);

  let arrayExpression: ReturnType<typeof $.call> | undefined;
  let hasLazyExpression = false;

  if (!schema.items) {
    arrayExpression = functionName.call(
      unknownToAst({
        ...options,
        schema: {
          type: 'unknown',
        },
      }),
    );
  } else {
    schema = deduplicateSchema({ schema });

    // at least one item is guaranteed
    const itemExpressions = schema.items!.map((item, index) => {
      const itemResult = walk(
        item,
        childContext(
          {
            path: options.state.path,
            plugin: options.plugin,
          },
          'items',
          index,
        ),
      );
      if (itemResult.hasLazyExpression) {
        hasLazyExpression = true;
      }

      const finalExpr = applyModifiers(itemResult, { optional: false });
      return finalExpr.expression;
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
    arrayExpression = arrayExpression.attr(identifiers.length).call($.fromValue(schema.minItems));
  } else {
    if (schema.minItems !== undefined) {
      arrayExpression = arrayExpression.attr(identifiers.min).call($.fromValue(schema.minItems));
    }

    if (schema.maxItems !== undefined) {
      arrayExpression = arrayExpression.attr(identifiers.max).call($.fromValue(schema.maxItems));
    }
  }

  return {
    expression: arrayExpression,
    hasLazyExpression,
  };
}
