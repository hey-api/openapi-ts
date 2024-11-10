import { refToName } from '../../../utils/ref';

export const discriminatorValue = (
  $ref: string,
  mapping?: Record<string, string>,
) => {
  for (const name in mapping) {
    const refMapped = mapping[name];
    if (refMapped === $ref) {
      return name;
    }
  }
  return refToName($ref);
};
