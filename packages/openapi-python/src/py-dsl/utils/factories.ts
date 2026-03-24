import type { AttrCtor } from '../expr/attr';
import type { CallCtor } from '../expr/call';
import type { SubscriptCtor } from '../expr/subscript';
import type { ReturnCtor } from '../stmt/return';

type Ctor = (...args: Array<any>) => any;

type Factory<T extends Ctor> = {
  (...args: Parameters<T>): ReturnType<T>;
  /** Sets the implementation of this factory. */
  set(fn: T): void;
};

function createFactory<T extends Ctor>(name: string): Factory<T> {
  let impl: T | undefined;

  const slot = ((...args: Parameters<T>) => {
    if (!impl) throw new Error(`${name} factory not registered`);
    return impl(...args);
  }) as Factory<T>;

  slot.set = (fn: T) => {
    impl = fn;
  };

  return slot;
}

export const f = {
  /** Factory for creating property access expressions (e.g. `obj.foo`). */
  attr: createFactory<AttrCtor>('attr'),

  /** Factory for creating function or method call expressions (e.g. `fn(arg)`). */
  call: createFactory<CallCtor>('call'),

  /** Factory for creating return statements. */
  return: createFactory<ReturnCtor>('return'),

  /** Factory for creating slice expressions. */
  slice: createFactory<SubscriptCtor>('slice'),
};
