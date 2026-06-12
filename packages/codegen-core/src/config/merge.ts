import type { AnyObject } from '@hey-api/types';

// TODO: move to @hey-api/utils
function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// TODO: move to @hey-api/utils
export function mergeConfigs<T extends AnyObject>(
  configA: T | undefined,
  configB: T | undefined,
): T {
  const a = (configA || {}) as AnyObject;
  const b = (configB || {}) as AnyObject;

  const result: AnyObject = { ...a };

  for (const key of Object.keys(b)) {
    const valueA = a[key];
    const valueB = b[key];

    if (isPlainObject(valueA) && isPlainObject(valueB)) {
      result[key] = mergeConfigs(valueA, valueB);
    } else {
      result[key] = valueB;
    }
  }

  return result as T;
}
