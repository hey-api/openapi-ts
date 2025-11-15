import type ts from 'typescript';

import type { AsTsDsl } from '../as';
import type { AttrTsDsl } from '../attr';
import type { AwaitTsDsl } from '../await';
import type { MaybeTsDsl, TypeTsDsl, WithString } from '../base';
import type { CallTsDsl } from '../call';
import type { ReturnTsDsl } from '../return';

/**
 * Access helpers depend on other DSL classes that are initialized later in the
 * module graph. We store factory callbacks here and let each class lazily
 * register its own implementation once it has finished evaluation. This keeps
 * mixin application order predictable and avoids circular import crashes.
 */

type AsFactory = (
  expr: MaybeTsDsl<WithString>,
  type: WithString<TypeTsDsl>,
) => AsTsDsl;
let asFactory: AsFactory | undefined;
/** Registers the Attr DSL factory after its module has finished evaluating. */
export function registerLazyAccessAsFactory(factory: AsFactory): void {
  asFactory = factory;
}

type AttrFactory = (
  expr: MaybeTsDsl<WithString>,
  name: WithString<ts.MemberName> | number,
) => AttrTsDsl;
let attrFactory: AttrFactory | undefined;
/** Registers the Attr DSL factory after its module has finished evaluating. */
export function registerLazyAccessAttrFactory(factory: AttrFactory): void {
  attrFactory = factory;
}

type AwaitFactory = (expr: MaybeTsDsl<WithString>) => AwaitTsDsl;
let awaitFactory: AwaitFactory | undefined;
/** Registers the Await DSL factory after its module has finished evaluating. */
export function registerLazyAccessAwaitFactory(factory: AwaitFactory): void {
  awaitFactory = factory;
}

type CallFactory = (
  expr: MaybeTsDsl<WithString>,
  args: ReadonlyArray<MaybeTsDsl<WithString> | undefined>,
) => CallTsDsl;
let callFactory: CallFactory | undefined;
/** Registers the Call DSL factory after its module has finished evaluating. */
export function registerLazyAccessCallFactory(factory: CallFactory): void {
  callFactory = factory;
}

type ReturnFactory = (expr: MaybeTsDsl<WithString>) => ReturnTsDsl;
let returnFactory: ReturnFactory | undefined;
/** Registers the Return DSL factory after its module has finished evaluating. */
export function registerLazyAccessReturnFactory(factory: ReturnFactory): void {
  returnFactory = factory;
}

export class ExprMixin {
  /** Creates an `as` type assertion expression (e.g. `value as Type`). */
  as(this: MaybeTsDsl<WithString>, type: WithString<TypeTsDsl>): AsTsDsl {
    return asFactory!(this, type);
  }

  /** Accesses a property on the current expression (e.g. `this.foo`). */
  attr(
    this: MaybeTsDsl<WithString>,
    name: WithString<ts.MemberName> | number,
  ): AttrTsDsl {
    return attrFactory!(this, name);
  }

  /** Awaits the current expression (e.g. `await expr`). */
  await(this: MaybeTsDsl<WithString>): AwaitTsDsl {
    return awaitFactory!(this);
  }

  /** Calls the current expression (e.g. `fn(arg1, arg2)`). */
  call(
    this: MaybeTsDsl<WithString>,
    ...args: ReadonlyArray<MaybeTsDsl<WithString> | undefined>
  ): CallTsDsl {
    return callFactory!(this, args);
  }

  /** Produces a `return` statement returning the current expression. */
  return(this: MaybeTsDsl<WithString>): ReturnTsDsl {
    return returnFactory!(this);
  }
}
