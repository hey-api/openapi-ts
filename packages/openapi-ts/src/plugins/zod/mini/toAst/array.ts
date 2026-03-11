import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../ts-dsl';
import { identifiers } from '../../constants';
import type { Chain } from '../../shared/chain';
import type { CompositeHandlerResult, ZodFinal, ZodResult } from '../../shared/types';
import type { ZodPlugin } from '../../types';
import { unknownToAst } from './unknown';

export function arrayToAst({
  applyModifiers,
  plugin,
  schema,
  walk,
  walkerCtx,
}: {
  applyModifiers: (result: ZodResult, opts: { optional?: boolean }) => ZodFinal;
  plugin: ZodPlugin['Instance'];
  schema: SchemaWithType<'array'>;
  walk: Walker<ZodResult, ZodPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<ZodPlugin['Instance']>;
}): CompositeHandlerResult {
  const childResults: Array<ZodResult> = [];
  let schemaCopy = schema;

  const z = plugin.external('zod.z');
  const functionName = $(z).attr(identifiers.array);

  let arrayExpression: ReturnType<typeof $.call> | undefined;

  if (!schemaCopy.items) {
    arrayExpression = functionName.call(
      unknownToAst({
        plugin,
        schema: { type: 'unknown' },
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
        arrayExpression = functionName.call(
          $(z)
            .attr(identifiers.intersection)
            .call(...itemExpressions),
        );
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
    const checks: Array<ReturnType<typeof $.call>> = [];

    if (schemaCopy.minItems !== undefined) {
      checks.push($(z).attr(identifiers.minLength).call($.fromValue(schemaCopy.minItems)));
    }

    if (schemaCopy.maxItems !== undefined) {
      checks.push($(z).attr(identifiers.maxLength).call($.fromValue(schemaCopy.maxItems)));
    }

    if (checks.length) {
      arrayExpression = arrayExpression.attr(identifiers.check).call(...checks);
    }
  }

  return {
    childResults,
    expression: arrayExpression,
  };
}
