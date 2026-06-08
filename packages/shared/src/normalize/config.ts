import { isPlainObject } from '../utils/object';
import type { Coercer } from './coerce';
import { COERCER } from './coerce';
import type { TableDirectives } from './value';
import { resolveTable } from './value';

type ObjectMember<T> =
  Extract<T, Record<string, any>> extends infer O
    ? O extends (...args: Array<any>) => any
      ? never
      : O
    : never;

type TableSpec<Out, In, TContext> = [Out] extends [(...args: Array<any>) => any]
  ? [NonNullable<In>] extends [Out]
    ? Out | Coercer<In, Out, TContext>
    : Coercer<In, Out, TContext>
  :
      | Coercer<In, Out, TContext>
      | ([Out] extends [object]
          ? {
              [K in keyof Out]?: TableSpec<
                Out[K],
                K extends keyof ObjectMember<In> ? ObjectMember<In>[K] : undefined,
                TContext
              >;
            } & TableDirectives<Out, In>
          : [NonNullable<In>] extends [Out]
            ? Out
            : never);

type ConfigTableEntries<TInput, TResolved, TContext = unknown> = {
  [K in keyof TResolved]?: TableSpec<
    TResolved[K],
    K extends keyof ObjectMember<TInput> ? ObjectMember<TInput>[K] : undefined,
    TContext
  >;
};

export type ConfigTable<TInput, TResolved extends object> = ConfigTableEntries<TInput, TResolved> &
  TableDirectives<TResolved, TInput>;

export type ConfigNormalizer<TInput, TResolved extends object> = ((
  config: TInput,
  externalContext?: Record<string, unknown>,
) => TResolved) &
  Coercer<TInput | undefined, TResolved>;

/**
 * Creates a typed config normalizer from a resolution table.
 *
 * @example
 * ```ts
 * const normalizePlugin = defineConfig<PluginInput, PluginResolved>({
 *   $coerce: {
 *     boolean: (enabled) => ({ enabled }),
 *     function: (name) => ({ name, enabled: true }),
 *     string: (name) => ({ name, enabled: true }),
 *   },
 *   enabled: false,
 *   name: '',
 *   output: coerce((val, ctx) => val ?? ctx.defaultOutput),
 * });
 * ```
 */
export function defineConfig<
  TInput = Record<string, unknown>,
  TResolved extends object = Record<string, unknown>,
>(
  table: ConfigTable<TInput, TResolved> | ((config: TInput) => ConfigTable<TInput, TResolved>),
): ConfigNormalizer<TInput, TResolved> {
  function normalize(config: TInput, externalContext?: Record<string, unknown>): TResolved {
    const resolvedTable = typeof table === 'function' ? table(config) : table;

    const { $cascade: cascadeKeys = [], ...entries } = resolvedTable;

    const ancestor: Record<string, unknown> = {};
    const specAncestor: Record<string, Record<string, unknown>> = {};

    for (const key of cascadeKeys as ReadonlyArray<string>) {
      const entrySpec = (entries as Record<string, unknown>)[key];

      if (!(key in entries)) {
        if (isPopulated(config, key)) {
          ancestor[key] = (config as Record<string, unknown>)[key];
        }
        continue;
      }

      if (isPlainObject(entrySpec)) {
        specAncestor[key] = entrySpec as Record<string, unknown>;
      } else {
        const partial = resolveTable(config as Record<string, unknown>, { [key]: entrySpec });
        if (partial[key] !== undefined) {
          ancestor[key] = partial[key];
        }
      }
    }

    const result = resolveTable(
      config,
      resolvedTable as Record<string, unknown> & TableDirectives,
      { ancestor, context: externalContext ?? {}, specAncestor },
    );

    return result as TResolved;
  }

  (normalize as any)[COERCER] = (value: TInput | undefined) => normalize(value as TInput);

  return normalize as ConfigNormalizer<TInput, TResolved>;
}

function isPopulated(config: unknown, key: string): boolean {
  return (
    typeof config === 'object' &&
    config !== null &&
    key in config &&
    (config as Record<string, unknown>)[key] !== undefined
  );
}
