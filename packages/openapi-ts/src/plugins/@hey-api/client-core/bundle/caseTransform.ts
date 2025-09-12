import type { StringCase } from '../../../../types/case';
import { stringCase } from '../../../../utils/stringCase';

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (value === null || typeof value !== 'object') return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
};

export const transformKeysDeep = (
  value: unknown,
  mapKey: (key: string) => string,
): unknown => {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => transformKeysDeep(item, mapKey));
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const input = value as Record<string, unknown>;
  const output: Record<string, unknown> = {};

  for (const key in input) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
    const newKey = mapKey(key);
    output[newKey] = transformKeysDeep(input[key], mapKey);
  }

  return output;
};

export const toCase =
  (targetCase: StringCase) =>
  (name: string): string =>
    stringCase({ case: targetCase, value: name });
