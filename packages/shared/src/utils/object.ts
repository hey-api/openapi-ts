import type { AnyObject } from '@hey-api/types';

// TODO: move to @hey-api/utils
export function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

// TODO: move to @hey-api/utils
export function deepMerge<T extends AnyObject | Array<unknown>>(target: T, source: T): T {
  if (isPlainObject(target) && isPlainObject(source)) {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (key in target) {
        result[key] = deepMerge(target[key] as T, source[key] as T);
      } else {
        result[key] = source[key];
      }
    }
    return result as T;
  }

  return source;
}
