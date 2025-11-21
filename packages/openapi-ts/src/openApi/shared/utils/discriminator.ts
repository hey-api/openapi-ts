import { refToName } from '~/utils/ref';

export const discriminatorValues = (
  $ref: string,
  mapping?: Record<string, string>,
  shouldUseRefAsValue?: () => boolean,
): ReadonlyArray<string> => {
  const values: Array<string> = [];

  // If no mapping is provided, return empty array
  // The discriminator property should already be defined in the referenced schemas
  if (!mapping) {
    return values;
  }

  for (const name in mapping) {
    if (mapping[name] === $ref) {
      values.push(name);
    }
  }

  if (!values.length && (!shouldUseRefAsValue || shouldUseRefAsValue())) {
    return [refToName($ref)];
  }

  return values;
};
