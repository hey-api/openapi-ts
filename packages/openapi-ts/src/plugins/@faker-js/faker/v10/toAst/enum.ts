import type { SchemaWithType } from '@hey-api/shared';

import { $ } from '../../../../../ts-dsl';
import type { Expression, FakerWalkerContext } from '../../shared/types';

/**
 * Generates `(options?.faker ?? faker).helpers.arrayElement([...values])`.
 */
export function enumToExpression(
  ctx: FakerWalkerContext,
  schema: SchemaWithType<'enum'>,
): Expression {
  const members: Array<ReturnType<typeof $.literal | typeof $.fromValue>> = [];

  for (const item of schema.items ?? []) {
    if (item.const === null || item.type === 'null') {
      members.push($.fromValue(null));
    } else if (item.const !== undefined) {
      members.push($.literal(item.const as string | number));
    }
  }

  if (!members.length) {
    return $('undefined');
  }

  if (members.length === 1 && members[0]) {
    return members[0];
  }

  return ctx.fakerAccessor
    .attr('helpers')
    .attr('arrayElement')
    .call($.array(...members));
}
