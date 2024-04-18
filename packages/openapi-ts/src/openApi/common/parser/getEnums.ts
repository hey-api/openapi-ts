import { unique } from '../../../utils/unique';
import type { Enum } from '../interfaces/client';
import type { WithEnumExtension } from '../interfaces/WithEnumExtension';

export const getEnums = (
  definition: WithEnumExtension,
  values?: ReadonlyArray<string | number>,
): Enum[] => {
  if (!Array.isArray(values)) {
    return [];
  }

  const descriptions = (definition['x-enum-descriptions'] ?? []).filter(
    (value) => typeof value === 'string',
  );
  const names = (
    definition['x-enum-varnames'] ??
    definition['x-enumNames'] ??
    []
  ).filter((value) => typeof value === 'string');

  return values
    .filter(unique)
    .filter((value) => typeof value === 'number' || typeof value === 'string')
    .map((value, index) => ({
      customDescription: descriptions[index],
      customName: names[index],
      description: undefined,
      value,
    }));
};
