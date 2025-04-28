import { refToName } from '../../../utils/ref';

export const discriminatorValues = (
  $ref: string,
  mapping?: Record<string, string>,
): ReadonlyArray<string> => {
  const values: Array<string> = [];

  for (const name in mapping) {
    if (mapping[name] === $ref) {
      values.push(name);
    }
  }

  if (!values.length) {
    return [refToName($ref)];
  }

  return values;
};
