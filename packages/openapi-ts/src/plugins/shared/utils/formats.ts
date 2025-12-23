type Range = number | string;

interface IntegerLimit {
  maxError: string;
  maxValue: Range;
  minError: string;
  minValue: Range;
}

const rangeErrors = (format: string, range: [Range, Range]) => ({
  maxError: `Invalid value: Expected ${format} to be <= ${range[1]}`,
  minError: `Invalid value: Expected ${format} to be >= ${range[0]}`,
});

const integerRange: Record<string, [Range, Range]> = {
  int16: [-32768, 32767],
  int32: [-2147483648, 2147483647],
  int64: ['-9223372036854775808', '9223372036854775807'],
  int8: [-128, 127],
  uint16: [0, 65535],
  uint32: [0, 4294967295],
  uint64: ['0', '18446744073709551615'],
  uint8: [0, 255],
};

export function getIntegerLimit(
  format: string | undefined,
): IntegerLimit | undefined {
  if (!format) return;
  const range = integerRange[format];
  if (!range) return;
  const errors = rangeErrors(format, range);
  return { maxValue: range[1], minValue: range[0], ...errors };
}
