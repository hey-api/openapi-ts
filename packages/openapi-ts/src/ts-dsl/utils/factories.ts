import type { AsCtor } from '../expr/as';
import type { AttrCtor } from '../expr/attr';
import type { AwaitCtor } from '../expr/await';
import type { CallCtor } from '../expr/call';
import type { TypeOfExprCtor } from '../expr/typeof';
import type { ReturnCtor } from '../stmt/return';
import type { TypeExprCtor } from '../type/expr';
import type { TypeIdxCtor } from '../type/idx';
import type { TypeOperatorCtor } from '../type/operator';
import type { TypeQueryCtor } from '../type/query';

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
  /** Factory for creating `as` type assertion expressions (e.g. `value as Type`). */
  as: createFactory<AsCtor>('as'),

  /** Factory for creating property access expressions (e.g. `obj.foo`). */
  attr: createFactory<AttrCtor>('attr'),

  /** Factory for creating await expressions (e.g. `await promise`). */
  await: createFactory<AwaitCtor>('await'),

  /** Factory for creating function or method call expressions (e.g. `fn(arg)`). */
  call: createFactory<CallCtor>('call'),

  /** Factory for creating return statements. */
  return: createFactory<ReturnCtor>('return'),

  /** Factories for creating type nodes. */
  type: {
    /** Factory for creating basic type references or type expressions (e.g. Foo or Foo<T>). */
    expr: createFactory<TypeExprCtor>('type.expr'),

    /** Factory for creating indexed-access types (e.g. `Foo<T>[K]`). */
    idx: createFactory<TypeIdxCtor>('type.idx'),

    /** Factory for creating type operator nodes (e.g. `readonly T`, `keyof T`, `unique T`). */
    operator: createFactory<TypeOperatorCtor>('type.operator'),

    /** Factory for creating type query nodes (e.g. `typeof Foo`). */
    query: createFactory<TypeQueryCtor>('type.query'),
  },

  /** Factory for creating `typeof` expressions (e.g. `typeof value`). */
  typeofExpr: createFactory<TypeOfExprCtor>('typeofExpr'),
};
