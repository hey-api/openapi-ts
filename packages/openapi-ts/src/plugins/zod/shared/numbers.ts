import { $ } from '~/ts-dsl';

export const numberParameter = ({
  isBigInt,
  value,
}: {
  isBigInt: boolean;
  value: unknown;
}): ReturnType<typeof $.call | typeof $.fromValue> => {
  const expr = $.fromValue(value);

  if (
    isBigInt &&
    (typeof value === 'bigint' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean')
  ) {
    return $('BigInt').call(expr);
  }

  return expr;
};
