import { $ } from '~/ts-dsl';

export const numberParameter = ({
  isBigInt,
  value,
}: {
  isBigInt: boolean;
  value: unknown;
}): ReturnType<typeof $.call> | ReturnType<typeof $.toExpr> | undefined => {
  const expr = $.toExpr(value);

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
