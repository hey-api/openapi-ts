import { AttrTsDsl } from '../attr';
import type { MaybeTsDsl, WithString } from '../base';
import { CallTsDsl } from '../call';

export class AccessMixin {
  /** Accesses a property on the current expression (e.g. `this.foo`). */
  attr(this: MaybeTsDsl<WithString>, name: string | number): AttrTsDsl {
    return new AttrTsDsl(this, name);
  }
  /** Calls the current expression as a function (e.g. `fn(arg1, arg2)`). */
  call(
    this: MaybeTsDsl<WithString>,
    ...args: ReadonlyArray<MaybeTsDsl<WithString>>
  ): CallTsDsl {
    return new CallTsDsl(this, ...args);
  }
}
