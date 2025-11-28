import type { AnalysisContext, Node } from '@hey-api/codegen-core';
import type ts from 'typescript';

import type { AttrCtor, AttrRight, AttrTsDsl } from '../expr/attr';
import type { AwaitCtor, AwaitTsDsl } from '../expr/await';
import type { CallArgs, CallCtor, CallTsDsl } from '../expr/call';
import type { ReturnCtor, ReturnTsDsl } from '../stmt/return';
import type { BaseCtor, MixinCtor } from './types';

let attrFactory: AttrCtor | undefined;
/** Lazy register the factory to avoid circular imports. */
export function setAttrFactory(fn: AttrCtor): void {
  attrFactory = fn;
}

let awaitFactory: AwaitCtor | undefined;
/** Lazy register the factory to avoid circular imports. */
export function setAwaitFactory(fn: AwaitCtor): void {
  awaitFactory = fn;
}

let callFactory: CallCtor | undefined;
/** Lazy register the factory to avoid circular imports. */
export function setCallFactory(fn: CallCtor): void {
  callFactory = fn;
}

let returnFactory: ReturnCtor | undefined;
/** Lazy register the factory to avoid circular imports. */
export function setReturnFactory(fn: ReturnCtor): void {
  returnFactory = fn;
}

export interface ExprMethods extends Node {
  /** Accesses a property on the current expression (e.g. `this.foo`). */
  attr(name: AttrRight): AttrTsDsl;
  /** Awaits the current expression (e.g. `await expr`). */
  await(): AwaitTsDsl;
  /** Calls the current expression (e.g. `fn(arg1, arg2)`). */
  call(...args: CallArgs): CallTsDsl;
  /** Produces a `return` statement returning the current expression. */
  return(): ReturnTsDsl;
}

export function ExprMixin<T extends ts.Expression, TBase extends BaseCtor<T>>(
  Base: TBase,
) {
  abstract class Expr extends Base {
    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected attr(name: AttrRight): AttrTsDsl {
      return attrFactory!(this, name);
    }

    protected await(): AwaitTsDsl {
      return awaitFactory!(this);
    }

    protected call(...args: CallArgs): CallTsDsl {
      return callFactory!(this, ...args);
    }

    protected return(): ReturnTsDsl {
      return returnFactory!(this);
    }
  }

  return Expr as unknown as MixinCtor<TBase, ExprMethods>;
}
