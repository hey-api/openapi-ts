import type { TypeScriptFile } from '../generate/files';

export type ExtractWithDiscriminator<T, Discriminator> = T extends Discriminator
  ? T
  : never;

/**
 * Accepts an array of elements union and attempts to extract only objects.
 * For example, Array<string | number | { id: string }> would result in
 * Array<{ id: string }>.
 */
export type ExtractArrayOfObjects<T, Discriminator> =
  T extends Array<infer U>
    ? Array<ExtractWithDiscriminator<U, Discriminator>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<ExtractWithDiscriminator<U, Discriminator>>
      : never;

export type Files = Record<string, TypeScriptFile>;

/**
 * Transforms an array of objects into an optional object map.
 * For example, Array<{ id: string }> would result in
 * { [key: string]?: { id: string } }
 */
export type ArrayOfObjectsToObjectMap<
  T extends ReadonlyArray<Record<string, any>>,
  D extends keyof T[number],
> = {
  [K in T[number][D]]?: Extract<T[number], Record<D, K>>;
};
