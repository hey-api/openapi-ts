import { isPlainObject } from '../utils/object';
import type { Coercer } from './coerce';
import { COERCER, isCoercer } from './coerce';
import { isOpaque, OPAQUE } from './opaque';

export type CoercerMap<TShape extends object = object> = {
  boolean?: (value: boolean) => Partial<TShape>;
  function?: (value: (...args: Array<any>) => any) => Partial<TShape>;
  number?: (value: number) => Partial<TShape>;
  string?: (value: string) => Partial<TShape>;
};

export type CoercionEvent =
  | { type: 'boolean'; value: boolean }
  | { type: 'function'; value: (...args: Array<any>) => any }
  | { type: 'number'; value: number }
  | { type: 'object'; value: Record<string, any> }
  | { type: 'string'; value: string };

export type TableDirectives<TShape extends object = object, TInput = unknown> = {
  /**
   * Keys resolved first, in order. Their resolved values are available as
   * context to all subsequent fields in the same table.
   *
   * @example
   * ```ts
   * $cascade: ['strategy'],
   * strategy: 'flat',
   * methodName: coerce((value, context) => ({
   *   casing: 'camelCase',
   *   name: context.strategy === 'flat' ? '{{name}}Request' : undefined,
   * })),
   * ```
   */
  readonly $cascade?: ReadonlyArray<keyof TShape & string>;
  /**
   * Per-type coercers. Each handler receives the raw user input of the matching
   * type and returns a partial object merged into the resolved config.
   * Applied after `$coerceAny`.
   *
   * @example
   * ```ts
   * $coerce: {
   *   string: (v) => ({ name: v }),
   *   function: (v) => ({ name: v }),
   * }
   * ```
   */
  $coerce?: CoercerMap<TShape>;
  /**
   * Fires for any non-`undefined` input before type-specific `$coerce` handlers.
   *
   * @example
   * ```ts
   * $coerceAny: ({ type, value }) => ({ enabled: Boolean(value) })
   * ```
   */
  $coerceAny?: (event: CoercionEvent) => Partial<TShape>;
  /**
   * Fields whose resolved string values are registered as plugin dependencies
   * after this table is resolved.
   *
   * @example
   * ```ts
   * $dependencies: ['client'],
   * client: coerce((value, context) => context.resolveTag('client')),
   * ```
   */
  readonly $dependencies?: ReadonlyArray<keyof TShape & string>;
  /**
   * Runs after all fields in this scope have been resolved.
   * Use for cross-field fixups that depend on multiple resolved values.
   *
   * @example
   * ```ts
   * $finalize(config) {
   *   if (config.output === 'cjs' && config.format === undefined) {
   *     config.format = 'commonjs';
   *   }
   * }
   * ```
   */
  $finalize?: (config: TShape, input: TInput) => void;
};

export type WithCoercers<T> = [T] extends [(...args: Array<any>) => any]
  ? T | Coercer<any, T, unknown>
  : [T] extends [object]
    ? ({ [K in keyof T]: WithCoercers<T[K]> } & TableDirectives<T>) | Coercer<any, T, unknown>
    : T | Coercer<any, T, unknown>;

interface ResolveOptions {
  /**
   * Scalar ancestor values from cascade keys (e.g. `case: 'camelCase'`). Only
   * non-plain-object values; they fill missing scalar slots in nested specs.
   */
  ancestor?: Record<string, unknown>;
  /**
   * Values already resolved in an earlier cascade pass, available as read-only
   * context to coercers and nested resolutions.
   */
  context?: Record<string, unknown>;
  /**
   * Resolved values of object cascade keys at this scope. Used as input fallback
   * for sibling fields sharing a cascade key name (e.g. `definitions.types` inherits
   * from a resolved top-level `types` value).
   */
  resolvedCascade?: Record<string, unknown>;
  /**
   * Table-spec ancestors for object-type cascade keys (e.g. `types`). The original
   * spec (with `$coerceAny` / directives intact) so nested fields of the same name
   * are resolved through cascade directives when user input is present.
   */
  specAncestor?: Record<string, Record<string, unknown>>;
}

export function resolveTable(
  input: unknown,
  table: Record<string, unknown> & TableDirectives,
  { ancestor = {}, context = {}, resolvedCascade = {}, specAncestor = {} }: ResolveOptions = {},
): Record<string, unknown> {
  const { $cascade: cascadeKeys = [], $coerce, $coerceAny, $finalize, ...entries } = table;

  const result: Record<string, unknown> = {};

  for (const [key, defaultVal] of Object.entries(entries)) {
    if (!isCoercer(defaultVal) && !isPlainObject(defaultVal) && !isOpaque(defaultVal)) {
      result[key] = defaultVal;
    }
  }

  if (input !== undefined && input !== null) {
    if ($coerceAny) {
      Object.assign(result, $coerceAny({ type: typeof input, value: input } as CoercionEvent));
    }

    if (isPlainObject(input)) {
      for (const [key, val] of Object.entries(input)) {
        const defaultVal = entries[key];
        if (!isCoercer(defaultVal) && !isPlainObject(defaultVal) && !isOpaque(defaultVal)) {
          result[key] = val;
        }
      }
    } else {
      const type = typeof input as 'boolean' | 'function' | 'number' | 'string';
      const handler = $coerce?.[type] as ((v: unknown) => Record<string, unknown>) | undefined;
      if (handler) {
        Object.assign(result, handler(input));
      }
    }
  }

  const localContext: Record<string, unknown> = { ...context };
  const cascadeEntryKeys = (cascadeKeys as ReadonlyArray<string>).filter((k) => k in entries);

  const localResolvedCascade: Record<string, unknown> = { ...resolvedCascade };

  for (const key of cascadeKeys) {
    if (!cascadeEntryKeys.includes(key)) {
      localContext[key] = result[key];
    }
  }

  for (const key of cascadeEntryKeys) {
    const userVal = isPlainObject(input) ? input[key] : undefined;
    result[key] = resolveField(entries[key], result[key] ?? userVal, key, {
      ancestor,
      context: localContext,
      resolvedCascade: localResolvedCascade,
      specAncestor,
    });
    localContext[key] = result[key];

    if (isPlainObject(result[key])) {
      localResolvedCascade[key] = result[key];
    }
  }

  for (const [key, defaultVal] of Object.entries(entries)) {
    if (cascadeEntryKeys.includes(key)) continue;

    const userVal = isPlainObject(input) ? input[key] : undefined;

    if (isOpaque(defaultVal)) {
      if (result[key] !== undefined) {
        // already set (e.g. by $coerce.string)
      } else if (userVal !== undefined) {
        result[key] = userVal;
      } else if (defaultVal.fallback) {
        const fallbackResult = defaultVal.fallback(input);
        result[key] = fallbackResult !== undefined ? fallbackResult : defaultVal[OPAQUE];
      } else {
        result[key] = defaultVal[OPAQUE];
      }
      continue;
    }

    result[key] = resolveField(
      defaultVal,
      isCoercer(defaultVal) ? (result[key] ?? userVal) : (userVal ?? result[key]),
      key,
      { ancestor, context: localContext, resolvedCascade: localResolvedCascade, specAncestor },
    );
  }

  $finalize?.(result, input);

  return result;
}

export function collectDeps(
  spec: Record<string, unknown>,
  resolved: Record<string, unknown>,
  deps: Set<string>,
): void {
  const { $dependencies } = spec as Pick<TableDirectives, '$dependencies'>;

  if ($dependencies) {
    for (const key of $dependencies) {
      addDependencyValue(resolved[key], deps);
    }
  }

  for (const [key, specVal] of Object.entries(spec)) {
    if (key.startsWith('$')) continue;
    if (isPlainObject(specVal) && isPlainObject(resolved[key])) {
      collectDeps(specVal, resolved[key], deps);
    }
  }
}

function addDependencyValue(value: unknown, deps: Set<string>): void {
  if (!value) return;

  if (typeof value === 'string') {
    deps.add(value);
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      addDependencyValue(item, deps);
    }
  }
}

function resolveField(
  defaultVal: unknown,
  currentVal: unknown,
  key: string,
  { ancestor, context, resolvedCascade, specAncestor }: Required<ResolveOptions>,
): unknown {
  if (isCoercer(defaultVal)) {
    return defaultVal[COERCER](currentVal, context);
  }

  if (isPlainObject(defaultVal)) {
    const cascadeSpec = specAncestor[key];

    const effectiveTable = cascadeSpec
      ? mergeSpecs(cascadeSpec, defaultVal)
      : mergeAncestorScalars(ancestor, defaultVal);

    const effectiveInput = currentVal !== undefined ? currentVal : resolvedCascade[key];

    return resolveTable(effectiveInput, effectiveTable, {
      ancestor,
      context,
      resolvedCascade,
      specAncestor,
    });
  }

  return currentVal !== undefined ? currentVal : defaultVal;
}

function mergeSpecs(
  cascadeSpec: Record<string, unknown>,
  localSpec: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...localSpec };

  for (const [key, cascadeVal] of Object.entries(cascadeSpec)) {
    if (key === '$coerceAny' || key === '$coerce' || key === '$cascade' || key === '$finalize') {
      if (result[key] === undefined) {
        result[key] = cascadeVal;
      }
      continue;
    }

    const localVal = result[key];
    if (isPlainObject(cascadeVal) && isPlainObject(localVal)) {
      result[key] = mergeSpecs(cascadeVal, localVal);
    }
  }

  return result;
}

function mergeAncestorScalars(
  ancestor: Record<string, unknown>,
  target: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };

  for (const [key, ancestorVal] of Object.entries(ancestor)) {
    if (isPlainObject(ancestorVal)) continue;

    if (result[key] === undefined) {
      result[key] = ancestorVal;
    }
  }

  return result;
}
