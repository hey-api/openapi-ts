export const COERCER = Symbol('coercer');

export type Coercer<In = any, Out = any, TContext = unknown> = {
  readonly [COERCER]: (value: In, context: TContext) => Out;
};

/**
 * Wraps a function as a coercer — a field-level resolver that receives the
 * raw user value and optional context, and returns the resolved field value.
 *
 * Unlike plain defaults, coercers run unconditionally on every resolution,
 * giving full control over the output regardless of what the user provides.
 *
 * Use when a field's resolved value requires computation, context access,
 * or delegation to another config normalizer.
 *
 * @param fn - Receives the raw input value and resolution context, returns
 * the resolved field value.
 *
 * @example
 * ```ts
 * // Delegate watch resolution to a nested config normalizer
 * watch: coerce((value) => watchConfig(value)),
 *
 * // Resolve a field from context
 * output: coerce((value, ctx) => value ?? ctx.defaultOutput),
 * ```
 */
export function coerce<In, Out, TContext = unknown>(
  fn: (value: In, context: TContext) => Out,
): Coercer<In, Out, TContext> {
  return { [COERCER]: fn };
}

export function isCoercer(value: unknown): value is Coercer {
  return (
    (typeof value === 'object' || typeof value === 'function') && value !== null && COERCER in value
  );
}
