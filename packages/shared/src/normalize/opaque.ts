export const OPAQUE = Symbol('opaque');

export type Opaque<T> = {
  readonly [OPAQUE]: T;
  readonly fallback?: (input: unknown) => unknown;
};

/**
 * Marks a field as opaque — its value is assigned as-is without being
 * recursed into or merged as config fields.
 *
 * Use when a field accepts an arbitrary object that should not be treated
 * as a nested config table.
 *
 * @param defaultValue - The value to use when no input is provided.
 * @param fallback - Optional. Called with the full table input when the field
 * is absent from the input object. Return `undefined` to fall back to
 * `defaultValue`.
 *
 * @example
 * ```ts
 * path: opaque<string | object>('', (input) =>
 *   input && typeof input === 'object' && !('path' in input)
 *     ? input
 *     : undefined
 * ),
 * ```
 */
export function opaque<T>(
  defaultValue: T,
  fallback?: (input: unknown) => T | undefined,
): Opaque<T> {
  return fallback ? { [OPAQUE]: defaultValue, fallback } : { [OPAQUE]: defaultValue };
}

export function isOpaque(value: unknown): value is Opaque<unknown> {
  return typeof value === 'object' && value !== null && OPAQUE in value;
}
