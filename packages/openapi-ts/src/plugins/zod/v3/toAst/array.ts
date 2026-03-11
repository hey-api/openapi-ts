import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Chain } from '../../shared/chain';
import type { CompositeHandlerResult, ZodFinal, ZodResult } from '../../shared/types';
import type { ZodPlugin } from '../../types';
import { unknownToAst } from './unknown';

interface ArrayToAstOptions {
  applyModifiers: (result: ZodResult, opts: { optional?: boolean }) => ZodFinal;
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  walk: Walker<ZodResult, ZodPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ZodPlugin['Instance']>;
}

type AstExpression = Chain;

export function arrayToAst({
  applyModifiers,
  plugin,
  schema,
  walk,
  walkerCtx,
}: ArrayToAstOptions): CompositeHandlerResult {
  const childResults: Array<ZodResult> = [];
  let schemaCopy = schema;

  const z = plugin.external('zod.z');
  const functionName = $(z).attr(identifiers.array);

  let arrayExpression: ReturnType<typeof $.call> | undefined;

  if (!schemaCopy.items) {
    arrayExpression = functionName.call(
      unknownToAst({
        plugin,
        schema: {
          type: 'unknown',
        },
      }),
    );
  } else {
    schemaCopy = deduplicateSchema({ schema: schemaCopy });

    const itemExpressions: Array<Chain> = [];

    schemaCopy.items!.forEach((item, index) => {
      const itemResult = walk(item, childContext(walkerCtx, 'items', index));
      childResults.push(itemResult);

      const finalExpr = applyModifiers(itemResult, { optional: false });
      itemExpressions.push(finalExpr.expression);
    });

    if (itemExpressions.length === 1) {
      arrayExpression = functionName.call(...itemExpressions);
    } else {
      if (schemaCopy.logicalOperator === 'and') {
        const firstSchema = schemaCopy.items![0]!;
        let intersectionExpression: AstExpression;
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

  if (schemaCopy.minItems === schemaCopy.maxItems && schemaCopy.minItems !== undefined) {
    arrayExpression = arrayExpression
      .attr(identifiers.length)
      .call($.fromValue(schemaCopy.minItems));
  } else {
    if (schemaCopy.minItems !== undefined) {
      arrayExpression = arrayExpression
        .attr(identifiers.min)
        .call($.fromValue(schemaCopy.minItems));
    }

    if (schemaCopy.maxItems !== undefined) {
      arrayExpression = arrayExpression
        .attr(identifiers.max)
        .call($.fromValue(schemaCopy.maxItems));
    }
  }

  return {
    childResults,
    expression: arrayExpression,
  };
}
