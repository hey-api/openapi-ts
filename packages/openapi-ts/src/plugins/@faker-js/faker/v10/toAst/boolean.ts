import type { Expression, FakerWalkerContext } from '../../shared/types';

/**
 * Generates `(options?.faker ?? faker).datatype.boolean()`.
 */
export function booleanToExpression(ctx: FakerWalkerContext): Expression {
  return ctx.fakerAccessor.attr('datatype').attr('boolean').call();
}
