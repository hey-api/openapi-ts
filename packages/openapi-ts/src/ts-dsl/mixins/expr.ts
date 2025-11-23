import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import type { AttrTsDsl } from '../expr/attr';
import type { AwaitTsDsl } from '../expr/await';
import type { CallTsDsl } from '../expr/call';
import type { ReturnTsDsl } from '../stmt/return';
import type { BaseCtor, MixinCtor } from './types';

type AttrFactory = (
  expr: MaybeTsDsl<ts.Expression>,
  name: string | ts.MemberName | number,
) => AttrTsDsl;
let attrFactory: AttrFactory | undefined;
/** Registers the Attr DSL factory after its module has finished evaluating. */
export function registerLazyAccessAttrFactory(factory: AttrFactory): void {
  attrFactory = factory;
}

type AwaitFactory = (expr: MaybeTsDsl<ts.Expression>) => AwaitTsDsl;
let awaitFactory: AwaitFactory | undefined;
/** Registers the Await DSL factory after its module has finished evaluating. */
export function registerLazyAccessAwaitFactory(factory: AwaitFactory): void {
  awaitFactory = factory;
}

type CallFactory = (
  expr: MaybeTsDsl<ts.Expression>,
  args: ReadonlyArray<string | MaybeTsDsl<ts.Expression> | undefined>,
) => CallTsDsl;
let callFactory: CallFactory | undefined;
/** Registers the Call DSL factory after its module has finished evaluating. */
export function registerLazyAccessCallFactory(factory: CallFactory): void {
  callFactory = factory;
}

type ReturnFactory = (expr: MaybeTsDsl<ts.Expression>) => ReturnTsDsl;
let returnFactory: ReturnFactory | undefined;
/** Registers the Return DSL factory after its module has finished evaluating. */
export function registerLazyAccessReturnFactory(factory: ReturnFactory): void {
  returnFactory = factory;
}

export interface ExprMethods {
  /** Accesses a property on the current expression (e.g. `this.foo`). */
  attr(name: string | ts.MemberName | number): AttrTsDsl;
  /** Awaits the current expression (e.g. `await expr`). */
  await(): AwaitTsDsl;
  /** Calls the current expression (e.g. `fn(arg1, arg2)`). */
  call(
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression> | undefined>
  ): CallTsDsl;
  /** Produces a `return` statement returning the current expression. */
  return(): ReturnTsDsl;
}

export function ExprMixin<T extends ts.Expression, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Expr extends Base {
    protected attr(name: string | ts.MemberName | number): AttrTsDsl {
      return attrFactory!(this, name);
    }

    protected await(): AwaitTsDsl {
      return awaitFactory!(this);
    }

    protected call(
      ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression> | undefined>
    ): CallTsDsl {
      return callFactory!(this, args);
    }

    protected return(): ReturnTsDsl {
      return returnFactory!(this);
    }
  }

  return Expr as unknown as MixinCtor<TBase, ExprMethods>;
}
