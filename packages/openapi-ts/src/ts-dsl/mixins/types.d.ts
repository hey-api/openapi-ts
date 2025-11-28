import type { TsDsl } from '../base';

export type BaseCtor<T> = abstract new (...args: any[]) => TsDsl<T>;
export type MixinCtor<T extends BaseCtor<any>, K> = abstract new (
  ...args: any[]
) => InstanceType<T> & K;
