import type { TypeScriptFile } from '../compiler';

type ExtractFromArray<T, Discriminator> = T extends Discriminator
  ? Required<T>
  : never;

/**
 * Accepts an array of elements union and attempts to extract only objects.
 * For example, Array<string | number | { id: string }> would result in
 * Array<{ id: string }>.
 */
export type ExtractArrayOfObjects<T, Discriminator> =
  T extends Array<infer U>
    ? Array<ExtractFromArray<U, Discriminator>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<ExtractFromArray<U, Discriminator>>
      : never;

export type Files = Record<string, TypeScriptFile>;
