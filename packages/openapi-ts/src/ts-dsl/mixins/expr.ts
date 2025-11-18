import type ts from 'typescript';

import type { MaybeTsDsl } from '../base';
import type { AttrTsDsl } from '../expr/attr';
import type { AwaitTsDsl } from '../expr/await';
import type { CallTsDsl } from '../expr/call';
import type { ReturnTsDsl } from '../stmt/return';

type AttrFactory = (
  expr: string | MaybeTsDsl<ts.Expression>,
  name: string | ts.MemberName | number,
) => AttrTsDsl;
let attrFactory: AttrFactory | undefined;
/** Registers the Attr DSL factory after its module has finished evaluating. */
export function registerLazyAccessAttrFactory(factory: AttrFactory): void {
  attrFactory = factory;
}

type AwaitFactory = (expr: string | MaybeTsDsl<ts.Expression>) => AwaitTsDsl;
let awaitFactory: AwaitFactory | undefined;
/** Registers the Await DSL factory after its module has finished evaluating. */
export function registerLazyAccessAwaitFactory(factory: AwaitFactory): void {
  awaitFactory = factory;
}

type CallFactory = (
  expr: string | MaybeTsDsl<ts.Expression>,
  args: ReadonlyArray<string | MaybeTsDsl<ts.Expression> | undefined>,
) => CallTsDsl;
let callFactory: CallFactory | undefined;
/** Registers the Call DSL factory after its module has finished evaluating. */
export function registerLazyAccessCallFactory(factory: CallFactory): void {
  callFactory = factory;
}

type ReturnFactory = (expr: string | MaybeTsDsl<ts.Expression>) => ReturnTsDsl;
let returnFactory: ReturnFactory | undefined;
/** Registers the Return DSL factory after its module has finished evaluating. */
export function registerLazyAccessReturnFactory(factory: ReturnFactory): void {
  returnFactory = factory;
}

export class ExprMixin {
  /** Accesses a property on the current expression (e.g. `this.foo`). */
  attr(
    this: string | MaybeTsDsl<ts.Expression>,
    name: string | ts.MemberName | number,
  ): AttrTsDsl {
    return attrFactory!(this, name);
  }

  /** Awaits the current expression (e.g. `await expr`). */
  await(this: string | MaybeTsDsl<ts.Expression>): AwaitTsDsl {
    return awaitFactory!(this);
  }

  /** Calls the current expression (e.g. `fn(arg1, arg2)`). */
  call(
    this: string | MaybeTsDsl<ts.Expression>,
    ...args: ReadonlyArray<string | MaybeTsDsl<ts.Expression> | undefined>
  ): CallTsDsl {
    return callFactory!(this, args);
  }

  /** Produces a `return` statement returning the current expression. */
  return(this: string | MaybeTsDsl<ts.Expression>): ReturnTsDsl {
    return returnFactory!(this);
  }
}
