import type { GeneratedFile } from '../generate/file';

/** Recursively make all non-function properties optional */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends (...args: any[]) => any
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

export type Files = Record<string, GeneratedFile>;

export type LazyOrAsync<T> = T | (() => T) | (() => Promise<T>);

export type MaybeArray<T> = T | ReadonlyArray<T>;
