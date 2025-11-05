import type ts from 'typescript';

import { AttrTsDsl } from '../attr';
import type { ExprInput, MaybeTsDsl, TsDsl } from '../base';
import { CallTsDsl } from '../call';

export class AccessMixin {
  /** Accesses a property on the current expression (e.g. `this.foo`). */
  attr(this: TsDsl<ts.Expression>, name: string): AttrTsDsl {
    return new AttrTsDsl(this, name);
  }
  /** Calls the current expression as a function (e.g. `fn(arg1, arg2)`). */
  call(
    this: TsDsl<ts.Expression>,
    ...args: ReadonlyArray<MaybeTsDsl<ExprInput>>
  ): CallTsDsl {
    return new CallTsDsl(this, ...args);
  }
}
