import type { py } from '../../ts-python';
import type { PyDsl } from '../base';

export type BaseCtor<T extends py.Node> = abstract new (...args: Array<any>) => PyDsl<T>;

export type DropFirst<T extends Array<any>> = T extends [any, ...infer Rest] ? Rest : never;

export type MixinCtor<T extends BaseCtor<any>, K> = abstract new (
  ...args: Array<any>
) => InstanceType<T> & K;
