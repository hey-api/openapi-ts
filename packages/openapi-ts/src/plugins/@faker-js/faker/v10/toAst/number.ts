import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { Expression, FakerWalkerContext } from '../../shared/types';
import type { PropertyNameInfo } from './nameRules';
import { numberNameToExpression } from './nameRules';

/**
 * Generates `(options?.faker ?? faker).number.int()` or `.float()`,
 * with optional `{ min, max }` constraints and property-name inference.
 *
 * For number types, schema constraints and name-based defaults are **merged**:
 * schema values override rule defaults.
 */
export function numberToExpression(
  ctx: FakerWalkerContext,
  schema: SchemaWithType<'integer' | 'number'>,
  nameInfo?: PropertyNameInfo,
): Expression {
  const isInteger = schema.type === 'integer';
  const method = isInteger ? 'int' : 'float';

  let min: number | undefined;
  let max: number | undefined;

  // For floats, exclusive bounds are passed as-is to faker's min/max options,
  // which treats them as inclusive. This is technically not strictly exclusive,
  // but fine in practice since the chance of hitting the exact bound is negligible.
  if (schema.exclusiveMinimum !== undefined) {
    min = isInteger ? schema.exclusiveMinimum + 1 : schema.exclusiveMinimum;
  } else if (schema.minimum !== undefined) {
    min = schema.minimum;
  }

  if (schema.exclusiveMaximum !== undefined) {
    max = isInteger ? schema.exclusiveMaximum - 1 : schema.exclusiveMaximum;
  } else if (schema.maximum !== undefined) {
    max = schema.maximum;
  }

  // Try property-name-based inference with merged constraints
  if (nameInfo) {
    const schemaArgs: { max?: number; min?: number } = {};
    if (min !== undefined) {
      schemaArgs.min = min;
    }
    if (max !== undefined) {
      schemaArgs.max = max;
    }
    const nameExpr = numberNameToExpression(ctx, nameInfo, schemaArgs);
    if (nameExpr) {
      return nameExpr;
    }
  }

  // Existing constraint-based logic
  if (min !== undefined || max !== undefined) {
    const options = $.object();
    if (min !== undefined) {
      options.prop('min', $.literal(min));
    }
    if (max !== undefined) {
      options.prop('max', $.literal(max));
    }
    return ctx.fakerAccessor.attr('number').attr(method).call(options);
  }

  return ctx.fakerAccessor.attr('number').attr(method).call();
}
