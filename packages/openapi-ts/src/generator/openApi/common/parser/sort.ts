/**
 * Sort list of values and ensure that required parameters are first so that we do not generate
 * invalid types. Optional parameters cannot be positioned after required ones.
 */
export function toSortedByRequired<
  T extends { default?: unknown; isRequired: boolean },
>(values: T[]): T[] {
  return values.sort((a, b) => {
    const aNeedsValue = a.isRequired && a.default === undefined;
    const bNeedsValue = b.isRequired && b.default === undefined;
    if (aNeedsValue && !bNeedsValue) return -1;
    if (bNeedsValue && !aNeedsValue) return 1;
    return 0;
  });
}
