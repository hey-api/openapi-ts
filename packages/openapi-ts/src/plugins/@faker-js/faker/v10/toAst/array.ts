import type { SchemaVisitorContext, SchemaWithType, Walker } from '@hey-api/shared';
import { childContext, deduplicateSchema } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { Expression, FakerResult, FakerWalkerContext } from '../../shared/types';
import type { FakerJsFakerPlugin } from '../../types';

/**
 * Generates `(options?.faker ?? faker).helpers.multiple(() => <item expr>)`.
 */
export function arrayToExpression({
  fakerCtx,
  schema,
  walk,
  walkerCtx,
}: {
  fakerCtx: FakerWalkerContext;
  schema: SchemaWithType<'array'>;
  walk: Walker<FakerResult, FakerJsFakerPlugin['Instance']>;
  walkerCtx: SchemaVisitorContext<FakerJsFakerPlugin['Instance']>;
}): { expression: Expression; hasCircularRef: boolean; usesFaker: boolean } {
  let normalizedSchema: SchemaWithType<'array'> = schema;
  if (normalizedSchema.items) {
    normalizedSchema = deduplicateSchema({ schema: normalizedSchema }) as SchemaWithType<'array'>;
  }

  let itemExpr: Expression;
  let hasCircularRef = false;

  if (normalizedSchema.items && normalizedSchema.items.length > 0) {
    // When the array has multiple items with a logicalOperator (e.g. allOf/anyOf on array items),
    // construct a wrapper schema so the walker dispatches to intersection/union properly.
    const itemSchema =
      normalizedSchema.items.length > 1
        ? { items: normalizedSchema.items, logicalOperator: normalizedSchema.logicalOperator }
        : normalizedSchema.items[0]!;
    const result = walk(itemSchema, childContext(walkerCtx, 'items', 0));
    if (result.resultType === 'never') {
      return { expression: $.array(), hasCircularRef: false, usesFaker: false };
    }
    itemExpr = result.expression;
    hasCircularRef = result.hasCircularRef ?? false;
  } else {
    itemExpr = $('undefined');
  }

  const callback = $.func().arrow().do($.return(itemExpr));

  let arrayExpr: Expression;
  // faker requires both min and max — fill in sensible defaults when only one is specified
  if (schema.minItems !== undefined || schema.maxItems !== undefined) {
    const min = schema.minItems ?? 0;
    const max = schema.maxItems ?? 100;
    const countObj = $.object().prop('min', $.literal(min)).prop('max', $.literal(max));
    const options = $.object().prop('count', countObj);
    arrayExpr = fakerCtx.fakerAccessor.attr('helpers').attr('multiple').call(callback, options);
  } else {
    arrayExpr = fakerCtx.fakerAccessor.attr('helpers').attr('multiple').call(callback);
  }

  // For circular refs, guard with depth check: _callDepth > MAX_CALL_DEPTH ? [] : f.helpers.multiple(...)
  if (hasCircularRef) {
    fakerCtx.tracking.needsMaxCallDepth = true;
    const depthExceeded = $('_callDepth').gt($('MAX_CALL_DEPTH'));
    arrayExpr = $.ternary(depthExceeded).do($.array()).otherwise(arrayExpr);
  }

  return { expression: arrayExpr, hasCircularRef, usesFaker: true };
}
