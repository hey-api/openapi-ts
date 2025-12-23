import { $ } from '~/ts-dsl';

export const shouldCoerceToBigInt = (format: string | undefined): boolean =>
  format === 'int64' || format === 'uint64';

export const maybeBigInt = (
  value: unknown,
  format: string | undefined,
): ReturnType<typeof $.fromValue> => {
  if (!shouldCoerceToBigInt(format)) {
    return $.fromValue(value);
  }

  if (typeof value === 'string') {
    // handle invalid input
    if (value.endsWith('n')) value = value.slice(0, -1);
    return $('BigInt').call($.fromValue(value));
  }

  if (typeof value === 'number') {
    return $('BigInt').call($.fromValue(value));
  }

  return $.fromValue(value);
};
