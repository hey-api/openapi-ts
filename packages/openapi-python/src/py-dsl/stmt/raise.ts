import type { AnalysisContext } from '@hey-api/codegen-core';

import { py } from '../../ts-python';
import type { MaybePyDsl } from '../base';
import { PyDsl } from '../base';
// import { LiteralPyDsl } from '../expr/literal';

const Mixed = PyDsl<py.RaiseStatement>;

export class RaisePyDsl extends Mixed {
  readonly '~dsl' = 'RaisePyDsl';

  protected _error?: string | MaybePyDsl<py.Expression>;
  // protected msg?: string | MaybePyDsl<py.Expression>;

  constructor(error?: string | MaybePyDsl<py.Expression>) {
    super();
    this._error = error;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this._error);
    // ctx.analyze(this.msg);
  }

  // /** Sets the message argument for the exception (e.g. `raise ValueError('msg')`). */
  // message(value: string | MaybePyDsl<py.Expression>): this {
  //   this.msg = value;
  //   return this;
  // }

  override toAst() {
    // Python's `raise` can be bare (re-raise), or `raise <expr>`.
    // Unlike JS `throw new Error(msg)`, Python uses `raise ErrorType(msg)` directly,
    // so the caller constructs the call expression themselves.
    const errorNode = this._error ? this.$node(this._error) : undefined;
    return py.factory.createRaiseStatement(errorNode);
  }
}
