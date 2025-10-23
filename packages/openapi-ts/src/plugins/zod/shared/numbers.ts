import type ts from 'typescript';

import { tsc } from '~/tsc';

export const numberParameter = ({
  isBigInt,
  value,
}: {
  isBigInt: boolean;
  value: unknown;
}): ts.Expression | undefined => {
  const expression = tsc.valueToExpression({ value });

  if (
    isBigInt &&
    (typeof value === 'bigint' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean')
  ) {
    return tsc.callExpression({
      functionName: 'BigInt',
      parameters: [expression],
    });
  }

  return expression;
};
