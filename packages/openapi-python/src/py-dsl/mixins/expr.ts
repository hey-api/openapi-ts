import type { AnalysisContext, Node } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import { f } from '../utils/factories';
import type { BaseCtor, DropFirst, MixinCtor } from './types';

export interface ExprMethods extends Node {
  /** Accesses a property on the current expression (e.g. `this.foo`). */
  attr(...args: DropFirst<Parameters<typeof f.attr>>): ReturnType<typeof f.attr>;
  /** Calls the current expression (e.g. `fn(arg1, arg2)`). */
  call(...args: DropFirst<Parameters<typeof f.call>>): ReturnType<typeof f.call>;
  /** Produces a `return` statement returning the current expression. */
  return(): ReturnType<typeof f.return>;
  /** Produces a subscript/slice expression (e.g. `expr[args]`). */
  slice(...args: DropFirst<Parameters<typeof f.slice>>): ReturnType<typeof f.slice>;
}

export function ExprMixin<T extends py.Expression, TBase extends BaseCtor<T>>(Base: TBase) {
  abstract class Expr extends Base {
    override analyze(ctx: AnalysisContext): void {
      super.analyze(ctx);
    }

    protected attr(...args: DropFirst<Parameters<typeof f.attr>>): ReturnType<typeof f.attr> {
      // @ts-expect-error - fix this type
      return f.attr(this, ...args);
    }

    protected call(...args: DropFirst<Parameters<typeof f.call>>): ReturnType<typeof f.call> {
      // @ts-expect-error - fix this type
      return f.call(this, ...args);
    }

    protected return(): ReturnType<typeof f.return> {
      // @ts-expect-error - fix this type
      return f.return(this);
    }

    protected slice(...args: DropFirst<Parameters<typeof f.slice>>): ReturnType<typeof f.slice> {
      // @ts-expect-error - fix this type
      return f.slice(this, ...args);
    }
  }

  return Expr as unknown as MixinCtor<TBase, ExprMethods>;
}
