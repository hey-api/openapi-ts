/**
 * Specification Extensions.
 *
 * See {@link https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#specification-extensions Specification Extensions}.
 */
export interface SpecExtensions {
  [extension: `x-${string}`]: unknown;
}

/**
 * Type utility to wrap any type with specification extensions.
 */
export type WithSpecExtensions<T> = T & SpecExtensions;
