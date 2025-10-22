import type { FromRefs, ToRefs } from '../types/refs';

/**
 * Wraps a single value in a Ref object.
 *
 * @example
 * ```ts
 * const r = toRef(123); // { value: 123 }
 * console.log(r.value); // 123
 * ```
 */
export const toRef = <T>(value: T): { value: T } => ({ value });

/**
 * Unwraps a single Ref object to its value.
 *
 * @example
 * ```ts
 * const r = { value: 42 };
 * const n = fromRef(r); // 42
 * console.log(n); // 42
 * ```
 */
export const fromRef = <T>(ref: { value: T }): T => ref.value;

/**
 * Converts an object of Refs back to a plain object (unwraps all refs).
 *
 * @example
 * ```ts
 * const refs = { a: { value: 1 }, b: { value: "x" } };
 * const plain = fromRefs(refs); // { a: 1, b: "x" }
 * ```
 */
export const fromRefs = <T extends ToRefs<Record<string, unknown>>>(
  obj: T,
): FromRefs<T> => {
  const result = {} as FromRefs<T>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = fromRef(obj[key]!) as (typeof result)[typeof key];
    }
  }
  return result;
};

/**
 * Converts a plain object to an object of Refs (deep, per property).
 *
 * @example
 * ```ts
 * const obj = { a: 1, b: "x" };
 * const refs = toRefs(obj); // { a: { value: 1 }, b: { value: "x" } }
 * ```
 */
export const toRefs = <T extends Record<string, unknown>>(
  obj: T,
): ToRefs<T> => {
  const result = {} as ToRefs<T>;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = toRef(obj[key]);
    }
  }
  return result;
};
