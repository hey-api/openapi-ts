import type { AnalysisContext } from '@hey-api/codegen-core';

import type { py } from '../../ts-python';
import { PyDsl } from '../base';
import type { PyDslContext } from './context';
import { ctx } from './context';

export type LazyThunk<T extends py.Node> = (ctx: PyDslContext) => PyDsl<T>;

export class LazyPyDsl<T extends py.Node = py.Node> extends PyDsl<T> {
  readonly '~dsl' = 'LazyPyDsl';

  private _thunk: LazyThunk<T>;

  constructor(thunk: LazyThunk<T>) {
    super();
    this._thunk = thunk;
  }

  override analyze(ctx: AnalysisContext): void {
    super.analyze(ctx);
    ctx.analyze(this.toResult());
  }

  toResult(): PyDsl<T> {
    return this._thunk(ctx);
  }

  override toAst() {
    return this.toResult().toAst();
  }
}
