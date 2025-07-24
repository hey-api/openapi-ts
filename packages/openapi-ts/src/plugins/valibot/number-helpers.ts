import { compiler } from '../../compiler';

// Integer format ranges and properties
export const INTEGER_FORMATS = {
  int16: {
    max: 32767,
    maxError: 'Invalid value: Expected int16 to be <= 2^15-1',
    min: -32768,
    minError: 'Invalid value: Expected int16 to be >= -2^15',
    needsBigInt: false,
  },
  int32: {
    max: 2147483647,
    maxError: 'Invalid value: Expected int32 to be <= 2^31-1',
    min: -2147483648,
    minError: 'Invalid value: Expected int32 to be >= -2^31',
    needsBigInt: false,
  },
  int64: {
    max: '9223372036854775807',
    maxError: 'Invalid value: Expected int64 to be <= 2^63-1',
    min: '-9223372036854775808',
    minError: 'Invalid value: Expected int64 to be >= -2^63',
    needsBigInt: true,
  },
  int8: {
    max: 127,
    maxError: 'Invalid value: Expected int8 to be <= 2^7-1',
    min: -128,
    minError: 'Invalid value: Expected int8 to be >= -2^7',
    needsBigInt: false,
  },
  uint16: {
    max: 65535,
    maxError: 'Invalid value: Expected uint16 to be <= 2^16-1',
    min: 0,
    minError: 'Invalid value: Expected uint16 to be >= 0',
    needsBigInt: false,
  },
  uint32: {
    max: 4294967295,
    maxError: 'Invalid value: Expected uint32 to be <= 2^32-1',
    min: 0,
    minError: 'Invalid value: Expected uint32 to be >= 0',
    needsBigInt: false,
  },
  uint64: {
    max: '18446744073709551615',
    maxError: 'Invalid value: Expected uint64 to be <= 2^64-1',
    min: '0',
    minError: 'Invalid value: Expected uint64 to be >= 0',
    needsBigInt: true,
  },
  uint8: {
    max: 255,
    maxError: 'Invalid value: Expected uint8 to be <= 2^8-1',
    min: 0,
    minError: 'Invalid value: Expected uint8 to be >= 0',
    needsBigInt: false,
  },
} as const;

export type IntegerFormat = keyof typeof INTEGER_FORMATS;

export const isIntegerFormat = (
  format: string | undefined,
): format is IntegerFormat => format !== undefined && format in INTEGER_FORMATS;

export const needsBigIntForFormat = (format: string | undefined): boolean =>
  isIntegerFormat(format) && INTEGER_FORMATS[format].needsBigInt;

export const numberParameter = ({
  isBigInt,
  value,
}: {
  isBigInt: boolean;
  value: unknown;
}) => {
  const expression = compiler.valueToExpression({ value });

  if (
    isBigInt &&
    (typeof value === 'bigint' ||
      typeof value === 'number' ||
      typeof value === 'string' ||
      typeof value === 'boolean')
  ) {
    return compiler.callExpression({
      functionName: 'BigInt',
      parameters: [expression],
    });
  }

  return expression;
};
