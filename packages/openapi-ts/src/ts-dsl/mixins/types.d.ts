import type { TsDsl } from '../base';

export type BaseCtor<T> = abstract new (...args: Array<any>) => TsDsl<T>;

export type DropFirst<T extends Array<any>> = T extends [any, ...infer Rest]
  ? Rest
  : never;

export type MixinCtor<T extends BaseCtor<any>, K> = abstract new (
  ...args: Array<any>
) => InstanceType<T> & K;
